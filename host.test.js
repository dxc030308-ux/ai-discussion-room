import { test } from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const completeFiles=async cwd=>writeFile(join(cwd,'output.txt'),await readFile(join(cwd,'input.txt'),'utf8')+'\nverified');
import { apply } from './index.js';
import { freshRoom } from './core.js';

test('Host activates, registers command/tool, enforces consent and persists room',async()=>{
 const rows=new Map();const cleanup=[];let command,tool,smoke,closed=false;
 const ctx={webServer:{register:route=>{globalThis.__discussionRoute=route;return ()=>{};}},storageDomain:{open:async spec=>{assert.equal(spec.name,'local_agent_discussion');return {table:()=>({get:id=>rows.get(id),put:async(id,r)=>rows.set(id,structuredClone(r))}),close:async()=>{closed=true;}};}},commands:{register:c=>{command=c;}},tools:{register:t=>{if(t.name==='agent_discussion')tool=t;else if(t.name==='discussion_self_test')smoke=t;}},subprocess:{resolveExecutable:async()=>{throw Error('not present');}},effect:f=>cleanup.push(f())};
 await apply(ctx);assert.equal(command.name,'discuss');assert.equal(command.input.attachments,true);assert.equal(tool.name,'agent_discussion');
 const agent={id:'test-session'};
 let reply=await command.handler({agent,rawInput:JSON.stringify({action:'get'})});assert.equal(reply.kind,'success');assert.equal(JSON.parse(reply.text).status,'idle');
 reply=await command.handler({agent,rawInput:JSON.stringify({action:'start',question:'test'})});assert.equal(reply.kind,'error');
 const view=await tool.execute({action:'get'},{agent});assert.equal(view.status,'idle');
 reply=await command.handler({agent,rawInput:JSON.stringify({action:'reset'})});assert.equal(reply.kind,'success');assert.equal(rows.get(agent.id).status,'idle');
 let meta;
 const fakeParent={id:'parent',options:{model:'mock'},session:{header:{cwd:'/explicit/workspace'}},ctx:{agents:{create:async spec=>{meta=spec.meta;return {agent:{id:'child',followup(){},whenIdle:async()=>completeFiles(meta.cwd),session:{snapshotEvents:()=>[{type:'turn/end',data:{reason:{kind:'completed'}}},{type:'assistant/message',data:{message:{content:[{type:'text',text:'2'}],source:{model:'mock'}}}}]}},dispose:async()=>{}};}}}};
 assert.equal((await smoke.execute({}, {agent:fakeParent})).text,'2');assert.match(meta.cwd,/dsh-discussion-workspace-/);
 for(const f of cleanup)await f();assert.equal(closed,true);
});

