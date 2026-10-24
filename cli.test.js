import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, writeFile } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import { getEventListeners } from 'node:events';
import { setImmediate as immediate } from 'node:timers/promises';
import { inspectCli, invoke, isolated, runCli } from './cli.js';

const help = '--safe-mode --restricted --tools Use "" to disable all --allowedTools --strict-mcp-config --setting-sources --disable-slash-commands --no-chrome --permission-mode --permission-prompts --no-session-persistence --output-format --include-partial-messages dontAsk stream-json';
function mock({ version = '2.1.300 (Claude Code)', output, stderr = '', lossy = false, exitCode = 0, helpText = help } = {}) {
  const calls = [];
  return { calls, async resolveExecutable(p) { return p; }, spawn(spec) {
    calls.push(spec);
    const probe = spec.argv.includes('--help') || spec.argv.includes('--version');
    const text = spec.argv.includes('--help') ? helpText : spec.argv.includes('--version') ? version : output ?? '{"type":"system","subtype":"init","tools":[],"model":"test"}\n{"type":"result","subtype":"success","result":"answer","session_id":"id"}';
    const stdout = new PassThrough(); if (spec.stdio.stdout === 'pipe') stdout.end(text);
    return { stdout, done: Promise.resolve({ exitCode: probe ? 0 : exitCode, signal: null }), collected: { stdout: { readFrom(offset) { assert.equal(offset, 0); return { text, lossy: probe ? false : lossy }; } }, stderr: { readFrom() { return { text: stderr, lossy: false }; } } } };
  } };
}
test('managed no-tools invocation, stdin, empty cwd and cleanup', async () => {
  const subprocess = mock();
  const result = await runCli('claude', 'untrusted $(touch forbidden)', { subprocess });
  assert.deepEqual(result, { text: 'answer', model: 'test', sessionId: 'id' });
  const call = subprocess.calls.at(-1);
  assert.equal(call.stdio.stdin.data, 'untrusted $(touch forbidden)');
  assert(!call.argv.some(arg => arg.includes('touch forbidden')));
  for (const flag of ['--safe-mode', '--strict-mcp-config', '--disable-slash-commands', '--no-session-persistence']) assert(call.argv.includes(flag));
  assert.equal(call.argv[call.argv.indexOf('--tools') + 1], '');
  assert(!call.argv.includes('--allowedTools'));
  assert.equal(call.argv[call.argv.indexOf('--setting-sources') + 1], 'user');
  assert(!call.argv.includes('--restricted'));
  assert.equal(call.argv[call.argv.indexOf('--mcp-config') + 1], '{"mcpServers":{}}');
  assert.equal(call.argv[call.argv.indexOf('--permission-mode') + 1], 'dontAsk');
  assert.equal(call.argv[call.argv.indexOf('--permission-prompts') + 1], 'none');
  assert.equal(call.graceMs, 1000);
  assert.equal(call.stdio.stdout.maxBytes, 1048576);
  assert(!('NODE_OPTIONS' in call.env));
  await assert.rejects(access(call.cwd));
});
test('image input uses stream-json without exposing a path or enabling tools', async () => {
  const subprocess = mock();
  const data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lK3V6QAAAABJRU5ErkJggg==';
  await runCli('claude', 'describe', { subprocess, images: [{ mediaType: 'image/png', data }] });
  const call = subprocess.calls.at(-1);
  assert(call.argv.includes('--input-format'));
  assert.equal(call.argv[call.argv.indexOf('--input-format') + 1], 'stream-json');
  assert.equal(call.argv[call.argv.indexOf('--tools') + 1], '');
  const input = JSON.parse(call.stdio.stdin.data.trim());
  assert.equal(input.type, 'user');
  assert.equal(input.message.content[0].text, 'describe');
  assert.deepEqual(input.message.content[1], { type: 'image', source: { type: 'base64', media_type: 'image/png', data } });
  assert(!call.argv.join(' ').includes(data));
  await assert.rejects(access(call.cwd));
});
test('too many images fail before any process starts', async () => {
  const subprocess = mock();
  const image = { mediaType: 'image/png', data: 'AAAA' };
  await assert.rejects(runCli('claude', 'x', { subprocess, images: Array(5).fill(image) }), /At most 4/);
  assert.equal(subprocess.calls.length, 0);
});
test('unverified Codex version is unavailable even if executable exists', async () => {
  const subprocess = mock();
  const status = await inspectCli(subprocess);
  assert.equal(status.claude.available, true);
  assert.equal(status.codex.available, false);
  await assert.rejects(runCli('codex', 'test', { subprocess }), /Unverified Codex/);
  assert(subprocess.calls.every(call => call.argv.includes('--help') || call.argv.includes('--version')));
});
test('unverified version fails closed before model invocation', async () => {
  const subprocess = mock({ version: 'claude 1.2.3' });
  await assert.rejects(runCli('claude', 'test', { subprocess }), /Unverified/);
  assert(subprocess.calls.every(call => call.argv.includes('--help') || call.argv.includes('--version')));
});
for (const [name, options] of [
  ['tool call', { output: '{"type":"assistant","message":{"content":[{"type":"tool_use"}]}}' }],
  ['exposed tool', { output: '{"type":"system","subtype":"init","tools":["Read"]}' }],
  ['failure result', { output: '{"type":"result","subtype":"error","is_error":true}' }],
  ['malformed JSON', { output: 'not json' }],
  ['truncation', { lossy: true }],
  ['process error', { exitCode: 1 }],
]) test(`reject ${name}`, async () => {
  const subprocess = mock(options);
  await assert.rejects(runCli('claude', 'test', { subprocess }));
  await assert.rejects(access(subprocess.calls.at(-1).cwd));
});
test('exit 1 structured authentication failure remains diagnosable without raw logs', async () => {
  const subprocess = mock({exitCode:1,output:'{"type":"result","is_error":true,"result":"Not logged in · Please run /login"}'});
  await assert.rejects(runCli('claude','private-prompt',{subprocess}),error => {
    assert.match(error.message,/authentication unavailable/);
    assert(!error.message.includes('private-prompt')); return true;
  });
});
test('stderr option diagnostic is bounded and does not leak prompt or credentials', async () => {
  const subprocess=mock({exitCode:1,stderr:'error: unknown option --bad-flag\nAuthorization: Bearer SECRET\nprivate-prompt\n'+ 'x'.repeat(12000)});
  await assert.rejects(runCli('claude','private-prompt',{subprocess}),error => {
    assert.match(error.message,/invalid CLI option --bad-flag/);
    assert(error.message.length<250);assert(!/SECRET|private-prompt|Authorization/.test(error.message));return true;
  });
});
test('unknown stderr is withheld rather than propagated',async()=>{
  const subprocess=mock({exitCode:1,stderr:'private-prompt SECRET'});
  await assert.rejects(runCli('claude','private-prompt',{subprocess}),error=>{assert.match(error.message,/content withheld/);assert(!/SECRET|private-prompt/.test(error.message));return true;});
});
const nativeTools = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash'];
const workspaceOutput = (tools = nativeTools, blocks = tools.map(name => ({ type: 'tool_use', name })), result = {}) => [
  { type: 'system', subtype: 'init', tools, model: 'workspace-test' },
  { type: 'assistant', message: { content: blocks } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'id', content: 'done' }] } },
  { type: 'result', subtype: 'success', result: 'files updated', permission_denials: [], ...result },
].map(row => JSON.stringify(row)).join('\n');

