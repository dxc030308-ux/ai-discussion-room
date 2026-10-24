export const templates = [
  { id: 'review', label: { zh: '评审', en: 'Review' }, prompt: 'Review the proposal against its goals and constraints. Identify strengths, failure modes, evidence gaps, and the smallest useful validation.', roundOne: 'Independently review the proposal. Separate observed facts from assumptions; cite message IDs when referring to prior discussion.', roundTwo: 'Review other successful analyses. State agreement and disagreement with reasons, cite supporting message IDs, and correct unsupported claims.' },
  { id: 'architecture', label: { zh: '架构', en: 'Architecture' }, prompt: 'Assess the architecture, interfaces, dependencies, scalability, and operational failure modes. Prefer the smallest design that meets stated requirements.', roundOne: 'Independently propose an architecture and identify interfaces, trade-offs, and evidence needed.', roundTwo: 'Challenge the proposed architecture using other successful analyses. Cite message IDs and distinguish facts from assumptions.' },
  { id: 'risk', label: { zh: '风险', en: 'Risk' }, prompt: 'Identify material risks, likelihood and impact where evidence supports them, mitigations, and residual unknowns. Do not invent probabilities.', roundOne: 'Independently identify risks, evidence, mitigations, and unknowns. Do not infer likelihood without evidence.', roundTwo: 'Cross-check risks against successful analyses; explain disagreements and cite message IDs.' },
  { id: 'code', label: { zh: '代码', en: 'Code' }, prompt: 'Review the code or implementation plan for correctness, security, regressions, and missing tests. Ground findings in supplied evidence.', roundOne: 'Independently inspect the supplied code or plan. Report concrete findings and cite evidence message IDs.', roundTwo: 'Re-evaluate findings against other successful reviews. Resolve disagreements with evidence or keep them open.' },
  { id: 'requirements', label: { zh: '需求', en: 'Requirements' }, prompt: 'Clarify user outcomes, constraints, acceptance criteria, dependencies, and unresolved questions without adding unstated requirements.', roundOne: 'Independently extract goals, constraints, acceptance criteria, and unknowns from the supplied discussion.', roundTwo: 'Compare interpretations, cite message IDs, and preserve unresolved ambiguity rather than guessing.' },
];

export const summaryInstruction = `Return a concise human-readable main result first, followed by exactly one fenced JSON block labeled discussion-ledger. The JSON object must have consensus:[{text,evidence:[messageIds]}], disagreements:[{text,reasons:[{speaker,reason}],evidence:[]}], unknowns:[{text,evidence:[]}], actions:[{task,owner,priority,acceptance,evidence:[]}], and followups:[string]. Use only IDs of successful messages as evidence; failed or absent responses are not evidence. Do not fabricate facts, quotations, participants, or consensus. Keep unsupported or unresolved claims in unknowns and leave evidence empty when none exists.`;

export const decisionContract = Object.freeze({
  input: 'parseDecision(text, messages), where messages are room messages with id, speaker, text, and optional status.',
  output: '{ text: cleanText, decision: { consensus, disagreements, unknowns, actions, followups, warnings } }',
  evidence: 'Only IDs belonging to supplied successful messages (status absent or completed) survive validation.',
  bounds: 'Input 200000 characters; ledger 50000 JSON characters; at most 100 entries per list; strings at most 4000 characters.',
  heuristic: 'Warnings are heuristic, not factual judgments; strong certainty wording without valid evidence is flagged.',
});

const LIMIT = 200000;
const MAX_LEDGER = 50000;
const MAX_ITEMS = 100;
const MAX_STRING = 4000;
const emptyLedger = () => ({ consensus: [], disagreements: [], unknowns: [], actions: [], followups: [] });
const textOf = value => typeof value === 'string' ? value.slice(0, MAX_STRING) : '';
const stringList = value => Array.isArray(value) ? value.slice(0, MAX_ITEMS).filter(x => typeof x === 'string').map(textOf) : [];
const evidenceOf = (value, valid) => stringList(value).filter(id => valid.has(id));
const strongAssertion = text => /\b(always|never|proves?|guarantees?|certainly|definitely|undeniably|impossible|everyone agrees|no risk)\b|必然|一定|绝对|证明了|毫无疑问|所有人都同意|没有风险/i.test(text);