test('DSH discussion streams cumulative native chunks before idle and preserves actual usage',async t=>{
 const id='native-stream',rows=new Map([[id,{...freshRoom(),consent:true,question:'test'}]]),cleanup=[],handlers=new Map();
 let tool,releaseIdle,disposed=false,guarded,restricted;
 const idle=new Promise(resolve=>releaseIdle=resolve);
 let resolveLive,resolveDone;const live=new Promise(resolve=>resolveLive=resolve),done=new Promise(resolve=>resolveDone=resolve);
 const tools={get:()=>true,restrict:value=>restricted=value,guard:fn=>guarded=fn()};
 const ctx={webServer:{register:route=>{globalThis.__discussionRoute=route;return ()=>{};}},storageDomain:{open:async()=>({table:()=>({get:id=>rows.get(id),put:async(id,r)=>{rows.set(id,structuredClone(r));if(r.messages.some(m=>m.status==='streaming'&&m.text==='Hello world'))resolveLive();if(r.status==='completed')resolveDone();}}),close:async()=>{}})},commands:{register(){}},tools:{register:value=>{if(value.name==='agent_discussion')tool=value;}},subprocess:{resolveExecutable:async()=>{throw Error('not present');}},agentPresets:{composeFrom(){},serviceFor:()=>tools},effect:fn=>cleanup.push(fn())};
 const events=[];
 let created;
 const parent={id,options:{provider:'mock',model:'selected-model'},session:{header:{id:'parent',cwd:'/workspace'}},ctx:{agents:{create:async value=>{
  created=value;
  const child={id:'native-child',session:{snapshotEvents:()=>events},cancel(){releaseIdle();},followup(){
   const emit=frame=>handlers.get('agent/assistant-stream')({agent:child,frame});
   emit({type:'start',attemptId:'attempt-1'});
   emit({type:'chunk',attemptId:'attempt-1',chunk:{type:'reasoning-delta',index:0,text:'private reasoning'}});
   emit({type:'chunk',attemptId:'attempt-1',chunk:{type:'text-delta',index:1,text:'Hello '}});
   emit({type:'chunk',attemptId:'attempt-1',chunk:{type:'text-delta',index:1,text:'world'}});
   emit({type:'chunk',attemptId:'attempt-1',chunk:{type:'block-end',index:1,block:{type:'text',text:'Hello world'}}});
   emit({type:'chunk',attemptId:'attempt-1',chunk:{type:'usage',usage:{inputTokens:7,outputTokens:3,totalTokens:12,cacheReadTokens:2}}});
  },whenIdle:async()=>{await idle;
   const message={type:'assistant/message',data:{message:{content:[{type:'text',text:'Hello world'}],source:{model:'actual-model'}},usage:{inputTokens:7,outputTokens:3,totalTokens:12,cacheReadTokens:2}}};
   events.push(message,{type:'assistant/attempt',data:{stream:[{type:'chunk',time:1,chunk:{type:'usage',usage:{inputTokens:1,outputTokens:2,totalTokens:3}}}]}},{type:'turn/end',data:{reason:{kind:'completed'}}});
   handlers.get('session/event')(child.session,message);
   handlers.get('agent/assistant-stream')({agent:child,frame:{type:'end',attemptId:'attempt-1'}});
  }};
  value.setup({on:(name,fn)=>{handlers.set(name,fn);return ()=>handlers.delete(name);}},child);
  return {agent:child,dispose:async()=>{disposed=true;}};
 }}}};
 await apply(ctx);t.after(async()=>{releaseIdle();for(const close of cleanup)await close();});
 await tool.execute({action:'send',target:'dsh',text:'test'},{agent:parent});
 await Promise.race([live,new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('No live text before idle')),1000);timer.unref();})]);
 const during=await tool.execute({action:'get'},{agent:parent});const message=during.messages.find(m=>m.speaker==='dsh');
 assert.equal(created.meta.origin,'subagent');assert.equal(created.meta.parentSession,'parent');assert.equal(created.meta.delegationDepth,1);
 assert.equal(message.status,'streaming');assert.equal(message.text,'Hello world');assert.equal(message.state,'responding');assert.equal(message.model,'selected-model');
 assert.deepEqual(message.usage,{inputTokens:7,outputTokens:3,totalTokens:12,cacheReadTokens:2});assert.equal(disposed,false);assert.deepEqual(restricted,{allow:[]});assert.match(guarded,/all tool execution is disabled/);
 releaseIdle();await done;for(const close of cleanup)await close();cleanup.length=0;
 const final=rows.get(id).messages.find(m=>m.speaker==='dsh');assert.equal(final.status,'completed');assert.equal(final.model,'actual-model');assert.equal(final.text,'Hello world');assert.deepEqual(final.usage,{inputTokens:8,outputTokens:5,totalTokens:15,cacheReadTokens:2});assert.equal(disposed,true);assert.equal(handlers.has('agent/assistant-stream'),false);assert.equal(handlers.has('session/event'),false);
});

test('Command extracts shared base64 files and rejects files on read actions',async t=>{
 const id='file-command',rows=new Map([[id,{...freshRoom(),consent:true,question:'test'}]]),cleanup=[];let command,received,release;
 const idle=new Promise(resolve=>release=resolve);let resolvePrompt;const prompt=new Promise(resolve=>resolvePrompt=resolve);
 const ctx={webServer:{register:route=>{globalThis.__discussionRoute=route;return ()=>{};}},storageDomain:{open:async()=>({table:()=>({get:id=>rows.get(id),put:async(id,r)=>rows.set(id,structuredClone(r))}),close:async()=>{}})},commands:{register:value=>command=value},tools:{register(){}},subprocess:{resolveExecutable:async()=>{throw Error('not present');}},effect:fn=>cleanup.push(fn())};
 const parent={id,options:{model:'mock'},session:{header:{cwd:'/workspace'}},ctx:{agents:{create:async()=>({agent:{id:'file-child',cancel:()=>release(),followup:message=>{received=message.content[0].text;resolvePrompt();},whenIdle:()=>idle,session:{snapshotEvents:()=>[]}},dispose:async()=>{}})}}};
 await apply(ctx);t.after(async()=>{release();for(const close of cleanup)await close();});
 const files=[{name:'notes.md',mediaType:'text/markdown',data:Buffer.from('shared fact 42').toString('base64')}];
 const reply=await command.handler({agent:parent,rawInput:JSON.stringify({action:'send',target:'dsh',text:'read source',files})});assert.equal(reply.kind,'success');
 const view=JSON.parse(reply.text);assert.equal(view.sources[0].name,'notes.md');assert.equal(view.sources[0].characters,14);assert.equal(view.sources[0].text,undefined);assert.equal(rows.get(id).sources[0].text,'shared fact 42');
 await prompt;assert.match(received,/shared fact 42/);assert.match(received,/source 1: notes.md/);
 const invalid=await command.handler({agent:parent,rawInput:JSON.stringify({action:'get',files})});assert.equal(invalid.kind,'error');assert.match(invalid.text,/only for start\/send/);
});