test('workspace uses existing cwd and explicit native tool permissions without global bypass', async () => {
  await isolated(async workspace => {
    await writeFile(`${workspace}/keep.txt`, 'keep');
    const subprocess = mock({ output: workspaceOutput() });
    assert.deepEqual(await runCli('claude', 'update files', { subprocess, workspace }), { text: 'files updated', model: 'workspace-test' });
    assert(subprocess.calls.every(call => call.cwd === workspace));
    const call = subprocess.calls.at(-1);
    assert.deepEqual(call.argv[call.argv.indexOf('--tools') + 1].split(','), nativeTools);
    const allowed = call.argv[call.argv.indexOf('--allowedTools') + 1].split(',');
    assert(nativeTools.filter(tool => tool !== 'Bash').every(tool => allowed.includes(tool)));
    for (const command of ['Bash(pwd)', 'Bash(ls *)', 'Bash(git diff *)', 'Bash(node --test *)']) assert(allowed.includes(command));
    assert(!allowed.includes('Bash'));
    assert(!/WebFetch|WebSearch|curl|wget|ssh/.test(allowed.join(',')));
    for (const flag of ['--safe-mode', '--strict-mcp-config', '--disable-slash-commands', '--no-chrome']) assert(call.argv.includes(flag));
    for (const flag of ['--dangerously-skip-permissions', '--allow-dangerously-skip-permissions', '--restricted']) assert(!call.argv.includes(flag));
    assert.equal(call.argv[call.argv.indexOf('--permission-mode') + 1], 'dontAsk');
    assert.equal(call.argv[call.argv.indexOf('--permission-prompts') + 1], 'none');
    assert.equal(call.argv[call.argv.indexOf('--mcp-config') + 1], '{"mcpServers":{}}');
    assert.equal(call.argv[call.argv.indexOf('--setting-sources') + 1], 'user');
    assert.equal(await readFile(`${workspace}/keep.txt`, 'utf8'), 'keep');
  });
});

