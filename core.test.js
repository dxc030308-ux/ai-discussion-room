import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Discussion, memberTimeout} from './core.js';
function setup(run=async(s,p)=>({text:`${s} answer`,model:'mock'})){
 const db=new Map();const seen=[];const d=new Discussion({load:id=>db.get(id),save:async(id,r)=>{db.set(id,structuredClone(r));},capabilities:async()=>({claude:{available:true},codex:{available:false,reason:'unsafe'}}),run:async(...args)=>{seen.push(args);return run(...args);}});return {d,db,seen};
}
async function finish(d){await Promise.all([...d.live.values()].map(c=>c.done));}
test('two rounds share exact frozen first round and summarize; durable calls',async()=>{
 const {d,db,seen}=setup();await d.action('a',{action:'start',question:'why?',materials:'evidence',consent:true});await finish(d);
 assert.equal(seen.length,5);assert.ok(!seen[0][1].includes('dsh answer'));assert.ok(seen[2][1].includes('claude answer'));assert.equal(db.get('a').calls.length,5);assert.equal(db.get('a').status,'completed');assert.ok(db.get('a').messages.some(m=>m.text.includes('codex 未参与')));
 const view=await d.action('a',{action:'get'});assert.equal(view.calls,undefined);
});
test('every template keeps the main question anchored through independent analysis, mutual improvement and synthesis',async()=>{
 for(const templateId of [undefined,'review','architecture','risk','code','requirements']){
  const {d,seen}=setup();
  await d.action('focus',{action:'start',question:'只解决保存时草稿丢失的问题',materials:'同事提出无关的图标改版建议',templateId,consent:true});await finish(d);
  assert.equal(seen.length,5);
  for(const [,prompt] of seen){
   assert.match(prompt,/主要问题（讨论锚点）：\n只解决保存时草稿丢失的问题/);
   assert.match(prompt,/其他成员的延伸建议不自动成为新需求/);
   assert.match(prompt,/只有会影响当前结论的必要信息缺口才列为待确认项/);
  }
  for(const [,prompt] of seen.slice(0,2)){assert.match(prompt,/本次任务：独立分析阶段/);assert.doesNotMatch(prompt,/dsh answer|claude answer/);}
  for(const [,prompt] of seen.slice(2,4)){assert.match(prompt,/本次任务：相互审查与取长补短阶段/);assert.match(prompt,/吸收有依据的优点，纠正自己的不足/);assert.match(prompt,/dsh answer/);assert.match(prompt,/claude answer/);}
  assert.match(seen[4][1],/本次任务：最终汇总阶段/);
  assert.match(seen[4][1],/台账行动项和建议追问也必须服务于主问题/);
  assert.match(seen[4][1],/discussion-ledger/);
  seen.length=0;await d.action('focus',{action:'send',target:'dsh',text:'补充：也要检查保存失败后的重试'});await finish(d);
  assert.match(seen[0][1],/用户后续明确补充或调整的要求也属于范围/);
  assert.match(seen[0][1],/本次任务：回答用户补充：补充：也要检查保存失败后的重试/);
 }
});
test('member timeouts allow slow local investigations without stranding discussions',()=>{
 assert.equal(memberTimeout('discussion'),240000);assert.equal(memberTimeout('workspace'),600000);
});
test('consent gate, invalid recipient, targeted follow-up',async()=>{const {d,seen}=setup();await assert.rejects(d.action('a',{action:'start',question:'why?'}));await d.action('a',{action:'start',question:'why?',consent:true});await finish(d);await assert.rejects(d.action('a',{action:'send',text:'x',target:'shell'}));seen.length=0;await d.action('a',{action:'send',text:'check',target:'claude'});await finish(d);assert.deepEqual(seen.map(x=>x[0]),['claude']);});
test('stop cancels active calls and does not start review or summary',async()=>{const {d,db,seen}=setup(async(s,p,signal)=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('stopped')),{once:true})));await d.action('a',{action:'start',question:'why?',consent:true});await new Promise(r=>setImmediate(r));await d.action('a',{action:'stop'});await finish(d);assert.equal(db.get('a').status,'interrupted');assert.equal(seen.length,2);assert.equal(db.get('a').error,undefined);assert.ok(db.get('a').calls.every(call=>call.status==='interrupted'));assert.ok(db.get('a').messages.filter(m=>m.speaker==='dsh'||m.speaker==='claude').every(m=>m.status==='interrupted'));});
test('failures are not reported as full discussion success',async()=>{const {d,db}=setup(async()=>{throw Error('auth failed');});await d.action('a',{action:'start',question:'why?',consent:true});await finish(d);assert.equal(db.get('a').status,'interrupted');assert.match(db.get('a').phase,/失败/);assert.match(db.get('a').error,/调用失败/);});
test('shared images reach every round and stay in the room view',async()=>{
 const {d,db,seen}=setup();const image={attachmentId:'a'.repeat(64),mediaType:'image/png',bytes:68,width:1,height:1,name:'red.png'};
 await d.action('a',{action:'start',question:'what color?',consent:true,attachments:[{type:'image',attachment:image}]});await finish(d);
 assert.equal(seen.length,5);assert(seen.every(args=>args[3].length===1&&args[3][0].attachmentId===image.attachmentId));assert.match(seen[0][1],/共享图片/);
 const view=await d.action('a',{action:'get'});assert.equal(view.images.length,1);assert.equal(view.messages[0].images.length,1);assert.equal(view.calls,undefined);
 await d.action('a',{action:'send',text:'and now?',target:'all',attachments:[{type:'image',attachment:{...image,attachmentId:'b'.repeat(64)}}]});await finish(d);
 assert.equal(db.get('a').images.length,2);
});
test('file attachments are refused instead of being treated as images',async()=>{
 const {d}=setup();
 await assert.rejects(d.action('a',{action:'start',question:'x',consent:true,attachments:[{type:'file',attachment:{attachmentId:'c'}}]}),/Only image/);
});
test('workspace mode persists, passes access and runs members sequentially',async()=>{
 let active=0,max=0;const {d,db,seen}=setup(async()=>{max=Math.max(max,++active);await new Promise(resolve=>setImmediate(resolve));--active;return {text:'verified'};});
 await d.action('a',{action:'start',question:'edit requested file',consent:true,access:'workspace'});await finish(d);
 assert.equal(db.get('a').access,'workspace');assert.equal(max,1);assert.ok(seen.every(args=>args[4]==='workspace'));assert.match(seen[0][1],/本地协作模式/);assert.ok(!seen[0][1].includes('不要调用工具'));
 await d.action('a',{action:'send',target:'dsh',text:'inspect only',access:'discussion'});await finish(d);assert.equal(seen.at(-1)[4],'discussion');
 await assert.rejects(d.action('a',{action:'send',target:'all',text:'edit',access:'workspace'}),/Confirm workspace/);
 await d.action('a',{action:'send',target:'dsh',text:'edit',access:'workspace',consent:true});await finish(d);assert.equal(seen.at(-1)[4],'workspace');
 await assert.rejects(d.action('a',{action:'start',question:'x',access:'unbounded',consent:true}),/Invalid access/);
});
test('real progress persists before completion and errors preserve partial text',async()=>{
 let release,started;const waiting=new Promise(resolve=>started=resolve);
 const {d,db}=setup(async(s,p,signal,images,access,progress)=>{
   progress({text:'partial '+s,state:'responding',model:'actual',usage:{outputTokens:2}});started();
   await new Promise(resolve=>release=resolve);throw Error('provider dropped');
 });
 // A targeted run keeps test deterministic and leaves the room history intact.
 db.set('a',{...freshRoomForTest(),consent:true,question:'q'});
 await d.action('a',{action:'send',target:'dsh',text:'check'});await waiting;await new Promise(r=>setImmediate(r));
 let view=await d.get('a');assert.equal(view.activeCalls.length,1);assert.equal(view.messages.at(-1).text,'partial dsh');assert.equal(view.messages.at(-1).status,'streaming');assert.equal(view.messages.at(-1).usage.outputTokens,2);
 release();await finish(d);view=await d.get('a');assert.equal(view.messages.at(-1).text,'partial dsh');assert.equal(view.messages.at(-1).status,'error');assert.match(view.messages.at(-1).error,/dropped/);assert.ok(view.messages.at(-1).durationMs>=0);
});
function freshRoomForTest(){return {status:'completed',phase:'',messages:[],calls:[],pending:[],images:[],sources:[],access:'discussion',materials:'',consent:false};}
test('retry only reruns failed member using exact original context and retains all history',async()=>{
 let fail=true;const {d,db,seen}=setup(async(s,p)=>{if(s==='claude'&&fail)throw Error('retry me');return {text:s+' ok'};});
 await d.action('a',{action:'start',question:'q',consent:true});await finish(d);
 const before=structuredClone(db.get('a').messages);const failed=before.find(m=>m.speaker==='claude'&&m.status==='error');const original=db.get('a').calls.find(c=>c.id===failed.callId);fail=false;seen.length=0;
 await assert.rejects(d.action('a',{action:'retry',messageId:failed.id}),/Confirm retry/);
 await d.action('a',{action:'retry',messageId:failed.id,consent:true});await finish(d);
 assert.equal(seen.length,1);assert.equal(seen[0][0],'claude');assert.equal(seen[0][1],original.prompt);assert.deepEqual(db.get('a').messages.slice(0,before.length),before);assert.equal(db.get('a').messages.at(-1).retryOf,original.id);
 await assert.rejects(d.action('a',{action:'retry',messageId:failed.id,consent:true}),/already been retried/);
 await assert.rejects(d.action('a',{action:'retry',messageId:db.get('a').messages.at(-1).id,consent:true}),/Only failed/);
});
test('branches preserve original context and compare only chosen frozen discussions',async()=>{
 const {d,db,seen}=setup();await d.action('a',{action:'start',question:'q',consent:true});await finish(d);
 const original=structuredClone(db.get('a').messages),root=original.find(m=>m.speaker==='dsh');
 await d.action('a',{action:'branch',messageId:root.id,label:'Alternative',consent:true});const branchId=db.get('a').branchId;
 assert.notEqual(branchId,'main');assert.equal(db.get('a').messages.at(-1).id,root.id);
 await d.action('a',{action:'send',target:'dsh',text:'branch-only nonce'});await finish(d);
 await d.action('a',{action:'switchBranch',branchId:'main'});assert.deepEqual(db.get('a').messages,original);
 const view=await d.get('a');assert.equal(view.branches.length,2);assert.equal(view.branches[1].snapshot,undefined);
 await d.action('a',{action:'switchBranch',branchId});assert.ok(db.get('a').messages.some(m=>m.text.includes('branch-only nonce')));
 seen.length=0;await d.action('a',{action:'compare',branchIds:['main',branchId],consent:true});await finish(d);assert.equal(seen.length,1);assert.match(seen[0][1],/branch-only nonce/);assert.match(seen[0][1],/Alternative/);
});
test('templates change round tasks and source metadata hides raw extracted text',async()=>{
 const {d,seen}=setup();await d.action('a',{action:'start',question:'q',templateId:'risk',consent:true,sources:[{name:'sample.py',mediaType:'text/plain',text:'source nonce',truncated:true}]});await finish(d);
 assert.match(seen[0][1],/Independently identify risks/);assert.match(seen[0][1],/source nonce/);const view=await d.get('a');assert.equal(view.sources[0].text,undefined);assert.equal(view.sources[0].characters,12);assert.equal(view.messages[0].files[0].truncated,true);
});
test('summary ledger validates real message IDs and new followups mark it stale',async()=>{
 const {d,db}=setup(async(s,p)=>({text:p.includes('discussion-ledger')?'Summary\n```discussion-ledger\n'+JSON.stringify({consensus:[{text:'supported',evidence:['invented']}],actions:[],followups:['How to validate?']})+'\n```':'evidence'}));
 await d.action('a',{action:'start',question:'q',consent:true});await finish(d);
 assert.equal(db.get('a').decision.consensus[0].evidence.length,0);assert.equal(db.get('a').messages.at(-1).text,'Summary');
 await d.action('a',{action:'send',target:'dsh',text:'more'});await finish(d);assert.equal(db.get('a').decisionStale,true);
});
test('restart marks unfinished record interrupted without running calls',async()=>{const {d,db,seen}=setup();db.set('a',{status:'running',messages:[],pending:[],calls:[]});assert.equal((await d.get('a')).status,'interrupted');assert.equal(seen.length,0);});
test('cumulative shared files remain usable above the per-message extraction limit',async()=>{
 const {d,db,seen}=setup();await d.action('a',{action:'start',question:'q',consent:true,sources:Array.from({length:4},(_,i)=>({name:`${i}.txt`,text:`fact ${i}`}))});await finish(d);
 await d.action('a',{action:'send',target:'dsh',text:'read all files',sources:[{name:'fifth.txt',text:'fifth fact'}]});await finish(d);
 assert.equal(db.get('a').status,'completed');assert.equal(db.get('a').sources.length,5);assert.match(seen.at(-1)[1],/fifth fact/);assert.match(seen.at(-1)[1],/fact 0/);
});
test('branch prefixes exclude later attachments while retaining original and legacy context',async()=>{
 const {d,db,seen}=setup();const image=attachmentId=>({type:'image',attachment:{attachmentId,name:attachmentId+'.png'}});
 await d.action('a',{action:'start',question:'q',consent:true,sources:[{name:'early.txt',text:'EARLY_FILE'}],attachments:[image('early')]});await finish(d);
 const root=db.get('a').messages[0].id;
 await d.action('a',{action:'send',target:'dsh',text:'later',sources:[{name:'late.txt',text:'LATE_FILE'}],attachments:[image('late')]});await finish(d);
 db.get('a').sources.push({name:'legacy.txt',text:'LEGACY_FILE'});
 await d.action('a',{action:'branch',messageId:root,consent:true});await d.action('a',{action:'send',target:'dsh',text:'branch answer'});await finish(d);
 assert.match(seen.at(-1)[1],/EARLY_FILE/);assert.match(seen.at(-1)[1],/LEGACY_FILE/);assert.doesNotMatch(seen.at(-1)[1],/LATE_FILE/);assert.deepEqual(seen.at(-1)[3].map(i=>i.attachmentId),['early']);
 await d.action('a',{action:'switchBranch',branchId:'main'});assert.equal(db.get('a').sources.length,3);assert.equal(db.get('a').images.length,2);
});
test('switching JSON-restored branches clears absent optional state',async()=>{
 const {d,db}=setup();db.set('a',{...freshRoomForTest(),consent:true,question:'q',messages:[{id:'root',speaker:'user',text:'q',round:0}]});
 await d.action('a',{action:'branch',messageId:'root',consent:true});const branchId=db.get('a').branchId;
 db.set('a',JSON.parse(JSON.stringify(db.get('a'))));Object.assign(db.get('a'),{decision:{followups:['branch only']},decisionStale:true,error:'branch error',templateId:'risk'});
 await d.action('a',{action:'switchBranch',branchId:'main'});
 for(const field of ['decision','decisionStale','error','templateId'])assert.equal(db.get('a')[field],undefined,field);
 await d.action('a',{action:'switchBranch',branchId});assert.deepEqual(db.get('a').decision.followups,['branch only']);assert.equal(db.get('a').error,'branch error');
});
test('retry finishes selected attempt then drains accepted pending messages without resuming stopped rounds',async()=>{
 let notifyStarted,block=true;const started=new Promise(resolve=>notifyStarted=resolve);
 const {d,db,seen}=setup(async(s,p,signal)=>{
  if(block){notifyStarted();await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('stopped')),{once:true}));}
  return {text:s+' completed'};
 });
 db.set('a',{...freshRoomForTest(),consent:true,question:'q'});
 await d.action('a',{action:'send',target:'dsh',text:'first'});await started;
 await d.action('a',{action:'send',target:'claude',text:'queued'});await d.action('a',{action:'stop'});await finish(d);
 assert.equal(db.get('a').pending.length,1);assert.equal(seen.length,1);
 const interrupted=db.get('a').messages.find(m=>m.status==='interrupted');block=false;seen.length=0;
 await d.action('a',{action:'retry',messageId:interrupted.id,consent:true});await finish(d);
 assert.deepEqual(seen.map(args=>args[0]),['dsh','claude']);assert.match(seen[0][1],/本次任务：回答用户补充：first/);assert.match(seen[1][1],/本次任务：回答用户补充：queued/);assert.equal(db.get('a').pending.length,0);assert.equal(db.get('a').status,'completed');
});
test('pending messages drained after a summary retry keep its decision stale',async()=>{
 const {d,db,seen}=setup();db.set('a',{...freshRoomForTest(),consent:true,question:'q',decision:{followups:['old']},messages:[{id:'failed',speaker:'dsh',text:'failed summary',round:4,time:2,status:'error',callId:'summary'}],calls:[{id:'summary',speaker:'dsh',round:4,prompt:'frozen summary',time:1,status:'error'}],pending:[{text:'new evidence',target:'dsh'}]});
 await d.action('a',{action:'retry',messageId:'failed',consent:true});await finish(d);
 assert.equal(seen.length,2);assert.equal(seen[0][1],'frozen summary');assert.equal(db.get('a').pending.length,0);assert.equal(db.get('a').decisionStale,true);
});
test('legacy interrupted messages regain unique call links and retry original context after restart',async()=>{
 const {d,db,seen}=setup();const images=[{attachmentId:'legacy-image'}];
 db.set('a',{...freshRoomForTest(),status:'running',consent:true,question:'q',images,access:'workspace',messages:[
  {id:'old',speaker:'dsh',text:'older partial',time:11,round:1,status:'error'},
  {id:'new',speaker:'dsh',text:'new partial',time:21,round:2,status:'streaming'}
 ],calls:[{id:'old-call',speaker:'dsh',prompt:'old frozen prompt',time:10,status:'error'},{id:'new-call',speaker:'dsh',prompt:'new frozen prompt',time:20,status:'running'}]});
 const view=await d.get('a');assert.equal(view.messages[0].callId,'old-call');assert.equal(view.messages[1].callId,'new-call');assert.equal(view.messages[1].status,'interrupted');
 await d.action('a',{action:'retry',messageId:'new',consent:true});await finish(d);
 assert.equal(seen.length,1);assert.equal(seen[0][1],'new frozen prompt');assert.deepEqual(seen[0][3],images);assert.equal(seen[0][4],'workspace');assert.equal(db.get('a').calls[1].messageId,'new');assert.equal(db.get('a').calls[1].round,2);assert.equal(db.get('a').messages.at(-1).round,2);assert.equal(db.get('a').messages.at(-1).retryOf,'new-call');
});
