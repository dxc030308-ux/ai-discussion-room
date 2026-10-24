import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,accessSync} from 'node:fs';
import {PassThrough} from 'node:stream';
import {setImmediate as immediate} from 'node:timers/promises';
import {access} from 'node:fs/promises';
import {codexArgs,inspectCodex,parseCodex,runCodex} from './codex.js';
import {runCli} from './cli.js';
const output=JSON.stringify({type:'thread.started',thread_id:'test'})+'\n'+JSON.stringify({type:'item.completed',item:{type:'agent_message',text:'2'}})+'\n'+JSON.stringify({type:'turn.completed'});
test('Codex managed invocation pins no-tools policy and uses stdin',async()=>{
 const calls=[];const subprocess={resolveExecutable:async p=>p,spawn:spec=>{calls.push(spec);return {done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:spec.argv.includes('--version')?'codex-cli 0.153.4':output,lossy:false})},stderr:{readFrom:()=>({text:'',lossy:false})}}};}};
 assert.equal((await inspectCodex(subprocess)).available,true);
 const result=await runCodex('untrusted $(touch unsafe)',{subprocess});assert.equal(result.text,'2');assert.equal(result.model,'gpt-6.1-sol');
 const spec=calls.at(-1);assert.equal(spec.stdio.stdin.data,'untrusted $(touch unsafe)');assert.ok(!spec.argv.join(' ').includes('touch unsafe'));
 const args=codexArgs();for(const f of ['--ignore-user-config','--ignore-rules','--ephemeral'])assert.ok(args.includes(f));
 for(const key of ['features.shell_tool=false','features.multi_agent=false']){const name=key.split('.')[1].split('=')[0];assert.ok(args.includes(name));}
 assert.ok(args.some(a=>a.startsWith('model_catalog_json=')));
});
test('Codex attaches shared images from owned temp files',async()=>{
 const calls=[];let image='';let imagePath='';
 const subprocess={resolveExecutable:async p=>p,spawn:spec=>{
  calls.push(spec);
  const index=spec.argv.indexOf('-i');
  if(index>=0){imagePath=spec.argv[index+1];assert.equal(imagePath.startsWith(spec.cwd),true);image=readFileSync(imagePath).toString('base64');}
  return {done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:spec.argv.includes('--version')?'codex-cli 0.153.4':output,lossy:false})},stderr:{readFrom:()=>({text:'',lossy:false})}}};
 }};
 const data='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lK3V6QAAAABJRU5ErkJggg==';
 const result=await runCodex('color?',{subprocess,images:[{mediaType:'image/png',data}]});
 assert.equal(result.text,'2');assert.equal(image,data);
 assert.throws(()=>accessSync(imagePath));
});
test('Codex rejects unsupported image payloads before execution',async()=>{
 const subprocess={resolveExecutable:async p=>p,spawn:()=>{throw Error('must not spawn');}};
 await assert.rejects(runCodex('x',{subprocess,images:Array(5).fill({mediaType:'image/png',data:'AAAA'})}),/At most 4/);
 await assert.rejects(runCodex('x',{subprocess,images:[{mediaType:'text/plain',data:'AAAA'}]}),/Invalid shared image/);
});
test('unexpected activity, model error or incomplete result is rejected',()=>{
 for(const type of ['command_execution','file_change','mcp_tool_call','web_search','collab_tool_call'])assert.throws(()=>parseCodex(JSON.stringify({type:'item.started',item:{type}})+'\n'+output),/Unexpected/);
 assert.throws(()=>parseCodex('{"type":"turn.failed"}'),/failed/);
 assert.throws(()=>parseCodex('{"type":"turn.started"}'),/complete/);
});