test('runCli forwards workspace to Codex native workspace mode', async () => {
  await isolated(async workspace => {
    const output = [
      { type: 'item.completed', item: { type: 'file_change', changes: [] } },
      { type: 'item.completed', item: { type: 'agent_message', text: 'updated' } },
      { type: 'turn.completed' },
    ].map(row => JSON.stringify(row)).join('\n');
    const subprocess = mock({ version: 'codex-cli 0.153.4', output });
    assert.equal((await runCli('codex', 'edit files', { subprocess, workspace })).text, 'updated');
    const call = subprocess.calls.at(-1);
    assert.equal(call.cwd, workspace);
    assert.equal(call.argv[call.argv.indexOf('--cd') + 1], workspace);
    assert.equal(call.argv[call.argv.indexOf('--sandbox') + 1], 'workspace-write');
    await access(workspace);
  });
});

test('workspace image input keeps native tools and stream-json', async () => {
  await isolated(async workspace => {
    const subprocess = mock({ output: workspaceOutput() });
    await runCli('claude', 'describe and edit', { subprocess, workspace, images: [{ mediaType: 'image/png', data: 'AAAA' }] });
    const call = subprocess.calls.at(-1);
    assert.equal(call.cwd, workspace);
    assert.equal(call.argv[call.argv.indexOf('--input-format') + 1], 'stream-json');
    assert(call.argv.includes('--allowedTools'));
    assert.equal(JSON.parse(call.stdio.stdin.data).message.content[1].type, 'image');
  });
});

test('invalid workspace paths fail before any process starts', async () => {
  const subprocess = mock();
  for (const workspace of ['relative', '', null, 42]) await assert.rejects(runCli('claude', 'test', { subprocess, workspace }), /absolute directory path/);
  await isolated(async workspace => {
    await writeFile(`${workspace}/file.txt`, 'file');
    await assert.rejects(runCli('claude', 'test', { subprocess, workspace: `${workspace}/file.txt` }), /must be a directory/);
    await assert.rejects(runCli('claude', 'test', { subprocess, workspace: `${workspace}/missing` }), /ENOENT/);
  });
  assert.equal(subprocess.calls.length, 0);
});

