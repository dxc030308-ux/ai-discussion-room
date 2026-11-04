import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Pinned from a measurement on the real host, not from a fixture: desktop 1.0.92, host 0.2.2-alpha.2,
// window 1373 px tall. The page's parent is a ZERO-HEIGHT wrapper, so `height:100%` resolves to auto
// and only `max-height:100dvh` bounds the page. That cap made the document exactly 1373 px, and the
// last defect was 56 px of content overflow inside the page, which hid the 停止/总结/清空 row behind an
// invisible overlay scrollbar. The chrome below was trimmed to cover it with a ~12 px margin.
// Change one of these numbers and this test fails on purpose: re-measure first, then update both.
// Re-measure in DevTools:
//   (()=>{const p=document.querySelector('.ad-page'),o=[];for(let n=p;n&&n!==document.documentElement;n=n.parentElement){const s=getComputedStyle(n);o.push(`${n.tagName}.${(n.className||'').toString().split(' ')[0]||''} ${n.clientHeight}/${n.scrollHeight} ${s.overflowY} ${s.height}`);}return `vh ${innerHeight} html ${document.documentElement.scrollHeight} body ${document.body.scrollHeight} || ${o.join(' > ')}`;})()
const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8');
const css = source.slice(source.indexOf('const css = `'), source.indexOf('`;', source.indexOf('const css = `')));
const rule = selector => {
  const found = [...css.matchAll(new RegExp(`(?:^|\\n)\\s*([^{}\\n]*${selector}[^{}]*)\\{([^}]*)\\}`, 'g'))];
  assert.ok(found.length, `no rule for ${selector}`);
  return found.map(match => match[2]).join(';');
};

test('page is bounded by the viewport, not by an ancestor height', () => {
  const page = rule('\\.ad-page');
  assert.ok(page.includes('height:100%'), 'keep percent height for hosts that do offer a definite height');
  assert.ok(page.includes('min-height:0'), 'a flex item must be allowed to shrink');
  assert.ok(page.includes('max-height:100dvh'), 'the viewport cap is the only bound that survives a zero-height parent');
  assert.ok(page.includes('overflow:auto'), 'overflow must stay scrollable so nothing is clipped unreachable');
});

test('vertical chrome stays inside the measured budget', () => {
  // 1373 px window, 1429 px of page content before the trim: these four values removed the 56 px gap.
  assert.ok(rule('\\.ad-page').includes('padding-top:22px'));
  assert.ok(css.includes('.ad-hero{margin-bottom:18px}'));
  assert.ok(css.includes('.ad-stages{display:flex;list-style:none;margin:0 0 16px;padding:10px 18px'));
});

test('workspace hint stays one short line so it cannot re-inflate the panel', () => {
  const zh = source.match(/workspaceHint: '([^']*)'/g) || [];
  assert.equal(zh.length, 2, 'both locales define workspaceHint');
  for (const entry of zh) {
    const text = entry.slice('workspaceHint: '.length, -1);
    assert.ok([...text].length <= 72, `workspaceHint grew back to ${[...text].length} characters: ${text}`);
  }
});

test('no diagnostic overlay is left in the shipped client', () => {
  assert.ok(!source.includes('ad-diag'), 'the temporary layout probe must not ship');
  assert.ok(!source.includes('requestAnimationFrame(() => setDiag'), 'the probe sampler must not ship');
});
