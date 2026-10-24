import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDecision, summaryInstruction, templates } from './decision.js';

test('decision templates and summary schema are complete', () => {
  assert.deepEqual(templates.map(item => item.id), ['review', 'architecture', 'risk', 'code', 'requirements']);
  assert.ok(templates.every(item => item.label.zh && item.label.en && item.prompt && item.roundOne && item.roundTwo));
  for (const key of ['consensus', 'disagreements', 'unknowns', 'actions', 'followups', 'discussion-ledger']) assert.ok(summaryInstruction.includes(key));
});

test('ledger preserves only successful evidence and flags unsupported certainty heuristically', () => {
  const messages = [{ id: 'ok-1', speaker: 'claude', text: '[id=ok-1] Supported observation' }, { id: 'strong-1', speaker: 'codex', text: 'This definitely is correct.' }, { id: 'bad-1', speaker: 'codex', status: 'error', text: '[id=bad-1] failed' }];
  const response = `Result is provisional.\n\n\`\`\`discussion-ledger\n${JSON.stringify({ consensus: [{ text: 'This definitely works', evidence: ['ok-1', 'bad-1', 'made-up'] }], disagreements: [], unknowns: [{ text: 'Nothing is impossible', evidence: [] }], actions: [{ task: 'test', owner: 'team', priority: 'high', acceptance: 'test passes', evidence: ['made-up'] }], followups: ['Confirm'] })}\n\`\`\``;
  const result = parseDecision(response, messages);
  assert.equal(result.text, 'Result is provisional.');
  assert.deepEqual(result.decision.consensus[0].evidence, ['ok-1']);
  assert.deepEqual(result.decision.actions[0].evidence, []);
  assert.equal(result.decision.warnings.length, 2);
  assert.ok(result.decision.warnings.every(warning => warning.heuristic === true));
  assert.equal(result.decision.warnings[1].messageId, 'strong-1');
});

test('malformed or oversized ledgers fail closed with bounded display text', () => {
  const malformed = parseDecision('Main answer\n```discussion-ledger\n{broken}\n```', []);
  assert.equal(malformed.text, 'Main answer\n```discussion-ledger\n{broken}\n```');
  assert.deepEqual(malformed.decision.consensus, []);
  const oversized = parseDecision('x'.repeat(210000));
  assert.equal(oversized.text.length, 200000);
});