test('workspace permission flags must be supported before model invocation', async () => {
  await isolated(async workspace => {
    const subprocess = mock({ helpText: help.replace('--allowedTools', '') });
    await assert.rejects(runCli('claude', 'test', { subprocess, workspace }), /Unverified/);
    assert(subprocess.calls.every(call => call.argv.includes('--help') || call.argv.includes('--version')));
  });
});

for (const [name, output] of [
  ['remote tool inventory', workspaceOutput([...nativeTools, 'WebFetch'], [])],
  ['remote tool call', workspaceOutput(nativeTools, [{ type: 'tool_use', name: 'WebSearch' }])],
  ['unadvertised native tool call', workspaceOutput(['Read'], [{ type: 'tool_use', name: 'Write' }])],
  ['missing tool name', workspaceOutput(nativeTools, [{ type: 'tool_use' }])],
  ['missing init', '{"type":"result","subtype":"success","result":"done"}'],
  ['missing tool inventory', workspaceOutput(null, [])],
]) test(`workspace rejects ${name} and preserves cwd`, async () => {
  await isolated(async workspace => {
    await assert.rejects(runCli('claude', 'test', { subprocess: mock({ output }), workspace }));
    await access(workspace);
  });
});

test('permission denials are reported without failing the turn or leaking tool input', async () => {
  const output = workspaceOutput(nativeTools, [], { permission_denials: [{ tool_name: 'Bash', tool_input: { command: 'private-command SECRET' } }] });
  await isolated(async workspace => {
    const result = await runCli('claude', 'test', { subprocess: mock({ output }), workspace });
    assert.equal(result.text, 'files updated');
    assert.deepEqual(result.denied, ['Bash']);
    assert(!JSON.stringify(result).includes('SECRET'));
    await access(workspace);
  });
  const unknown = await runCli('claude', 'test', { subprocess: mock({ output: workspaceOutput(nativeTools, [], { permission_denials: [{ tool_name: 'NotATool' }] }) }), workspace: '/tmp' });
  assert.deepEqual(unknown.denied, ['unknown tool']);
});

test('preaborted signal never starts a process', async () => {
  const subprocess = mock();
  await assert.rejects(runCli('claude', 'test', { subprocess, signal: AbortSignal.abort() }));
  assert.equal(subprocess.calls.length, 0);
});

function liveMock() {
  const subprocess = mock();
  const spawn = subprocess.spawn;
  let ready;
  subprocess.started = new Promise(resolve => { ready = resolve; });
  subprocess.spawn = spec => {
    if (spec.argv.includes('--version') || spec.argv.includes('--help')) return spawn(spec);
    subprocess.calls.push(spec);
    const stdout = new PassThrough();
    let finish, fail;
    const handle = {
      stdout, collected: { stderr: { readFrom: () => ({ text: '', lossy: false }) } },
      done: new Promise((resolve, reject) => { finish = resolve; fail = reject; }),
      terminate() { handle.terminated = true; stdout.end(); finish({ exitCode: null, signal: 'SIGTERM' }); },
      async waitForExit() { handle.joined = true; return true; },
    };
    subprocess.handle = handle;
    subprocess.finish = (exitCode = 0) => { stdout.end(); finish({ exitCode, signal: null }); };
    subprocess.fail = fail;
    ready();
    return handle;
  };
  return subprocess;
}
const line = row => JSON.stringify(row) + '\n';
const init = { type: 'system', subtype: 'init', tools: [], model: 'test' };
const event = value => ({ type: 'stream_event', event: value });
const messageStart = event({ type: 'message_start', message: { id: 'm', model: 'test' } });
const textDelta = text => event({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } });
const success = { type: 'result', subtype: 'success', result: '你好', usage: { input_tokens: 10, output_tokens: 2 } };