test('Codex workspace mode enables only the installed shell and patch tools',async()=>{
 const calls=[];const subprocess={resolveExecutable:async p=>p,spawn:spec=>{
  calls.push(spec);
  const stdout=new PassThrough();if(spec.stdio.stdout==='pipe')stdout.end(output);
  return {stdout,done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:spec.argv.includes('--version')?'codex-cli 0.153.4':output,lossy:false})},stderr:{readFrom:()=>({text:'',lossy:false})}}};
 }};
 const workspace='/tmp';const cli=await inspectCodex(subprocess,{workspace:true});assert.equal(cli.available,true);assert.equal(cli.mode,'workspace-write');
 const result=await runCodex('inspect workspace',{subprocess,workspace});assert.equal(result.text,'2');
 const spec=calls.at(-1);assert.equal(spec.cwd,workspace);assert.equal(spec.argv[spec.argv.indexOf('--sandbox')+1],'workspace-write');assert.equal(spec.argv[spec.argv.indexOf('--cd')+1],workspace);
 assert.ok(!spec.argv.includes('--approve-for-me'));assert.ok(!spec.argv.includes('--dangerously-bypass-approvals-and-sandbox'));
 assert.ok(!spec.argv.includes('shell_tool'));assert.ok(!spec.argv.includes('apply_patch'));
 const catalogArg=spec.argv.find(a=>a.startsWith('model_catalog_json='));assert.match(catalogArg,/dsh-discussion-workspace-[\w.-]+\.json/);
});

test('workspace mode parses command and file events but rejects unrelated tools',()=>{
 const activity=JSON.stringify({type:'item.completed',item:{type:'command_execution',command:'pwd',aggregated_output:'/tmp'}})+'\n'+JSON.stringify({type:'item.completed',item:{type:'file_change',changes:[]}})+'\n'+output;
 assert.equal(parseCodex(activity,{workspace:true}).text,'2');
 assert.throws(()=>parseCodex(JSON.stringify({type:'item.started',item:{type:'mcp_tool_call'}})+'\n'+output,{workspace:true}),/Unexpected/);
 assert.throws(()=>parseCodex('{"type":"turn.failed","message":"shell failed"}',{workspace:true}),/shell failed/);
});

test('Codex forwards real updated/completed message snapshots before exit and retains actual usage',async()=>{
 let ready,finish,spec,handle;
 const started=new Promise(resolve=>{ready=resolve;});
 const subprocess={resolveExecutable:async p=>p,spawn:request=>{
  if(request.argv.includes('--version'))return {done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:'codex-cli 0.153.4',lossy:false})}}};
  spec=request;
  handle={stdout:new PassThrough(),collected:{stderr:{readFrom:()=>({text:'',lossy:false})}},done:new Promise(resolve=>{finish=resolve;}),terminate(){handle.stdout.end();finish({exitCode:1});}};
  ready();return handle;
 }};
 const updates=[];
 const run=runCli('codex','x',{subprocess,onProgress:update=>updates.push(update)});
 await started;
 assert.equal(spec.stdio.stdout,'pipe');
 const row=value=>JSON.stringify(value)+'\n';
 handle.stdout.write(row({type:'turn.started'}));
 handle.stdout.write(row({type:'item.completed',item:{id:'r',type:'reasoning',text:'SECRET reasoning'}}));
 handle.stdout.write(row({type:'item.updated',item:{id:'a',type:'agent_message',text:'hel'}}).slice(0,25));
 await immediate();
 assert(!updates.some(update=>update.text));
 const updated=row({type:'item.updated',item:{id:'a',type:'agent_message',text:'hel'}});
 handle.stdout.write(updated.slice(25));
 await immediate();
 assert.equal(updates.at(-1).text,'hel');
 handle.stdout.write(row({type:'item.completed',item:{id:'a',type:'agent_message',text:'hello'}}));
 await immediate();
 assert.equal(updates.at(-1).text,'hello');
 handle.stdout.write(row({type:'item.completed',item:{id:'b',type:'agent_message',text:'world'}}));
 const usage={input_tokens:15,cached_input_tokens:7,output_tokens:4};
 handle.stdout.end(JSON.stringify({type:'turn.completed',usage}));
 finish({exitCode:0,signal:null});
 const result=await run;
 assert.equal(result.text,'hello\nworld');
 assert.deepEqual(result.usage,usage);
 assert.deepEqual(updates.at(-1),{text:'hello\nworld',model:'gpt-6.1-sol',state:'responding',usage});
 assert(!JSON.stringify(updates).includes('SECRET'));
 await assert.rejects(access(spec.cwd));
});

