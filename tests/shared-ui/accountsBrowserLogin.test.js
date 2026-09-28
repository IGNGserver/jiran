'use strict';

// Render-level tests for the accounts form.
//
// The regex guards in webDataHelpers.test.js prove the markup recipe exists; these
// actually *render* the view with a stubbed context, which is what catches the
// behaviour that regressed before: editing a Codex/Antigravity account fell back
// to the manual token form, and re-authorizing had no account to target.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const viewPath = path.join(__dirname, '..', '..', 'src', 'shared-ui', 'views', 'accounts.js');

function loadAccounts() {
  const source = fs.readFileSync(viewPath, 'utf8')
    .replace(/^import \{ formatRelative \}.*$/m, 'const formatRelative = () => "now";')
    .replace(/^import \{ clientLabel, HUB_ACCOUNT_PROVIDERS, isBrowserLoginProvider \}.*$/m, `
      const HUB_ACCOUNT_PROVIDERS = [
        { id: 'deepseek', label: 'DeepSeek' },
        { id: 'codex', label: 'Codex' },
        { id: 'antigravity', label: 'Antigravity (AGY)' }
      ];
      const BROWSER_LOGIN = ['codex', 'antigravity'];
      const clientLabel = (id) => id;
      const isBrowserLoginProvider = (p) => BROWSER_LOGIN.includes(String(p || '').toLowerCase());
    `)
    .replace(/^import \{ tr, escapeHtml, appState, toolIconHtml, viewHelper \}.*$/m, `
      const tr = (key, params) => {
        if (params && params.name) return key + ':' + params.name;
        return key;
      };
      const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
      const appState = () => globalThis.__accountState;
      const toolIconHtml = () => '<icon>';
      const viewHelper = (name) => ({
        emptyHtml: () => '<empty>',
        uiIcon: () => '<svg>',
        loadingHtml: () => '<loading>',
        managementError: () => '<error>'
      })[name] || (() => '');
    `);
  const factory = new Function(`${source.replace(/^export /gm, '')}
    return { renderAccounts };`);
  return factory();
}

function baseState(overrides = {}) {
  return {
    accounts: [],
    accountsLoading: false,
    accountsError: null,
    accountsSaving: false,
    accountFormError: '',
    accountEditId: '',
    accountDrawerOpen: true,
    accountFormMode: 'simple',
    accountSelectedProvider: 'deepseek',
    oauthSession: null,
    oauthLoading: false,
    authorization: { authenticated: true },
    locale: 'en',
    ...overrides
  };
}

// The mode toggle is a ghost button; the form element itself also carries a
// `data-account-mode` attribute (its current effective mode), so match the button.
const toggleButtons = (html) => [...html.matchAll(/ghost-btn[^>]*data-account-mode="([a-z]+)"/g)].map(([, mode]) => mode);
const has = (html, selector) => html.includes(selector);

test('adding codex renders only the browser sign-in wizard', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({ accountSelectedProvider: 'codex' });
  const html = renderAccounts();

  assert.ok(has(html, 'data-account-oauth-start="codex"'), 'the wizard start button should be present');
  assert.deepEqual(toggleButtons(html), [], 'no simple/json toggle for a browser-login provider');
  assert.equal(has(html, 'name="authJson"'), false, 'the manual auth.json field must be gone');
  assert.equal(has(html, 'name="apiKey"'), false, 'no generic api-key field either');
  // The disclaimer acknowledgement is a create-time gate.
  assert.ok(has(html, 'name="disclaimerAgree"'));
});

test('editing codex stays on the wizard and shows credential state plus clear', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({
    accounts: [{
      id: 'acct-1',
      provider: 'codex',
      name: 'codex-work',
      enabled: true,
      status: 'ok',
      credentialConfigured: true,
      accountEmail: 'dev@example.test',
      credentialMetadata: { accountId: 'chatgpt-1' }
    }],
    accountEditId: 'acct-1'
  });
  const html = renderAccounts();

  // The edit surface must not fall back to a manual mode.
  assert.deepEqual(toggleButtons(html), [], 'editing must not offer simple/json');
  assert.equal(has(html, 'name="authJson"'), false);
  assert.ok(has(html, 'data-account-clear-credential="acct-1"'), 'clear-credential action must be offered');
  assert.ok(has(html, 'accounts.credentialPresent'), 'a stored credential is stated');
  assert.ok(has(html, 'dev@example.test'), 'safe identity metadata is shown');
  assert.ok(has(html, 'chatgpt-1'));
  assert.ok(has(html, 'accounts.oauthReauthTitle'), 'edit uses the re-authorize copy');
  assert.ok(has(html, 'accounts.oauthRestart'));
  // The disabled provider dropdown must not pretend the provider is changeable.
  assert.ok(has(html, 'data-account-provider-select disabled'));
});

test('a cleared credential reads as missing', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({
    accounts: [{ id: 'acct-2', provider: 'antigravity', name: 'agy', enabled: true, status: 'notConfigured', credentialConfigured: false }],
    accountEditId: 'acct-2'
  });
  const html = renderAccounts();

  assert.ok(has(html, 'accounts.credentialMissing'));
  assert.equal(has(html, 'accounts.credentialPresent'), false);
  assert.ok(has(html, 'account-credential-status is-empty'));
  assert.ok(has(html, 'data-account-clear-credential="acct-2"'));
});

test('the exchange form carries the edited account id so re-authorization is in place', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({
    accounts: [{ id: 'acct-3', provider: 'codex', name: 'codex', enabled: true, status: 'ok', credentialConfigured: true }],
    accountEditId: 'acct-3',
    // A live session is what renders the paste step plus its hidden account id.
    oauthSession: { provider: 'codex', sessionId: 'sess-1', authUrl: 'https://auth.openai.com/oauth/authorize?x=1' }
  });
  const html = renderAccounts();

  assert.ok(has(html, 'name="oauthSessionId" value="sess-1"'));
  assert.ok(has(html, 'name="oauthAccountId" value="acct-3"'), 're-authorization must target the edited account');
});

test('adding a non-browser-login provider keeps the simple and JSON modes', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({ accountSelectedProvider: 'deepseek' });
  const html = renderAccounts();

  assert.deepEqual(toggleButtons(html).sort(), ['json', 'simple']);
  assert.equal(has(html, 'data-account-oauth-start'), false);
  assert.ok(has(html, 'name="apiKey"'));
});

test('editing a non-browser-login provider keeps the credential-keep hint', () => {
  const { renderAccounts } = loadAccounts();
  globalThis.__accountState = baseState({
    accounts: [{ id: 'acct-4', provider: 'deepseek', name: 'ds', enabled: true, status: 'ok' }],
    accountEditId: 'acct-4'
  });
  const html = renderAccounts();

  assert.ok(has(html, 'accounts.credentialKeepHint'));
  assert.equal(has(html, 'data-account-oauth-start'), false);
});