test('Claude emits real deltas before done, handles split JSON/UTF-8 and never exposes reasoning or tools', async () => {
  const subprocess = liveMock();
  const updates = [];
  const run = runCli('claude', 'test', { subprocess, onProgress: update => updates.push(update) });
  await subprocess.started;
  const spec = subprocess.calls.at(-1);
  assert.equal(spec.stdio.stdout, 'pipe');
  assert(spec.argv.includes('--include-partial-messages'));
  subprocess.handle.stdout.write(line(init) + line(messageStart));
  subprocess.handle.stdout.write(line(event({ type: 'content_block_start', content_block: { type: 'thinking', thinking: 'SECRET' } })));
  subprocess.handle.stdout.write(line(event({ type: 'content_block_delta', delta: { type: 'thinking_delta', thinking: 'SECRET' } })));
  subprocess.handle.stdout.write(line(event({ type: 'content_block_start', content_block: { type: 'tool_use', input: 'SECRET' } })));
  const bytes = Buffer.from(line(textDelta('你')));
  const split = bytes.indexOf(Buffer.from('你')) + 1;
  subprocess.handle.stdout.write(bytes.subarray(0, split));
  await immediate();
  assert(!updates.some(update => update.text));
  subprocess.handle.stdout.write(bytes.subarray(split));
  await immediate();
  assert.equal(updates.at(-1).text, '你');
  subprocess.handle.stdout.write(line(textDelta('好')));
  // Completed assistant snapshots must not duplicate already streamed deltas.
  subprocess.handle.stdout.write(line({ type: 'assistant', message: { id: 'm', content: [{ type: 'text', text: '你好' }] } }));
  subprocess.handle.stdout.write(JSON.stringify(success)); // final row has no newline
  subprocess.finish();
  const result = await run;
  assert.equal(result.text, '你好');
  assert.deepEqual(result.usage, success.usage);
  assert.deepEqual(updates.at(-1), { text: '你好', model: 'test', state: 'responding', usage: success.usage });
  assert(!JSON.stringify(updates).includes('SECRET'));
  assert(!updates.some(update => update.text === '你好\n你好'));
  assert(subprocess.handle.stdout.destroyed);
  await assert.rejects(access(spec.cwd));
});

for (const mode of ['abort', 'malformed', 'callback', 'spawn', 'stream', 'overflow', 'exit']) test(`live ${mode} failure terminates and cleans owned cwd`, async () => {
  const subprocess = liveMock();
  const controller = new AbortController();
  const run = runCli('claude', 'test', { subprocess, signal: controller.signal, onProgress() { if (mode === 'callback') throw Error('callback failed'); } });
  const rejected = assert.rejects(run, mode === 'abort' ? /cancelled/ : mode === 'malformed' ? /malformed JSON/ : mode === 'overflow' ? /truncated/ : mode === 'exit' ? /exited unsuccessfully/ : /failed/);
  await subprocess.started;
  if (mode === 'abort') controller.abort(Error('cancelled'));
  if (mode === 'malformed') subprocess.handle.stdout.write('SECRET malformed\n');
  if (mode === 'callback') subprocess.handle.stdout.write(line(init));
  if (mode === 'spawn') subprocess.fail(Error('spawn failed'));
  if (mode === 'stream') subprocess.handle.stdout.destroy(Error('stream failed'));
  if (mode === 'overflow') subprocess.handle.stdout.write('x'.repeat(1048577));
  if (mode === 'exit') subprocess.finish(1);
  await rejected;
  assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
  assert(subprocess.handle.terminated);
  assert(subprocess.handle.joined);
  assert(subprocess.handle.stdout.destroyed);
  await assert.rejects(access(subprocess.calls.at(-1).cwd));
});

