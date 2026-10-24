import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docxBytes, printHtml } from './document-export.js';

const decode = bytes => new TextDecoder().decode(bytes);

test('DOCX is a valid store-only ZIP with escaped OOXML content', () => {
  const bytes = docxBytes('A & <title>', ['<script>alert("x")</script>', 'A\nB']);
  assert.ok(bytes instanceof Uint8Array);
  const archive = decode(bytes);
  assert.match(archive, /PK\u0003\u0004/);
  assert.match(archive, /PK\u0001\u0002/);
  assert.match(archive, /PK\u0005\u0006/);
  assert.match(archive, /A &amp; &lt;title&gt;/);
  assert.match(archive, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
});

test('print HTML escapes title and paragraph content', () => {
  const html = printHtml('<img src=x onerror=alert(1)>', ['<svg onload=alert(1)>', '& hello']);
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<svg'));
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&amp; hello/);
  assert.match(html, /@media print/);
});