test('Stopping cancels the native child and removes subscriptions before disposal',async t=>{
 const id='native-abort',rows=new Map([[id,{...freshRoom(),consent:true,question:'test'}]]),cleanup=[],handlers=new Map();let tool,cancelled=false,disposed=false,release;
 const idle=new Promise(resolve=>release=resolve);let resolveStarted;const started=new Promise(resolve=>resolveStarted=resolve);
 const ctx={webServer:{register:route=>{globalThis.__discussionRoute=route;return ()=>{};}},storageDomain:{open:async()=>({table:()=>({get:id=>rows.get(id),put:async(id,r)=>rows.set(id,structuredClone(r))}),close:async()=>{}})},commands:{register(){}},tools:{register:value=>{if(value.name==='agent_discussion')tool=value;}},subprocess:{resolveExecutable:async()=>{throw Error('not present');}},agentPresets:{composeFrom(){},serviceFor:()=>({get:()=>true,restrict(){},guard(){}})},effect:fn=>cleanup.push(fn())};
 const parent={id,options:{model:'mock'},session:{header:{cwd:'/workspace'}},ctx:{agents:{create:async spec=>{
  const child={id:'aborted-child',session:{snapshotEvents:()=>{throw Error('Aborted child must not read completion');}},followup:()=>resolveStarted(),whenIdle:()=>idle,cancel:cause=>{assert.equal(cause.kind,'parent');cancelled=true;release();}};
  spec.setup({on:(name,fn)=>{handlers.set(name,fn);return ()=>handlers.delete(name);}},child);
  return {agent:child,dispose:async()=>{assert.equal(handlers.has('session/event'),false);assert.equal(handlers.has('agent/assistant-stream'),false);disposed=true;}};
 }}}};
 await apply(ctx);t.after(async()=>{release();for(const close of cleanup)await close();});
 await tool.execute({action:'send',target:'dsh',text:'test'},{agent:parent});await started;
 await tool.execute({action:'stop'},{agent:parent});for(const close of cleanup)await close();cleanup.length=0;
 assert.equal(cancelled,true);assert.equal(disposed,true);assert.equal(rows.get(id).messages.find(m=>m.speaker==='dsh').status,'interrupted');
});

test('DSH discussion follows the selected route and clears startup effort',async()=>{
 let smoke,spec,restricted,guarded;const handlers=new Map();
 const current={provider:'current-provider',model:'current-model'};
 const ctx={webServer:{register:route=>{globalThis.__discussionRoute=route;return ()=>{};}},storageDomain:{open:async()=>({table:()=>({}),close:async()=>{}})},commands:{register(){}},tools:{register:t=>{if(t.name==='discussion_self_test')smoke=t;}},effect(){},
  agentPresets:{composeFrom(){},serviceFor:()=>({get:name=>['read','write','edit'].includes(name),restrict:value=>restricted=value,guard:fn=>guarded=fn()})}};
 await apply(ctx);
 const parent={id:'parent',options:{provider:'stale-provider',model:'removed-model',reasoningEffort:'old-effort'},session:{header:{cwd:'/workspace'},requestHeader:()=>({config:{provider:'logged-provider',model:'logged-model'}})},ctx:{get:()=>({agents:{selectionFor:()=>({current})}}),agents:{create:async value=>{
  spec=value;const child={id:'child',cancel(){},followup(){},whenIdle:async()=>completeFiles(value.meta.cwd),session:{snapshotEvents:()=>[{type:'turn/end',data:{reason:{kind:'completed'}}},{type:'assistant/message',data:{message:{content:[{type:'text',text:'2'}],source:{model:current.model}}}}]}};
  value.setup({on:(name,fn)=>{handlers.set(name,fn);return ()=>{};}},child);
  return {agent:child,dispose:async()=>{}};
 }}}};
 const result=await smoke.execute({}, {agent:parent});assert.equal(result.text,'2');
 assert.equal(spec.agentOptions.model,'current-model');assert.equal(spec.agentOptions.provider,'current-provider');assert.equal(spec.agentOptions.reasoningEffort,undefined);
 assert.deepEqual(restricted,{allow:['read','write','edit']});assert.equal(guarded,undefined);
 current.model='changed-after-creation';
 const assembled=await handlers.get('system-prompt/assemble')({}, {},async()=>({variables:{}}));assert.equal(assembled.variables.model,'current-model');
 const request=await handlers.get('agent/request')({},async()=>({provider:'wrong',model:'wrong',reasoningEffort:'inherited'}));
 assert.equal(request.model,'current-model');assert.equal(request.provider,'current-provider');assert.equal(request.reasoningEffort,undefined);
 parent.ctx.get=()=>undefined;
 await smoke.execute({}, {agent:parent});assert.equal(spec.agentOptions.model,'logged-model');
});

