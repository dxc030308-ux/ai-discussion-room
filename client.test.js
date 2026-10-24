import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8');
const helpers=source.slice(source.indexOf('    function inlineMarkdown'),source.indexOf('    function ChatIcon'));
const {selectMessages,Markdown,TEMPLATES,elapsedMs,formatElapsed,usageText,actionsMarkdown,documentMediaType,documentError}=runInNewContext(helpers+'; ({selectMessages,Markdown,TEMPLATES,elapsedMs,formatElapsed,usageText,actionsMarkdown,documentMediaType,documentError})',{
 h:(tag,props,...children)=>({tag,props,children}),
});
test('message filters combine without altering the complete transcript',()=>{
 const messages=[{speaker:'claude',text:'Evidence ALPHA',round:1},{speaker:'dsh',text:'Alpha synthesis',round:4},{speaker:'system',text:'Alpha unavailable',round:0}];
 assert.equal(selectMessages(messages,'all',' alpha ',false).length,3);
 assert.equal(selectMessages(messages,'claude','evidence',false)[0],messages[0]);
 assert.equal(selectMessages(messages,'all','ALPHA',true)[0],messages[1]);
 assert.equal(selectMessages(messages,'claude','',true).length,0);
 assert.equal(selectMessages(messages,'all','missing',false).length,0);
 assert.equal(messages.length,3);
});
test('round filter combines with speaker and keywords and accepts empty streaming text',()=>{
 const messages=[{speaker:'dsh',round:1,text:'',status:'streaming'},{speaker:'claude',round:1,text:'Evidence'},{speaker:'claude',round:2,text:'Evidence review'}];
 assert.equal(selectMessages(messages,'all','',false,'1').length,2);
 assert.equal(selectMessages(messages,'claude','review',false,'1').length,0);
 assert.equal(selectMessages(messages,'claude','review',false,'2')[0],messages[2]);
 assert.equal(selectMessages(messages,'all','anything',false,'all').length,0);
});
test('elapsed and usage show only supplied observations without estimated totals',()=>{
 assert.equal(elapsedMs({startedAt:1000},2500),1500);
 assert.equal(elapsedMs({startedAt:'2026-10-24T00:00:00Z',finishedAt:'2026-10-24T00:00:02Z'},999),2000);
 assert.equal(elapsedMs({durationMs:0},100),0);
 assert.equal(elapsedMs({startedAt:'invalid'},100),null);
 assert.equal(elapsedMs({},100),null);
 assert.equal(formatElapsed(null),'-');
 assert.equal(formatElapsed(1500),'1.5s');
 assert.equal(usageText(undefined),'-');
 assert.equal(usageText({}),'-');
 assert.equal(usageText({inputTokens:12,outputTokens:0}),'inputTokens: 12 · outputTokens: 0');
 assert.equal(usageText({input_tokens:12,output_tokens:3,cached_input_tokens:2}),'input_tokens: 12 · output_tokens: 3 · cached_input_tokens: 2');
 assert.equal(usageText({inputTokens:12}).includes('total'),false);
});
test('five local templates use localized briefs and distinct actual stage labels',()=>{
 assert.deepEqual(Object.keys(TEMPLATES),['review','architecture','risk','code','requirements']);
 const dictionaries=source.slice(source.indexOf('const dictionaries'),source.indexOf('const css'));
 const locales=[dictionaries.slice(dictionaries.indexOf('en: {'),dictionaries.indexOf('zh: {')),dictionaries.slice(dictionaries.indexOf('zh: {'))];
 for(const [id,keys] of Object.entries(TEMPLATES)) {
  assert.equal(keys.length,4);
  assert.equal(new Set(keys).size,4);
  for(const key of [id+'Template',...keys])for(const locale of locales)assert.match(locale,new RegExp('\\b'+key+':'),key);
 }
});
test('document validation enforces type, per-file byte limits and eight documents',()=>{
 const mib=1024*1024;
 assert.equal(documentMediaType({name:'REPORT.PDF',type:''}),'application/pdf');
 assert.equal(documentMediaType({name:'index.ts',type:''}),'text/plain');
 assert.equal(documentError([{name:'notes.txt',size:mib}],7),null);
 assert.equal(documentError([{name:'report.pdf',size:10*mib}],0),null);
 assert.equal(documentError([{name:'report.pdf',size:10*mib+1}],0),'fileTooLarge');
 assert.equal(documentError([{name:'code.py',size:mib+1}],0),'fileTooLarge');
 assert.equal(documentError([{name:'binary.exe',type:'application/octet-stream',size:1}],0),'fileUnsupported');
 assert.equal(documentError([{name:'notes.txt',size:1}],8),'fileLimit');
});
test('action Markdown includes acceptance and sources and keeps table cells intact',()=>{
 const text=actionsMarkdown([{task:'a|b\nnext',owner:'DSH',priority:'P1',acceptance:'Pass checks',evidence:['m1','m2']}],['Task','Owner','Priority','Acceptance','Sources']);
 assert.match(text,/a\\\|b next/);
 assert.ok(text.includes('Pass checks | m1, m2'));
 assert.equal(text.split('\n').length,3);
});
test('Markdown keeps fenced code literal, supports headings and unfinished fences safely',()=>{
 const tree=Markdown({text:'# Result\n\n```js\n- literal\n<strong>not HTML</strong>\n```\n\n- **evidence**\n\n~~~\nconst pending = 1;'});
 const blocks=tree.children[0];
 assert.equal(blocks[0].tag,'h3');
 assert.equal(blocks[1].tag,'pre');
 assert.equal(blocks[1].children[0].children[0],'- literal\n<strong>not HTML</strong>');
 assert.equal(blocks[2].tag,'ul');
 assert.equal(blocks[3].children[0].children[0],'const pending = 1;');
 const nested=Markdown({text:'````md\n```js\nconst x = 1;\n```\n````'});
 assert.equal(nested.children[0][0].children[0].children[0],'```js\nconst x = 1;\n```');
});
test('client keeps safe native rendering and scoped panel entry',()=>{
 assert.ok(!source.includes('dangerouslySetInnerHTML'));
 assert.ok(!source.includes("require('@deepseek-ai/"));
 assert.ok(source.includes("name: 'main', key: 'agent-discussion'"));
 assert.ok(source.includes("id: 'agent-discussion', order: 30"));
 assert.ok(source.includes('reference?.release()'));
 assert.ok(source.includes('controller.abort()'));
 assert.ok(source.includes('consent: true'));
 assert.ok(source.includes('!consent || !question.trim()'));
 assert.ok(source.includes('onPaste: pasteImages'));
 assert.ok(source.includes('asAttachments(images)'));
 assert.ok(source.includes('scope.remote.commands.execute(\'/discuss \' + JSON.stringify(payload), attachments, controller.signal)'));
 assert.ok(source.includes('MAX_IMAGE_BYTES'));
 assert.ok(source.includes('imageTotal'));
});
test('browser export helpers stay synchronized with the import-free source module',()=>{
 const original=readFileSync(new URL('./document-export.js',import.meta.url),'utf8').trim().replace(/export function /g,'function ');
 const mirrored=source.slice(source.indexOf('    const encoder ='),source.indexOf('    // End mirrored browser export helpers.')).split('\n').map(line=>line.startsWith('    ')?line.slice(4):line).join('\n').trim();
 assert.equal(mirrored,original);
 const {docxBytes,printHtml}=runInNewContext(mirrored+'; ({docxBytes,printHtml})',{TextEncoder});
 assert.equal(new DataView(docxBytes('题目',['<script>alert(1)</script>']).buffer).getUint32(0,true),0x04034b50);
 const html=printHtml('<script>title</script>',['<img src=x onerror=alert(1)>']);
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<img'));
 assert.ok(html.includes('&lt;img'));
 assert.ok(!/^\s*(?:import|export)\s/m.test(source));
});
test('all static translation keys exist in both locales',()=>{
 const dictionaries=source.slice(source.indexOf('const dictionaries'),source.indexOf('const css'));
 const en=dictionaries.slice(dictionaries.indexOf('en: {'),dictionaries.indexOf('zh: {'));
 const zh=dictionaries.slice(dictionaries.indexOf('zh: {'));
 const keys=[...source.matchAll(/\bt\('([^']+)'\)/g)].map(m=>m[1]);
 for(const key of keys)for(const locale of [en,zh])assert.match(locale,new RegExp('\\b'+key+':'),key);
});
