import { fileURLToPath } from 'node:url';
import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { environment, invoke, isolated, jsonLines, progressCallback } from './cli.js?member=12';

// Model and gateway come from the user's own Codex CLI configuration.
const userConfig = await readFile(path.join(homedir(), '.codex', 'config.toml'), 'utf8').catch(() => '');
const configModel = userConfig.match(/^\s*model\s*=\s*"([^"]+)"/m)?.[1];
export const codexModel = process.env.DISCUSSION_CODEX_MODEL || configModel || 'gpt-5-codex';
// The discussion participant reuses the user's own Codex gateway provider.
const gatewayTokenKey='CODEX_DISCUSSION_GATEWAY_TOKEN';
export async function readGateway(){
 const text=await readFile(path.join(homedir(), '.codex','config.toml'),'utf8').catch(()=>'');
 const block=text.split('[model_providers.custom]')[1]?.split('\n[')[0]??'';
 const field=name=>block.match(new RegExp(`^\\s*${name}\\s*=\\s*"([^"]*)"`,'m'))?.[1];
 const base_url=field('base_url'),token=field('experimental_bearer_token');
 if(!base_url||!token)return undefined;
 return {base_url,token};
}
const executable='codex';
// Templates are copied to a temp file with the configured model slug filled in.
const buildCatalog=policy=>{
 const template=fileURLToPath(new URL(`./codex-${policy}-models.json`,import.meta.url));
 const data=JSON.parse(readFileSync(template,'utf8'));
 data.models=data.models.map(model=>({...model,slug:codexModel,display_name:codexModel}));
 const file=path.join(tmpdir(),`dsh-discussion-${policy}-${codexModel.replace(/[^\w.-]/g,'_')}.json`);
 writeFileSync(file,JSON.stringify(data));
 return file;
};
const catalog=buildCatalog('discussion');
const workspaceCatalog=buildCatalog('workspace');
export const disabledFeatures=['shell_tool','shell_snapshot','shell_snapshot_v2','view_image','multi_agent','multi_agent_v2','code_mode','code_mode_only','code_mode_host','tool_suggest','image_generation','memories','request_permissions_tool','token_budget','current_time_reminder','sleep_tool','deferred_executor','standalone_web_search','apps','plugins','hooks','browser_use','browser_use_external','computer_use','in_app_browser','in_app_chat','in_app_local_automation','goals','artifact','workspace_dependencies','skill_search','skill_mcp_dependency_install','remote_plugin','auth_elicitation','tool_call_mcp_elicitation'];
export function codexArgs(images=[],{workspace,gateway}={}){
 const local=workspace!==undefined;
 const config={'model_catalog_json':local?workspaceCatalog:catalog,'approval_policy':'never','web_search':'disabled','tools.update_plan.enabled':false,'tools.experimental_request_user_input.enabled':false,'mcp_servers':{},'apps._default.enabled':false,'analytics.enabled':false,'project_doc_max_bytes':0,'skills.implicit_invocation':false,'include_environment_context':false,'model_reasoning_effort':'low','model_instructions_file':undefined};
 const args=['exec','--ignore-user-config','--ignore-rules','--ephemeral','--skip-git-repo-check','--json','--sandbox',local?'workspace-write':'read-only','--model',codexModel];
 if(local)args.push('--cd',workspace);
 if(gateway)args.push('-c','model_provider="custom"','-c','model_providers.custom.name="custom"','-c','model_providers.custom.wire_api="responses"','-c',`model_providers.custom.env_key="${gatewayTokenKey}"`,'-c','model_providers.custom.requires_openai_auth=false','-c',`model_providers.custom.base_url=${JSON.stringify(gateway.base_url)}`);
 for(const [k,v] of Object.entries(config))if(v!==undefined)args.push('-c',`${k}=${JSON.stringify(v)}`);
 for(const name of disabledFeatures)if(!local||name!=='shell_tool')args.push('--disable',name);
 for(const image of images)args.push('-i',image);
 return [...args,'-'];
}
export async function inspectCodex(subprocess,{workspace=false}={}){
 // Try the portable command name first, then the Desktop-bundled location.
 const candidates=[executable,'/usr/lib/chatgpt/resources/codex'];
 try{return await isolated(async cwd=>{
  const signal=AbortSignal.timeout(10000);
  const models=JSON.parse(await readFile(workspace?workspaceCatalog:catalog,'utf8')).models;
  const m=models?.[0];
  if(models.length!==1||m.slug!==codexModel||m.experimental_supported_tools.length||m.tool_mode!=='direct'||m.multi_agent_version!==null||
    (workspace?(m.shell_type!=='unified_exec'||m.apply_patch_tool_type!=='freeform'):(m.shell_type!=='disabled'||m.apply_patch_tool_type!==null)))throw Error(`Invalid ${workspace?'workspace':'no-tools'} model catalog`);
  let lastError;
  for(const candidate of candidates){
   try{
    const resolved=subprocess?await subprocess.resolveExecutable(candidate,environment(),signal):candidate;
    const version=(await invoke(subprocess,resolved,['--version'],cwd,signal)).trim();
    if(!/^codex-cli \d+\.\d+\.\d+/.test(version)){lastError=Error(`Unverified Codex version at ${resolved}: ${version}`);continue;}
    return {available:true,path:resolved,version,model:codexModel,mode:workspace?'workspace-write':'discussion-only'};
   }catch(error){lastError=error;if(signal.aborted)throw error;}
  }
  throw Error(`Codex CLI not found or unusable: ${lastError?.message??'no candidate'}`);
 });}catch(e){return {available:false,reason:e.message};}
}

