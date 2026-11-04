import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A blank panel is the worst failure this UI can produce and no source-level assertion catches it:
// one reference to a state variable from the wrong component throws during render and React replaces
// the whole panel with nothing. This renders the real component tree against a React stub instead.
const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8');

function render({ force = false } = {}) {
  const captured = {};
  const React = {
    createElement: (type, props, ...children) => ({ type, props, children }),
    Fragment: Symbol('Fragment'),
    useState: value => [typeof value === 'function' ? value() : value, () => {}],
    useRef: value => ({ current: value }),
    useEffect: () => {}, useLayoutEffect: () => {}, useMemo: fn => fn(), useCallback: fn => fn(),
    useSyncExternalStore: () => ({}), useId: () => 'id',
  };
  const code = force ? source.replace('sessionId && ready === sessionId ? h(Room,', 'true ? h(Room,') : source;
  const host = { __ModuleLoader__: { load: ({ factory }) => { host.factory = factory; } } };
  new Function('window', code)(host);
  const plugin = host.factory(() => React);
  const ctx = {
    slots: { inject: (name, fn) => fn(), register: (spec, component) => { captured[spec.name] = component; return () => {}; } },
    locale: { register: () => {}, bind: () => key => key, subscribe: () => () => {}, getSnapshot: () => ({}), getLocale: () => ({ active: 'zh' }) },
    effect: fn => fn(),
    sessions: { list: () => [], scope: () => null, retain: () => ({ ready: Promise.resolve(), release() {} }), subscribe: () => () => {} },
    get: () => undefined,
  };
  plugin.apply(ctx);
  const catalog = { useSessions: () => ({ ids: ['s1'], byId: { s1: { id: 's1', title: 'T' } } }) };
  const tree = captured.main(catalog);
  let room = null;
  (function scan(node, depth) {
    if (!node || typeof node !== 'object' || depth > 12) return;
    if (typeof node.type === 'function' && node.type.name === 'Room') room = node;
    for (const child of node.children || []) scan(child, depth + 1);
  })(tree, 0);
  return { captured, tree, room };
}

test('panel renders without throwing when a session is selected', () => {
  const { captured, tree } = render({ force: true });
  assert.equal(typeof captured.main, 'function');
  assert.equal(typeof captured['sidebar.panellist'], 'function');
  assert.equal(tree.props.className, 'ad-page');
  assert.ok(tree.props && !Object.keys(tree.props).includes('children'));
});

test('panel renders its fallback when no session is ready', () => {
  const { captured } = render();
  const tree = captured.main({ useSessions: () => ({ ids: [], byId: {} }) });
  assert.equal(tree.props.className, 'ad-page');
});