export function parseDecision(text, messages = []) {
  if (typeof text !== 'string') throw new TypeError('Decision text must be a string');
  const source = text.slice(0, LIMIT);
  const match = source.match(/```discussion-ledger\s*\n([\s\S]*?)\n```/i);
  const valid = new Set();
  const successfulMessages = Array.isArray(messages) ? messages.filter(message => message && typeof message.id === 'string' && typeof message.text === 'string' && (!message.status || message.status === 'completed')) : [];
  for (const message of successfulMessages) valid.add(message.id);
  let raw;
  if (match && match[1].length <= MAX_LEDGER) {
    try { raw = JSON.parse(match[1]); } catch { /* Preserve the original text when the ledger is malformed. */ }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { text: source.trim(), decision: { ...emptyLedger(), warnings: [] } };
  const cleanText = source.replace(match[0], '').trim();
  const ledger = emptyLedger();
  for (const item of Array.isArray(raw.consensus) ? raw.consensus.slice(0, MAX_ITEMS) : []) {
    if (!item || typeof item !== 'object') continue;
    ledger.consensus.push({ text: textOf(item.text), evidence: evidenceOf(item.evidence, valid) });
  }
  for (const item of Array.isArray(raw.disagreements) ? raw.disagreements.slice(0, MAX_ITEMS) : []) {
    if (!item || typeof item !== 'object') continue;
    const reasons = Array.isArray(item.reasons) ? item.reasons.slice(0, MAX_ITEMS).filter(r => r && typeof r === 'object').map(r => ({ speaker: textOf(r.speaker), reason: textOf(r.reason) })) : [];
    ledger.disagreements.push({ text: textOf(item.text), reasons, evidence: evidenceOf(item.evidence, valid) });
  }
  for (const item of Array.isArray(raw.unknowns) ? raw.unknowns.slice(0, MAX_ITEMS) : []) {
    if (!item || typeof item !== 'object') continue;
    ledger.unknowns.push({ text: textOf(item.text), evidence: evidenceOf(item.evidence, valid) });
  }
  for (const item of Array.isArray(raw.actions) ? raw.actions.slice(0, MAX_ITEMS) : []) {
    if (!item || typeof item !== 'object') continue;
    ledger.actions.push({ task: textOf(item.task), owner: textOf(item.owner), priority: textOf(item.priority), acceptance: textOf(item.acceptance), evidence: evidenceOf(item.evidence, valid) });
  }
  ledger.followups = stringList(raw.followups).slice(0, 3);
  const warnings = [];
  for (const item of ledger.consensus) if (!item.evidence.length) warnings.push({ text: item.text, heuristic: true, reason: 'Consensus has no validated successful-message evidence.' });
  for (const item of [...ledger.consensus, ...ledger.disagreements, ...ledger.unknowns]) {
    if (strongAssertion(item.text) && !item.evidence.length && !warnings.some(warning => warning.text === item.text)) warnings.push({ text: item.text, heuristic: true, reason: 'Strong certainty wording has no validated successful-message evidence.' });
  }
  for (const message of successfulMessages) {
    const citedIds = [...message.text.matchAll(/\[id=([A-Za-z0-9-]{1,100})\]/g)].map(match => match[1]);
    if (strongAssertion(message.text) && !citedIds.some(id => valid.has(id))) warnings.push({ messageId: message.id, text: textOf(message.text), heuristic: true, reason: 'Strong certainty wording has no citation to a validated successful message.' });
  }
  return { text: cleanText, decision: { ...ledger, warnings: warnings.slice(0, MAX_ITEMS) } };
}
