// Resolves the host packages this plugin shares with its DSH runtime.
// The desktop host exports DSH_RUNTIME_DIR, so nothing here is machine-specific.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

// DSH Desktop exports DSH_RUNTIME_DIR; the other entries only help local development.
const candidates = [
  process.env.DSH_RUNTIME_DIR,
  path.join(homedir(), '.config', 'DSH Codex Desktop', 'dsh-runtime'),
  path.join(homedir(), 'Library', 'Application Support', 'DSH Codex Desktop', 'dsh-runtime'),
  path.join(homedir(), 'AppData', 'Roaming', 'DSH Codex Desktop', 'dsh-runtime'),
  '/opt/DSH Codex Desktop/dsh-runtime',
].filter(Boolean);
const runtimeDir = candidates.find(dir => existsSync(path.join(dir, 'node_modules/@deepseek-ai/dsh'))) ?? candidates[0];

function runtimeFile(relative) {
  if (!runtimeDir) throw new Error('DSH runtime not found; this plugin must run inside DSH Desktop');
  const file = path.join(runtimeDir, relative);
  if (!existsSync(file)) throw new Error(`Missing DSH runtime module: ${relative}`);
  return file;
}

const load = relative => import(pathToFileURL(runtimeFile(relative)).href);

const nested = name => `node_modules/@deepseek-ai/dsh/node_modules/${name}`;

export const zod = (await load(nested('zod/index.js'))).default;
export const { installModelSelection } = await load(nested('@deepseek-ai/dsh-agent/lib/index.js'));
export const { BlockAssembler, lastAssistantStreamChunk } = await load(nested('@deepseek-ai/dsh-llm/lib/index.js'));