test('live process failure keeps diagnostics sanitized and rejects lossy stderr', async () => {
  for (const lossy of [false, true]) {
    const subprocess = liveMock();
    const run = runCli('claude', 'private-prompt', { subprocess, onProgress() {} });
    const rejected = assert.rejects(run, error => {
      assert.match(error.message, lossy ? /truncated/ : /invalid CLI option --bad-flag/);
      assert(!/SECRET|private-prompt/.test(error.message));
      return true;
    });
    await subprocess.started;
    subprocess.handle.collected.stderr.readFrom = () => ({ text: 'unknown option --bad-flag SECRET private-prompt', lossy });
    subprocess.handle.stdout.write(line(init) + line(success));
    subprocess.finish(lossy ? 0 : 1);
    await rejected;
    await assert.rejects(access(subprocess.calls.at(-1).cwd));
  }
});

test('workspace tool logs above 1 MiB retain bounded answers, validate envelopes and reject oversized streams', async () => {
 for(const kind of ['codex','claude'])for(const withProgress of [false,true]){
  const secret='PRIVATE_TOOL_OUTPUT'.repeat(90000);
  const rows=kind==='codex'?[
   {type:'item.completed',item:{type:'command_execution',aggregated_output:secret}},
   {type:'item.completed',item:{type:'agent_message',text:'verified'}},
   {type:'turn.completed',usage:{input_tokens:7,output_tokens:2}},
  ]:[
   {type:'system',subtype:'init',tools:['Read'],model:'test'},
   {type:'assistant',message:{content:[{type:'tool_use',name:'Read',input:{path:'private'}}]}},
   {type:'user',message:{content:[{type:'tool_result',content:secret}]}},
   {type:'result',subtype:'success',result:'verified',usage:{input_tokens:7,output_tokens:2}},
  ];
  const output=rows.map(row=>JSON.stringify(row)).join('\n');assert(Buffer.byteLength(output)>1048576);
  const subprocess=mock({version:kind==='codex'?'codex-cli 0.153.4':undefined,output});const updates=[];
  const result=await runCli(kind,'read relevant evidence',{workspace:'/tmp',subprocess,...withProgress?{onProgress:u=>updates.push(u)}:{}});
  assert.equal(result.text,'verified');assert.equal(result.usage.output_tokens,2);assert(!JSON.stringify(updates).includes('PRIVATE_TOOL_OUTPUT'));
 }
 const invalid=mock({version:'codex-cli 0.153.4',output:'{"type":"item.completed","item":{"type":"mcp_tool_call","content":"private"}}\n'});
 await assert.rejects(runCli('codex','x',{workspace:'/tmp',subprocess:invalid}),/Unexpected Codex activity/);
 const denied=mock({output:'{"type":"system","subtype":"init","tools":["Read"]}\n{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Bash","input":"private"}]}}\n{"type":"result","subtype":"success","result":"x"}\n'});
 await assert.rejects(runCli('claude','x',{workspace:'/tmp',subprocess:denied}),/Unexpected tool/);
 const oversize=mock({version:'codex-cli 0.153.4',output:'x'.repeat(32*1048576+1)});
 await assert.rejects(runCli('codex','x',{workspace:'/tmp',subprocess:oversize}),/tool\/event stream exceeds 32 MiB/);
 const hugeAnswer=mock({version:'codex-cli 0.153.4',output:JSON.stringify({type:'item.completed',item:{type:'agent_message',text:'x'.repeat(1048576)}})+'\n'});
 await assert.rejects(runCli('codex','x',{workspace:'/tmp',subprocess:hugeAnswer}),/answer records exceed 1 MiB/);
});

test('invoke reports missing live stream and rejects invalid callbacks before spawn', async () => {
  const subprocess = mock();
  // Real handles always have terminate; this fixture verifies unsupported runtimes fail clearly.
  const spawn = subprocess.spawn;
  subprocess.spawn = spec => ({ ...spawn(spec), stdout: undefined, terminate() {} });
  await assert.rejects(invoke(subprocess, '/unused', [], '/tmp', undefined, '', () => {}), /live stdout unavailable/);
  await assert.rejects(runCli('claude', 'x', { subprocess, onProgress: true }), /onProgress/);
});