export function parseCodex(output,{workspace=false}={}){
 const rows=output.split('\n').filter(s=>s.trim()).map(s=>JSON.parse(s));
 for(const row of rows){
  if(row.type==='turn.failed'||row.type==='error')throw Error(`Codex request failed${row.message?`: ${row.message}`:''}`);
  if(row.item && !(workspace?['agent_message','reasoning','command_execution','file_change']:['agent_message','reasoning']).includes(row.item.type))throw Error(`Unexpected Codex activity: ${row.item.type}`);
 }
 if(!rows.some(r=>r.type==='turn.completed'))throw Error('Codex did not complete its turn');
 const text=rows.filter(r=>r.type==='item.completed'&&r.item?.type==='agent_message').map(r=>r.item.text).join('\n');
 if(!text.trim())throw Error('Codex returned no answer');
 const usage=rows.findLast(r=>r.type==='turn.completed')?.usage;
 return {text,model:codexModel,sessionId:rows.find(r=>r.type==='thread.started')?.thread_id,...(usage&&typeof usage==='object'?{usage}:{})};
}

function codexRecord(row){
 const item=row.item;
 if(item)return {type:row.type,item:item.type==='agent_message'?{type:item.type,text:['item.completed'].includes(row.type)?item.text:undefined}:{type:item.type}};
 return {type:row.type,message:row.message,usage:row.usage,thread_id:row.thread_id};
}

function codexProgress(emit){
 const messages=new Map();
 return jsonLines(row=>{
  const item=row.item;
  if(item?.type==='agent_message'&&['item.started','item.updated','item.completed'].includes(row.type)&&typeof item.text==='string'){
   // exec currently emits completed messages; updated snapshots are forwarded if supplied.
   messages.set(item.id??messages.size,item.text);
   emit({text:[...messages.values()].filter(Boolean).join('\n'),state:'responding'});
  }else if(item?.type==='reasoning')emit({state:'thinking'});
  else if(item&&['command_execution','file_change'].includes(item.type))emit({state:'tool'});
  else if(row.type==='turn.started')emit({state:'thinking'});
 });
}

export async function runCodex(prompt,{signal,subprocess,images=[],workspace,onProgress,gateway}={}){
 const emit=progressCallback(onProgress,{model:codexModel});
 if(!subprocess)throw Error('Managed subprocess service required');
 if(typeof prompt!=='string'||!prompt.trim()||Buffer.byteLength(prompt)>1048576)throw Error('Invalid Codex prompt');
 if(!Array.isArray(images)||images.length>4)throw Error('At most 4 images per request');
 let root;
 if(workspace!==undefined){
  if(typeof workspace!=='string'||!path.isAbsolute(workspace))throw Error('Workspace must be an absolute path');
  root=await realpath(workspace);
  if(!(await stat(root)).isDirectory())throw Error('Workspace must be a directory');
 }
 const files=[];
 for(const [index,image] of images.entries()){
  if(!['image/png','image/jpeg','image/webp','image/gif'].includes(image.mediaType)||typeof image.data!=='string')throw Error('Invalid shared image');
  const bytes=Buffer.from(image.data,'base64');if(!bytes.length||bytes.length>8*1024*1024)throw Error('Shared image size invalid');
  const extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'}[image.mediaType];
  files.push({bytes,name:`image-${index+1}.${extension}`});
 }
 signal?.throwIfAborted();
 const local=workspace!==undefined;
 const cli=await inspectCodex(subprocess,{workspace:local});if(!cli.available)throw Error(cli.reason);
 const provider=gateway??await readGateway();
 return isolated(async cwd=>{
  const paths=[];
  for(const file of files){const imagePath=path.join(cwd,file.name);await writeFile(imagePath,file.bytes,{flag:'wx'});paths.push(imagePath);}
  const progress=onProgress?codexProgress(emit):local?()=>{}:undefined;
  const output=await invoke(subprocess,cli.path,codexArgs(paths,{...(local?{workspace:root}:{}),gateway:provider}),local?root:cwd,signal,prompt,progress,local?codexRecord:undefined,provider?{[gatewayTokenKey]:provider.token}:undefined);
  progress?.('',true);
  const result=parseCodex(output,{workspace:local});
  if(onProgress)emit({text:result.text,...(result.usage?{usage:result.usage}:{}),state:'responding'});
  return result;
 });
}