test('Codex workspace progress exposes tool state but no command, patch or reasoning text',async()=>{
 let ready,finish,handle;
 const started=new Promise(resolve=>{ready=resolve;});
 const subprocess={resolveExecutable:async p=>p,spawn:spec=>{
  if(spec.argv.includes('--version'))return {done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:'codex-cli 0.153.4',lossy:false})}}};
  handle={stdout:new PassThrough(),collected:{stderr:{readFrom:()=>({text:'',lossy:false})}},done:new Promise(resolve=>{finish=resolve;}),terminate(){handle.stdout.end();finish({exitCode:1});}};
  ready();return handle;
 }};
 const updates=[];
 const run=runCodex('x',{subprocess,workspace:'/tmp',onProgress:update=>updates.push(update)});
 await started;
 for(const type of ['command_execution','file_change','reasoning'])handle.stdout.write(JSON.stringify({type:'item.completed',item:{type,text:'SECRET',command:'SECRET',aggregated_output:'SECRET'}})+'\n');
 handle.stdout.end(output);finish({exitCode:0,signal:null});
 assert.equal((await run).text,'2');
 assert(updates.some(update=>update.state==='tool'));
 assert(updates.some(update=>update.state==='thinking'));
 assert(!JSON.stringify(updates).includes('SECRET'));
});

test('Codex cancellation and failed turns clean image files while preserving workspace',async()=>{
 for(const cancel of [true,false]){
  let ready,finish,handle,imagePath;
  const started=new Promise(resolve=>{ready=resolve;});
  const controller=new AbortController();
  const subprocess={resolveExecutable:async p=>p,spawn:spec=>{
   if(spec.argv.includes('--version'))return {done:Promise.resolve({exitCode:0}),collected:{stdout:{readFrom:()=>({text:'codex-cli 0.153.4',lossy:false})}}};
   imagePath=spec.argv[spec.argv.indexOf('-i')+1];
   handle={stdout:new PassThrough(),collected:{stderr:{readFrom:()=>({text:'',lossy:false})}},done:new Promise(resolve=>{finish=resolve;}),terminate(){handle.terminated=true;handle.stdout.end();finish({exitCode:1});},async waitForExit(){return true;}};
   ready();return handle;
  }};
  const run=runCodex('x',{subprocess,workspace:'/tmp',images:[{mediaType:'image/png',data:'AAAA'}],signal:controller.signal,onProgress(){}});
  const rejected=assert.rejects(run,cancel?/cancelled/:/failed/);
  await started;
  await access(imagePath);
  if(cancel)controller.abort(Error('cancelled'));
  else{handle.stdout.end('{"type":"turn.failed"}\n');finish({exitCode:0,signal:null});}
  await rejected;
  if(cancel)assert(handle.terminated);
  await assert.rejects(access(imagePath));
  await access('/tmp');
 }
});

test('Codex preserves final usage even without progress callback',()=>{
 const usage={input_tokens:21,output_tokens:3,cached_input_tokens:4};
 assert.deepEqual(parseCodex(output+'\n'+JSON.stringify({type:'turn.completed',usage})).usage,usage);
});

test('workspace must be an absolute existing directory',async()=>{
 const subprocess={resolveExecutable:async p=>p,spawn:()=>{throw Error('must not spawn');}};
 await assert.rejects(runCodex('x',{subprocess,workspace:'relative'}),/absolute/);
 await assert.rejects(runCodex('x',{subprocess,workspace:'/dev/null'}),/directory/);
});

test('Codex detection falls back when the PATH command is missing', async () => {
 const subprocess = {
  async resolveExecutable(candidate) { if (candidate === 'codex') throw Error('command "codex" was not found on PATH'); return candidate; },
  spawn(spec) {
   return { done: Promise.resolve({ exitCode: 0 }), collected: { stdout: { readFrom: () => ({ text: spec.argv.includes('--version') ? 'codex-cli 0.153.4' : '', lossy: false }) }, stderr: { readFrom: () => ({ text: '', lossy: false }) } } };
  },
 };
 const result = await inspectCodex(subprocess);
 assert.equal(result.available, true, result.reason);
 assert.equal(result.path, '/usr/lib/chatgpt/resources/codex');
});
