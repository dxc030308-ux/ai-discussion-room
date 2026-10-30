// Host-shared modules resolve from the running DSH runtime, never a fixed install path.
import { zod as z, installModelSelection, BlockAssembler, lastAssistantStreamChunk } from './runtime.js?member=12';
import { randomUUID } from 'node:crypto';
import { mkdtemp, writeFile, readFile, realpath, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { extractFiles } from './attachments.js?features=2';

// DSH participant route. Leave undefined to follow the session's selected model; set a pair to pin one, e.g.
// { provider: 'your-provider', model: 'your-model' }.
const dshMemberRoute = process.env.DISCUSSION_DSH_PROVIDER && process.env.DISCUSSION_DSH_MODEL
 ? { provider: process.env.DISCUSSION_DSH_PROVIDER, model: process.env.DISCUSSION_DSH_MODEL }
 : undefined;
const totalUsage=values=>{
  const usages=values.filter(Boolean);if(!usages.length)return undefined;
  const total={};for(const usage of usages)for(const [key,value] of Object.entries(usage))if(typeof value==='number')total[key]=(total[key]||0)+value;
  if(usages.some(usage=>usage.totalTokens===undefined))delete total.totalTokens;
  return total;
};
import { Discussion, validateRoom, storeKey } from './core.js?templates=2';
import { inspectCli, runCli } from './cli.js?member=12';

export const inject=['commands','tools','storageDomain','agents','agentPresets','subprocess','attachments','webServer'];
export async function apply(ctx) {
  const domain=await ctx.storageDomain.open({name:'local_agent_discussion',version:1,layout:'per-record',tables:{rooms:{valueSchema:z.any().transform(validateRoom)}}});
  const table=domain.table('rooms');
  let capabilities;
  const caps=()=>capabilities??=(inspectCli(ctx.subprocess).catch(e=>({claude:{available:false,reason:e.message},codex:{available:false,reason:e.message}})));
  async function runDsh(parent,prompt,signal,images=[],access='discussion',onProgress,cwd=parent.session.header.cwd||process.cwd()){
    const factory=parent.ctx.agents;
    if(!factory)throw Error('DSH agent factory unavailable');
    const {reasoningEffort:_startupEffort,...options}=parent.options;
    // DSH 0.2.2+ removed sessionController.agents.selectionFor; the parent's last request
    // header is the model the user actually picked. dshMemberRoute still pins a route.
    const route=dshMemberRoute||parent.session.requestHeader?.()?.config||parent.options;
    const selected={provider:route.provider,model:route.model,...route.reasoningEffort===undefined?{}:{reasoningEffort:route.reasoningEffort}};
    const subscriptions=[],attempts=new Map(),answers=[];
    let active,model=selected.model,state='thinking';
    const textOf=blocks=>blocks.filter(b=>b.type==='text').map(b=>b.text).join('\n');
    const publish=()=>{const pending=onProgress?.({text:[...answers,active&&textOf(active.interruptedBlocks())].filter(Boolean).join('\n'),model,usage:totalUsage([...attempts.values()].map(a=>a.usage)),state});pending?.catch(()=>{});};
    const handle=await factory.create({sessionId:randomUUID(),parentAgent:parent,meta:{cwd,parentSession:parent.session.header.id,origin:'subagent',delegationDepth:(parent.session.header.delegationDepth??0)+1},agentOptions:{...options,...selected,maxTokens:access==='workspace'?32000:16000},signal,
      setup(childCtx,child){
        subscriptions.push(childCtx.on('agent/assistant-stream',({agent,frame})=>{
          if(agent!==child)return;
          if(frame.type==='start'){active=new BlockAssembler();attempts.set(frame.attemptId,active);state='thinking';}
          else if(frame.type==='chunk'){
            const assembler=attempts.get(frame.attemptId);if(!assembler)return;
            assembler.push(frame.chunk);
            const chunk=frame.chunk,type=chunk.block?.type||chunk.blockType;
            if(chunk.type==='text-delta'||type==='text')state='responding';
            else if(chunk.type==='tool-call-delta'||type==='tool-call')state='tool';
            else if(chunk.type==='reasoning-delta'||type==='reasoning')state='thinking';
          }else if(frame.type==='end')active=undefined;
          publish();
        }));
        subscriptions.push(childCtx.on('session/event',(session,event)=>{
          if(session!==child.session)return;
          if(event.type==='assistant/message'){
            answers.push(textOf(event.data.message.content));model=event.data.message.source.model;active=undefined;publish();
          }
        }));
        ctx.agentPresets.composeFrom(childCtx,parent.ctx);
        // DSH 0.2.2+ takes only the agent context; selection comes from agentOptions.
        installModelSelection(childCtx);
        const tools=ctx.agentPresets.serviceFor(child,'tools')||childCtx.get('tools');
        if(!tools)throw Error('Cannot enforce discussion tool policy');
        const allowed=['read','read_image','write','edit','glob','grep','bash','job_output','job_list','job_kill','working_directory'];
        tools.restrict({allow:access==='workspace'?allowed.filter(name=>tools.get(name,child)):[]});
        if(access!=='workspace')tools.guard(()=> 'Discussion mode: all tool execution is disabled');
      }});
    const child=handle.agent;
    const abort=()=>child.cancel({kind:'parent'});
    signal.addEventListener('abort',abort,{once:true});
    try{
      signal.throwIfAborted();
      child.followup({id:randomUUID(),role:'user',source:{kind:'user'},content:[{type:'text',text:prompt},...images.map(image=>({type:'image',attachment:image}))]});
      await child.whenIdle();signal.throwIfAborted();
      const events=child.session.snapshotEvents();
      const end=[...events].reverse().find(e=>e.type==='turn/end');
      if(end?.data.reason.kind!=='completed'){
        // A truncated answer is more useful than a dead card: keep what the model produced.
        const partial=events.filter(e=>e.type==='assistant/message').map(e=>e.data.message).flatMap(m=>m.content.filter(b=>b.type==='text').map(b=>b.text)).join('\n');
        if(end?.data.reason.kind==='max-tokens'&&partial.trim()){
          return {text:partial+'\n\n（本轮达到输出上限被截断，以上为已生成部分；可重试或缩小问题范围。）',model,usage:totalUsage([...attempts.values()].map(a=>a.usage)),truncated:true};
        }
        const failure=end?.data.reason.error;
        const detail=failure?.message||failure?.diagnostic||JSON.stringify(failure||{});
        throw Error(`DSH turn: ${end?.data.reason.kind||'no result'}; ${detail.slice(0,1500)}`);
      }
      const messages=events.filter(e=>e.type==='assistant/message').map(e=>e.data.message);
      const text=messages.flatMap(m=>m.content.filter(b=>b.type==='text').map(b=>b.text)).join('\n');
      if(!text.trim())throw Error('DSH returned no text');
      const usage=totalUsage(events.filter(e=>['assistant/message','assistant/attempt'].includes(e.type)).map(e=>e.data.usage||(e.data.stream&&lastAssistantStreamChunk(e.data.stream,'usage')?.usage)));
      return {text,model:messages.at(-1)?.source.model||selected.model,sessionId:child.id,...usage?{usage}:{}};
    }finally{signal.removeEventListener('abort',abort);for(const off of subscriptions)off();await handle.dispose();}
  }
  async function readImagePayload(images){
    const payload=[];
    for(const image of images){
      try{const stored=await ctx.attachments.readImage(image);payload.push({mediaType:image.mediaType,name:image.name,data:Buffer.from(stored.data).toString('base64')});}
      catch(e){throw Error(`Cannot read shared image: ${e.message}`);}
    }
    return payload;
  }
  async function runMember(agent,speaker,prompt,signal,images,access='discussion',onProgress){
    if(speaker==='dsh')return runDsh(agent,prompt,signal,images,access,onProgress);
    // CLIs receive image bytes directly; no shared file path is exposed to the model.
    const payload=await readImagePayload(images);
    return runCli(speaker,prompt,{signal,subprocess:ctx.subprocess,images:payload,onProgress,...access==='workspace'?{workspace:agent.session.header.cwd||process.cwd()}: {}});
  }
  // Each room has its own bound runner; shared durable table, no global current-owner mutable state.
  const rooms=new Map();
  // Read-only views let the panel poll without writing command events into the transcript.
  const views=new Map();
  const view=id=>{
    let engine=views.get(id);
    if(!engine){engine=new Discussion({load:i=>table.get(storeKey(i)),save:async()=>{},capabilities:caps,run:async()=>{throw Error('Read-only discussion view');}});views.set(id,engine);}
    return engine;
  };
  ctx.effect(()=>ctx.webServer.register({kind:'exact',path:'/local-discussion/state',handler:(req,res)=>{
    res.setHeader('cache-control','no-store');
    const site=req.headers['sec-fetch-site'];
    let id;
    try{id=new URL(req.url??'/','http://127.0.0.1').searchParams.get('session');}catch{id=undefined;}
    if(req.method!=='GET'||(site!==undefined&&site!=='same-origin')||!id){
      res.writeHead(req.method!=='GET'||site&&site!=='same-origin'?403:400,{'content-type':'application/json'}).end('{"error":"unavailable"}');
      return;
    }
    const live=rooms.get(id);
    (live?live.engine:view(id)).get(id).then(snapshot=>{
      res.writeHead(200,{'content-type':'application/json'}).end(JSON.stringify(snapshot));
    },error=>{res.writeHead(500,{'content-type':'application/json'}).end(JSON.stringify({error:String(error?.message||error)}));});
  }}),'discussion: read-only state route');
  function engine(agent){
    let entry=rooms.get(agent.id);
    if(entry && entry.agent!==agent){if(entry.engine.live.size)throw Error('Previous room owner is still stopping');rooms.delete(agent.id);entry=null;}
    if(!entry){const e=new Discussion({load:id=>table.get(storeKey(id)),save:(id,r)=>table.put(storeKey(id),structuredClone(r)),capabilities:caps,
      run:(speaker,prompt,signal,images,access,onProgress)=>runMember(agent,speaker,prompt,signal,images,access,onProgress)});entry={agent,engine:e};rooms.set(agent.id,entry);}
    return entry.engine;
  }
  async function operation(agent,q){
    if(q.files?.length){
      if(!['start','send'].includes(q.action))throw Error('Files are supported only for start/send');
      const sources=await extractFiles(q.files,{subprocess:ctx.subprocess,signal:AbortSignal.timeout(30000)});
      q={...q,sources};delete q.files;
    }
    return {...await engine(agent).action(agent.id,q),workspace:agent.session?.header.cwd||process.cwd()};
  }
  ctx.commands.register({name:'discuss',description:'AI discussion room: get, start, send, stop, summarize, reset',input:{hint:'JSON request',attachments:true},recordInput:true,
    handler:async({agent,rawInput,attachments})=>{try{return {kind:'success',text:JSON.stringify(await operation(agent,{...JSON.parse(rawInput),attachments})) };}catch(e){return {kind:'error',text:e.message};}}});
  ctx.tools.register({name:'agent_discussion',description:'Read or control this session’s bounded AI discussion room. Start requires prior user confirmation of sharing with model services in the discussion UI.',parameters:{type:'object',properties:{action:{type:'string',enum:['get','send','stop','summarize']},text:{type:'string',description:'Follow-up text for send.'},target:{type:'string',enum:['all','dsh','claude','codex'],description:'Recipient for send.'}},required:['action'],additionalProperties:false},
    output:{schema:{type:'object'},render:(_a,v)=>[{type:'text',text:JSON.stringify(v)}]},execute:async(q,exec)=>{if(!exec.agent)throw Error('Session required');return operation(exec.agent,q);}});
  ctx.tools.register({name:'discussion_self_test',description:'Verify DSH discussion workspace tools by reading, writing and editing owned temporary files; returns the actual answer and filesVerified or diagnostic. Optional image tests vision instead.',parameters:{type:'object',properties:{image:{type:'string',description:'Optional base64 PNG for a vision smoke test.'}},additionalProperties:false},output:{schema:{type:'object'},render:(_a,v)=>[{type:'text',text:JSON.stringify(v)}]},execute:async(q,exec)=>{try{
    if(!q.image){
      const cwd=await mkdtemp(join(tmpdir(),'dsh-discussion-workspace-'));
      try{
        const nonce=randomUUID();await writeFile(join(cwd,'input.txt'),nonce);
        const result=await runDsh(exec.agent,'本地文件读写自检。用工具读取当前工作区 input.txt，把其内容原样写入 output.txt，随后将 output.txt 内容改成原内容追加一行 verified（用换行分隔，无末尾换行）。必须实际读取、写入、编辑，不要猜测内容。最后回答 2。',AbortSignal.timeout(90000),[],'workspace',undefined,cwd);
        if(await readFile(join(cwd,'output.txt'),'utf8')!==nonce+'\nverified')throw Error('DSH workspace file verification failed');
        return {...result,filesVerified:true};
      }finally{const target=await realpath(cwd);if(target!==cwd||!target.startsWith(join(tmpdir(),'dsh-discussion-workspace-')))throw Error('Unexpected smoke directory');await rm(target,{recursive:true});}
    }
    if(typeof q.image!=='string'||q.image.length>12*1024*1024)throw Error('Image test payload invalid');
    const [image]=await ctx.attachments.saveImages([{data:Buffer.from(q.image,'base64'),mediaType:'image/png',name:'smoke.png'}]);
    return await runDsh(exec.agent,'这张图片是什么颜色？只回答颜色。',AbortSignal.timeout(60000),[image]);
  }catch(e){return {error:e.message};}}});
  ctx.effect(()=>async()=>{await Promise.all([...rooms.values()].map(e=>e.engine.dispose()));await domain.close();});
}
