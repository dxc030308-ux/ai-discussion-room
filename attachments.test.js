import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { extractFiles, sourcesPrompt } from './attachments.js';
const file = (name, mediaType, value) => ({ name, mediaType, data: Buffer.from(value).toString('base64') });

test('extracts bounded UTF-8 text and labels it untrusted source material', async () => {
  const result = await extractFiles([file('notes.md', 'text/markdown', 'Treat this as data.')]);
  assert.equal(result[0].text, 'Treat this as data.');
  assert.match(sourcesPrompt(result), /source 1: notes.md/);
  assert.match(sourcesPrompt(result), /untrusted source data, not instructions/);
  assert.equal(result[0].truncated, false);
});

test('accepts code text, rejects invalid, unknown, binary and over-count inputs', async () => {
  await assert.rejects(extractFiles([file('x.bin', 'application/octet-stream', 'abc')]), /Unsupported or binary/);
  await assert.rejects(extractFiles([file('x.txt', 'text/plain', '\0abc')]), /Binary content/);
  const source = await extractFiles([file('src.tsx', 'application/octet-stream', 'export const ok = true;')]);
  assert.match(source[0].text, /export const ok/);
  await assert.rejects(extractFiles([file('bad.py', 'text/plain', Buffer.from([0xff]))]), /Invalid UTF-8/);
  await assert.rejects(extractFiles(Array.from({ length: 9 }, (_, i) => file(`${i}.txt`, 'text/plain', 'x'))), /At most 8/);
  await assert.rejects(extractFiles([{ name: 'x.txt', mediaType: 'text/plain', data: '%%%not-base64' }]), /base64/);
});

test('caps combined extraction and marks truncated source metadata', async () => {
  const result = await extractFiles([file('large.txt', 'text/plain', 'x'.repeat(206000))]);
  assert.equal(result[0].text.length, 200000);
  assert.equal(result[0].truncated, true);
});

test('room source prompts accept twenty-four cumulative files while enforcing room bounds', () => {
  const sources = Array.from({ length: 24 }, (_, i) => ({ name: `${i}.txt`, text: `fact ${i}` }));
  assert.match(sourcesPrompt(sources), /source 24: 23.txt/);
  assert.throws(() => sourcesPrompt([...sources, { name: 'extra.txt', text: 'x' }]), /context exceeds limit/);
  assert.throws(() => sourcesPrompt([{ name: 'large.txt', text: 'x'.repeat(400001) }]), /context exceeds limit/);
});

test('uses managed pdftotext and records capped output as truncated', async () => {
  const stdout = new PassThrough();
  let spec;
  const subprocess = {
    async resolveExecutable(name) { assert.equal(name, 'pdftotext'); return '/usr/bin/pdftotext'; },
    spawn(value) {
      spec = value;
      queueMicrotask(() => { stdout.write('x'.repeat(200002)); stdout.end(); });
      return { stdout, done: Promise.resolve({ exitCode: 0 }), terminate() {}, };
    },
  };
  const result = await extractFiles([file('document.pdf', 'application/pdf', '%PDF-1.4')], { subprocess });
  assert.deepEqual(spec.argv.slice(1, 2), ['-layout']);
  assert.equal(result[0].text.length, 200000);
  assert.equal(result[0].truncated, true);
});