test('read-only discussion route serves same-origin snapshots without transcript events',async()=>{
 const id='route-session',rows=new Map([[id,{...freshRoom(),question:'q',messages:[{id:'m1',speaker:'user',text:'hi',round:0,time:1}]}]]),cleanup=[];
 const ctx={webServer:{register:route=>{globalThis.__route=route;return ()=>{};}},storageDomain:{open:async()=>({table:()=>({get:i=>rows.get(i),put:async(i,r)=>rows.set(i,structuredClone(r))}),close:async()=>{}})},commands:{register(){}},tools:{register(){}},subprocess:{resolveExecutable:async()=>{throw Error('none');}},effect:fn=>cleanup.push(fn())};
 await apply(ctx);
 const route=globalThis.__route;assert.equal(route.path,'/local-discussion/state');
 const call=(headers,url)=>new Promise(resolve=>{
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(code,extra){this.code=code;Object.assign(this.headers,extra||{});return this;},end(body){resolve({code:this.code,body});}};
  route.handler({method:'GET',url,headers},res);
 });
 const cross=await call({'sec-fetch-site':'cross-site'},'/local-discussion/state?session='+id);
 assert.equal(cross.code,403);
 const empty=await call({},'/local-discussion/state?session=nope');assert.equal(empty.code,200);assert.equal(JSON.parse(empty.body).status,'idle');
 const noSession=await call({},'/local-discussion/state');assert.equal(noSession.code,400);
 const ok=await call({'sec-fetch-site':'same-origin'},'/local-discussion/state?session='+id);
 assert.equal(ok.code,200);const view=JSON.parse(ok.body);assert.equal(view.question,'q');assert.equal(view.messages[0].text,'hi');assert.equal(view.calls,undefined);
 assert.equal(rows.get(id).messages.length,1);
 for(const close of cleanup)await close();
});

test('a max-tokens turn keeps the partial answer instead of failing the member',async()=>{
 const id='truncated',rows=new Map([[id,{...freshRoom(),consent:true,question:'q'}]]),cleanup=[];let tool;
 const ctx={webServer:{register:()=>()=>{}},storageDomain:{open:async()=>({table:()=>({get:i=>rows.get(i),put:async(i,r)=>rows.set(i,structuredClone(r))}),close:async()=>{}})},commands:{register(){}},tools:{register:value=>{if(value.name==='agent_discussion')tool=value;}},subprocess:{resolveExecutable:async()=>{throw Error('none');}},agentPresets:{composeFrom(){},serviceFor:()=>({get:()=>true,restrict(){},guard(){}})},effect:fn=>cleanup.push(fn())};
 const events=[{type:'assistant/message',data:{message:{content:[{type:'text',text:'前半段分析'}],source:{model:'m'}}}},{type:'turn/end',data:{reason:{kind:'max-tokens'}}}];
 const parent={id,options:{provider:'p',model:'m'},session:{header:{id:'parent',cwd:'/tmp'}},ctx:{agents:{create:async spec=>{
  const child={id:'c',session:{snapshotEvents:()=>events},followup(){},whenIdle:async()=>{},cancel(){}};
  spec.setup({on:()=>()=>{}},child);
  return {agent:child,dispose:async()=>{}};
 }}}};
 await apply(ctx);
 await tool.execute({action:'start',question:'q',consent:true},{agent:parent});
 for(let i=0;i<100&&rows.get(id).status==='running';i++)await new Promise(r=>setTimeout(r,20));
 const message=rows.get(id).messages.find(m=>m.speaker==='dsh');
 assert.ok(message, 'dsh message missing');
 assert.equal(message.status,'completed');
 assert.match(message.text,/前半段分析/);
 assert.match(message.text,/达到输出上限被截断/);
 for(const close of cleanup)await close();
});
