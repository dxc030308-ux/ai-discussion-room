import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, realpath, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { homedir } from 'node:os';

const execFileAsync = promisify(execFile);
const LIMIT = 1048576;
// Bare names resolve through PATH on every OS; the extra entries cover the
// installers used on Linux desktops so a PATH-less launch still works.
const candidates = {
  claude: ['claude', join(homedir(), '.local', 'bin', 'claude')],
  codex: ['codex', '/usr/lib/chatgpt/resources/codex'],
};
// 2.1.300 --restricted and empty setting sources hide existing OAuth auth.
// Safe mode disables customizations; user-only settings retain auth without project/local settings.
// Strict empty MCP applies in both modes; native tools are opt-in for a workspace.
const commonFlags = ['--safe-mode', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--setting-sources', 'user', '--disable-slash-commands', '--no-chrome', '--permission-mode', 'dontAsk', '--permission-prompts', 'none', '--no-session-persistence', '--print'];
const workspaceTools = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash'];
// Command rules are permissions, not an OS sandbox. Unlisted commands are denied by dontAsk.
// Read-only inspection plus project checks; these run in the consent-gated workspace only.
const inspectCommands = ['ls', 'cat', 'head', 'tail', 'wc', 'sort', 'uniq', 'diff', 'rg', 'grep', 'sed', 'awk', 'cut', 'tr', 'find', 'du', 'stat', 'file', 'jq', 'python3', 'git status', 'git diff', 'git log', 'git show', 'node --test', 'node --check', 'npm test', 'pnpm test'];
const allowedTools = [...workspaceTools.filter(tool => tool !== 'Bash'), 'Bash(pwd)', ...inspectCommands.map(command => `Bash(${command} *)`)];
const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

function claudeInput(prompt, images) {
  if (!images?.length) return prompt;
  const content = [{ type: 'text', text: prompt }];
  for (const image of images) {
    if (!imageTypes.has(image.mediaType) || typeof image.data !== 'string' || image.data.length > 8 * 1024 * 1024 * 4 / 3) throw new Error('Invalid shared image');
    content.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } });
  }
  return JSON.stringify({ type: 'user', message: { role: 'user', content }, parent_tool_use_id: null, session_id: '' }) + '\n';
}

// Explicit environment: do not inherit NODE_OPTIONS, injected plugins or startup hooks.
const ENV_KEYS = [
  // Portable basics plus the per-platform entries a CLI needs to start.
  'HOME', 'PATH', 'LANG', 'LC_ALL', 'TERM', 'TMPDIR',
  'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'SystemRoot', 'SystemDrive', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP',
  'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL',
  'HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY', 'SSL_CERT_FILE', 'SSL_CERT_DIR',
];
export function environment() {
  return Object.fromEntries(ENV_KEYS.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]));
}

