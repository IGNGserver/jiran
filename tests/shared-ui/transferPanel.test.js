'use strict';

// The Hub-web device transfer panel.
//
// The transfer POST is the one authenticated request a view module issues
// through the transport directly — every other /api call goes through app.js,
// which injects the session secret. A view that forgets the secret sends an
// anonymous request that the single-owner Hub rejects with 401, and the panel
// then reads the owner's own key back as "needs an admin credential". These
// tests pin that the transfer request carries the live secret, and that a
// stats re-render keeps the user's source/target pickers where they left them.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { installDom } = require('../helpers/domShim');

const viewPath = path.join(__dirname, '..', '..', 'src', 'shared-ui', 'views', 'transfer.js');

const ROWS = [
  { key: 'dev-a', name: 'A' },
  { key: 'dev-b', name: 'B' },
  { key: 'dev-c', name: 'C' }
];

function loadView({
  state = {},
  requests = []
} = {}) {
  installDom(globalThis);
  const appStateJson = JSON.stringify({
    secret: 'owner-secret',
    authorization: { authenticated: true },
    prefs: {},
    transferSelection: null,
    ...state
  });
  const source = fs.readFileSync(viewPath, 'utf8')
    .replace(/^import \{ request, confirmAction \} from '\.\.\/transport\/index\.js';/m,
      `const request = (requestPath, options) => { requests.push({ requestPath, options }); return Promise.resolve(null); };\n`
      + `const confirmAction = () => Promise.resolve(true);`)
    .replace(/^import \{ tr, escapeHtml, appState, viewHelper, showToast, rerender \} from '\.\.\/core\/viewContext\.js';/m, `
      const tr = (key) => key;
      const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
      const appState = () => (${appStateJson});
      const viewHelper = () => () => ({});
      const showToast = () => {};
      const rerender = () => {};
    `)
    .replace(/^import \{ deviceRows \} from '\.\.\/core\/data\.js';/m,
      `const deviceRows = () => (${JSON.stringify(ROWS)});`);
  const factory = new Function('requests', `${source.replace(/^export /gm, '')}
    return { renderTransferPanel, submitTransfer };`);
  return factory(requests);
}

function fakeForm(source, target) {
  const fields = { '[name="sourceDevice"]': { value: source }, '[name="targetDevice"]': { value: target } };
  return { querySelector: (selector) => fields[selector] || null };
}

test('submitTransfer authenticates with the live session secret', async () => {
  const requests = [];
  const { submitTransfer } = loadView({ requests });
  const error = await submitTransfer(fakeForm('dev-a', 'dev-b'));
  assert.equal(error, '', 'a successful transfer reports no error');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].requestPath, '/api/devices/dev-a/transfer');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].options.body.targetDeviceId, 'dev-b');
  assert.equal(requests[0].options.secret, 'owner-secret',
    'the request must carry the secret; an anonymous transfer POST reads back as needsAdmin');
});

test('the selected pair survives a stats re-render', () => {
  const { renderTransferPanel } = loadView({
    state: { transferSelection: { source: 'dev-c', target: 'dev-b' } }
  });
  const html = renderTransferPanel();
  assert.match(html, /<fluent-option value="dev-c" selected>/, 'source keeps the chosen device');
  assert.match(html, /<fluent-option value="dev-b" selected>/, 'target keeps the chosen device');
  assert.doesNotMatch(html, /<fluent-option value="dev-a" selected>/, 'the default is no longer selected');
});

test('selections for vanished devices fall back to the defaults', () => {
  const { renderTransferPanel } = loadView({
    state: {
      prefs: { selectedDeviceId: 'dev-b' },
      transferSelection: { source: 'removed-device', target: 'also-gone' }
    }
  });
  const html = renderTransferPanel();
  assert.match(html, /<fluent-option value="dev-b" selected>/, 'source falls back to the dashboard filter');
  assert.match(html, /<fluent-option value="dev-a" selected>/, 'target falls back to another live device');
});

test('a saved target equal to the saved source still yields a distinct pair', () => {
  const { renderTransferPanel } = loadView({
    state: { transferSelection: { source: 'dev-a', target: 'dev-a' } }
  });
  const html = renderTransferPanel();
  assert.match(html, /<fluent-option value="dev-a" selected>/);
  assert.match(html, /<fluent-option value="dev-b" selected>/, 'the second picker skips the collision');
});

test('an unauthenticated reader sees the disabled form, an owner does not', () => {
  const guest = loadView({ state: { authorization: { authenticated: false } } });
  const guestHtml = guest.renderTransferPanel();
  assert.match(guestHtml, /transfer\.needsAdmin/);
  assert.match(guestHtml, /<fluent-button appearance="primary" type="submit" class="primary-btn" disabled>/);
  const owner = loadView();
  const ownerHtml = owner.renderTransferPanel();
  assert.doesNotMatch(ownerHtml, /transfer\.needsAdmin/);
  assert.match(ownerHtml, /<fluent-button appearance="primary" type="submit" class="primary-btn">/);
});