// Never propagate raw CLI logs: they may echo prompts, credentials, URLs or settings.
function diagnostic(stdout = '', stderr = '') {
  const text = `${stderr.slice(0, 8192)}\n${stdout.slice(-8192)}`;
  if (/Not logged in|Please run \/login/i.test(text)) return 'authentication unavailable; check Claude login and settings-source isolation';
  const option = text.match(/(?:unknown|unrecognized|invalid) (?:option|argument)\s+['"]?(--[a-z][a-z0-9-]{0,60})/i);
  if (option) return `invalid CLI option ${option[1]}`;
  if (/invalid api key|authentication_error|unauthorized|\b401\b/i.test(text)) return 'model service authentication rejected';
  if (/rate.?limit|\b429\b/i.test(text)) return 'model service rate limit';
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|connection error/i.test(text)) return 'model service connection failed';
  return stderr ? 'stderr present (content withheld)' : stdout ? 'structured output present (content withheld)' : 'no diagnostic output';
}

// Decode complete JSONL rows only; chunks may split a line or contain several lines.
export function jsonLines(onRow) {
  let pending = '';
  return (chunk, end = false) => {
    pending += chunk;
    const lines = pending.split('\n');
    pending = end ? '' : lines.pop();
    for (const line of lines) if (line.trim()) {
      let row;
      try { row = JSON.parse(line); }
      catch { throw new Error('CLI emitted malformed JSON'); }
      onRow(row);
    }
  };
}

// onProgress({text, model?, usage?, state?}) is synchronous and deduplicated.
// text is cumulative top-level assistant text (messages joined by newline), never reasoning/tools.
// state is thinking|responding|tool, not completion; only the returned promise confirms success.
// After validation, the last snapshot reconciles text to the final parser and adds raw CLI usage.
// Callback throws fail the invocation; absent provider usage is omitted, never estimated.
export function progressCallback(onProgress, initial = {}) {
  if (onProgress !== undefined && typeof onProgress !== 'function') throw new Error('onProgress must be a function');
  let snapshot = { text: '', ...initial };
  let previous;
  return update => {
    snapshot = { ...snapshot, ...update };
    const key = JSON.stringify(snapshot);
    if (onProgress && key !== previous) { previous = key; onProgress({ ...snapshot }); }
  };
}

export async function invoke(subprocess, executable, args, cwd, signal, input = '', onOutput, projectRow, extraEnv) {
  signal?.throwIfAborted();
  // Provider credentials stay in the child environment rather than its visible argv.
  const env = { ...environment(), ...extraEnv };
  if (!subprocess) {
    try {
      const result = await execFileAsync(executable, args, { cwd, env, signal, maxBuffer: LIMIT, timeout: 10000 });
      return result.stdout;
    } catch (error) {
      signal?.throwIfAborted();
      throw new Error(`CLI probe failed (${typeof error.code === 'number' ? error.code : 'spawn/probe error'}): ${diagnostic(error.stdout, error.stderr)}`);
    }
  }
  const handle = subprocess.spawn({ argv: [executable, ...args], cwd, env, stdio: { stdin: { data: input }, stdout: onOutput ? 'pipe' : { maxBytes: projectRow ? 32 * LIMIT : LIMIT }, stderr: { maxBytes: LIMIT } }, graceMs: 1000, signal });
  let streamed = '', retainedBytes = 0;
  // Native tool results may be large; validate their envelopes without retaining tool payloads.
  const collect = projectRow ? jsonLines(row => {
    const text = JSON.stringify(projectRow(row)) + '\n';
    retainedBytes += Buffer.byteLength(text);
    if (retainedBytes > LIMIT) throw new Error('CLI answer records exceed 1 MiB');
    streamed += text;
  }) : undefined;
  const abort = () => handle.stdout?.destroy(signal.reason);
  try {
    signal?.addEventListener('abort', abort, { once: true });
    signal?.throwIfAborted();
    const consume = async () => {
      if (!onOutput) return;
      if (!handle.stdout) throw new Error('CLI live stdout unavailable');
      handle.stdout.setEncoding('utf8');
      let bytes = 0;
      for await (const chunk of handle.stdout) {
        signal?.throwIfAborted();
        bytes += Buffer.byteLength(chunk);
        if (bytes > (projectRow ? 32 * LIMIT : LIMIT)) throw new Error(projectRow ? 'CLI tool/event stream exceeds 32 MiB' : 'CLI output missing or truncated');
        if (collect) collect(chunk); else streamed += chunk;
        onOutput(chunk);
      }
      collect?.('', true);
    };
    const [outcome] = await Promise.all([handle.done, consume()]);
    signal?.throwIfAborted();
    const out = onOutput ? { text: streamed, lossy: false } : handle.collected.stdout?.readFrom(0);
    const err = handle.collected.stderr?.readFrom(0);
    if (outcome.exitCode !== 0 || outcome.signal) throw new Error(`CLI exited unsuccessfully (${outcome.exitCode ?? outcome.signal}): ${diagnostic(out?.text, err?.text)}`);
    if (!out || out.lossy || err?.lossy) throw new Error('CLI output missing or truncated');
    return out.text;
  } catch (error) {
    handle.terminate?.();
    handle.stdout?.destroy();
    await handle.done.catch(() => {});
    await handle.waitForExit?.();
    signal?.throwIfAborted();
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
    if (onOutput) handle.stdout?.destroy();
  }
}

export async function isolated(operation) {
  const root = await realpath(tmpdir());
  const cwd = await mkdtemp(path.join(root, 'dsh-discussion-cli-'));
  try { return await operation(cwd); }
  finally {
    const resolved = await realpath(cwd);
    if (resolved !== cwd || path.dirname(resolved) !== root || !path.basename(resolved).startsWith('dsh-discussion-cli-')) throw new Error('Refusing cleanup outside owned temporary directory');
    await rm(resolved, { recursive: true, force: true });
  }
}

async function discover(kind, subprocess, cwd, signal, workspace = false) {
  for (const candidate of candidates[kind]) {
    try {
      const executable = subprocess ? await subprocess.resolveExecutable(candidate, environment(), signal) : candidate;
      const version = (await invoke(subprocess, executable, ['--version'], cwd, signal)).trim();
      const help = await invoke(subprocess, executable, ['--help'], cwd, signal);
      if (kind === 'codex') return { available: false, path: executable, version, reason: 'Codex found, but no verified all-tools-disabled mode; read-only sandbox is not tool denial.' };
      const required = ['--safe-mode', '--tools', '--strict-mcp-config', '--setting-sources', '--disable-slash-commands', '--no-chrome', '--permission-prompts', '--no-session-persistence', '--output-format', '--include-partial-messages', ...(workspace ? ['--allowedTools', '--permission-mode'] : [])];
      if (!/^2\.\d+\.\d+ \(Claude Code\)$/.test(version) || required.some(flag => !help.includes(flag)) || !help.includes('Use "" to disable all') || !help.includes('dontAsk') || !help.includes('stream-json')) {
        return { available: false, path: executable, version, reason: 'Unverified Claude version or missing no-tools/config-isolation flags; refusing execution.' };
      }
      return { available: true, path: executable, version };
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }
  return { available: false, reason: 'Executable unavailable or help/version probe failed.' };
}

export async function inspectCli(subprocess) {
  return isolated(async cwd => {
    const signal = AbortSignal.timeout(10000);
    const { inspectCodex } = await import('./codex.js?member=12');
    const [claude, codex] = await Promise.all([discover('claude', subprocess, cwd, signal), inspectCodex(subprocess)]);
    return { claude, codex };
  });
}

function parseClaude(output, workspace = false) {
  const rows = output.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
  const tools = rows.filter(row => row.type === 'assistant').flatMap(row => row.message?.content?.filter(block => block.type === 'tool_use') ?? []);
  if (tools.length && !workspace) throw new Error('Unexpected tool use in discussion-only mode');
  const init = rows.find(row => row.type === 'system' && row.subtype === 'init');
  if (!init || !Array.isArray(init.tools) || (!workspace && init.tools.length)) throw new Error('CLI did not confirm an empty tool inventory');
  if (workspace && (init.tools.some(tool => !workspaceTools.includes(tool)) || tools.some(tool => !workspaceTools.includes(tool.name) || !init.tools.includes(tool.name)))) throw new Error('Unexpected tool in workspace mode');
  const result = rows.findLast(row => row.type === 'result');
  if (!result || result.is_error || result.subtype !== 'success' || typeof result.result !== 'string') throw new Error(`CLI did not return a successful text result: ${diagnostic(output)}`);
  // A denied tool call is the policy working, not a failed discussion turn.
  const denied = result.permission_denials?.length ? [...new Set(result.permission_denials.map(denial => workspaceTools.includes(denial.tool_name) ? denial.tool_name : 'unknown tool'))] : undefined;
  return { text: result.result, ...(typeof init?.model === 'string' ? { model: init.model } : {}), ...(typeof result.session_id === 'string' ? { sessionId: result.session_id } : {}), ...(result.usage && typeof result.usage === 'object' ? { usage: result.usage } : {}), ...(denied ? { denied } : {}) };
}

function claudeRecord(row) {
  if (row.type === 'system' && row.subtype === 'init') return { type: row.type, subtype: row.subtype, tools: row.tools, model: row.model };
  if (row.type === 'assistant') return { type: row.type, message: { content: row.message?.content?.filter(b => b.type === 'tool_use').map(b => ({ type: b.type, name: b.name })) } };
  if (row.type === 'result') return { type: row.type, subtype: row.subtype, is_error: row.is_error, result: row.result, session_id: row.session_id, usage: row.usage, permission_denials: row.permission_denials?.map(d => ({ tool_name: d.tool_name })) };
  return { type: row.type };
}

function claudeProgress(emit) {
  const messages = new Map();
  let current;
  const publish = state => emit({ text: [...messages.values()].map(message => message.text).filter(Boolean).join('\n'), state });
  return jsonLines(row => {
    if (row.parent_tool_use_id) return;
    if (row.type === 'system' && row.subtype === 'init') emit({ ...(typeof row.model === 'string' ? { model: row.model } : {}), state: 'thinking' });
    if (row.type === 'stream_event') {
      const event = row.event;
      if (event?.type === 'message_start') {
        current = event.message?.id;
        if (current && !messages.has(current)) messages.set(current, { text: '' });
        if (typeof event.message?.model === 'string') emit({ model: event.message.model });
      }
      const message = messages.get(current);
      if (event?.type === 'content_block_start') {
        const block = event.content_block;
        if (block?.type === 'text' && message) { message.text += block.text ?? ''; publish('responding'); }
        if (block?.type === 'thinking') publish('thinking');
        if (block?.type === 'tool_use') publish('tool');
      }
      if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta' && typeof event.delta.text === 'string' && message) {
        message.text += event.delta.text;
        publish('responding');
      }
    }
    if (row.type === 'assistant') {
      const content = row.message?.content;
      if (!Array.isArray(content)) return;
      const text = content.filter(block => block.type === 'text' && typeof block.text === 'string').map(block => block.text).join('');
      if (text) {
        messages.set(row.message.id ?? current ?? messages.size, { text });
        publish('responding');
      }
      if (content.some(block => block.type === 'tool_use')) publish('tool');
    }
  });
}

export async function runCli(kind, prompt, { signal, subprocess, images = [], workspace, onProgress } = {}) {
  if (kind === 'codex') return (await import('./codex.js?member=12')).runCodex(prompt, {signal,subprocess,images,workspace,onProgress});
  const emit = progressCallback(onProgress);
  if (kind !== 'claude') throw new Error('Unknown discussion member');
  if (!subprocess) throw new Error('Managed subprocess service required');
  if (typeof prompt !== 'string' || !prompt.trim() || Buffer.byteLength(prompt) > LIMIT) throw new Error('Prompt must be nonempty text within 1 MiB');
  if (!Array.isArray(images) || images.length > 4) throw new Error('At most 4 images per request');
  signal?.throwIfAborted();
  if (workspace !== undefined && (typeof workspace !== 'string' || !path.isAbsolute(workspace))) throw new Error('Workspace must be an absolute directory path');
  if (workspace !== undefined && !(await stat(workspace)).isDirectory()) throw new Error('Workspace must be a directory');
  const run = async cwd => {
    const probeSignal = AbortSignal.any([AbortSignal.timeout(10000), ...(signal ? [signal] : [])]);
    const cli = await discover(kind, subprocess, cwd, probeSignal, workspace !== undefined);
    if (!cli.available) throw new Error(cli.reason);
    const args = [...commonFlags, '--tools', workspace !== undefined ? workspaceTools.join(',') : '', ...(workspace !== undefined ? ['--allowedTools', allowedTools.join(',')] : []), ...(images.length ? ['--input-format', 'stream-json'] : []), '--output-format', 'stream-json', '--verbose', ...(onProgress ? ['--include-partial-messages'] : [])];
    // No native resume: the caller supplies the exact selected discussion transcript.
    const progress = onProgress ? claudeProgress(emit) : workspace !== undefined ? () => {} : undefined;
    const output = await invoke(subprocess, cli.path, args, cwd, signal, claudeInput(prompt, images), progress, workspace !== undefined ? claudeRecord : undefined);
    progress?.('', true);
    const result = parseClaude(output, workspace !== undefined);
    if (onProgress) emit({ text: result.text, ...(result.model ? { model: result.model } : {}), ...(result.usage ? { usage: result.usage } : {}), state: 'responding' });
    return result;
  };
  return workspace !== undefined ? run(workspace) : isolated(run);
}
