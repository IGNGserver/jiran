'use strict';

// The consolidated Management page: the single Administration destination.
//
// Three destinations that used to be separate views are now sections of one
// page. These tests pin the composition — which sections exist, what gates them,
// and that the view id that carries them is still `settings` (the persisted
// route and native-menu compatibility surface). A section that silently stopped
// rendering would only be visible by opening the page in a browser.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { installDom } = require('../helpers/domShim');

const viewPath = path.join(__dirname, '..', '..', 'src', 'shared-ui', 'views', 'settings.js');

// The module is browser ESM; evaluate it with its import graph stubbed so the
// test stays a pure unit test of the page composition.
function loadView({ desktop = false, authenticated = true, capabilities = { hubAccounts: true, subscriptions: true, pricing: true }, prefs = {} } = {}) {
  installDom(globalThis);
  const state = {
    prefs: { managementSection: 'accounts', managementTab: 'subscriptions', ...prefs },
    secret: '',
    authorization: { authenticated, capabilities },
    desktopSettings: {},
    desktopInfo: {}
  };
  const source = fs.readFileSync(viewPath, 'utf8')
    .replace(/^import \{[\s\S]*?\} from '\.\.\/transport\/index\.js';/m, `const isCapable = () => ${desktop};`)
    .replace(/^import \{[\s\S]*?\} from '\.\.\/core\/viewContext\.js';/m, `
      const tr = (key) => key;
      const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
      const settingsOptionList = () => '<listbox></listbox>';
      const appState = () => (${JSON.stringify(state)});
    `)
    .replace(/^import \{ clampHomeLimitAccountCount \} from '\.\.\/core\/data\.js';/m, 'const clampHomeLimitAccountCount = (v, f) => v || f;')
    .replace(/^import \{ renderDesktopSettings \} from '\.\/settingsDesktop\.js';/m, "const renderDesktopSettings = () => '<desktop-settings></desktop-settings>';")
    .replace(/^import \{ renderTransferPanel \} from '\.\/transfer\.js';/m, "const renderTransferPanel = () => '<transfer-panel></transfer-panel>';")
    .replace(/^import \{ renderAccounts \} from '\.\/accounts\.js';/m, "const renderAccounts = () => '<accounts-body></accounts-body>';");
  const factory = new Function(`${source.replace(/^export /gm, '')}
    return { renderSettingsPage };`);
  return factory();
}

const sectionIds = (html) => [...html.matchAll(/data-settings-section="([a-z]+)"/g)].map(([, id]) => id);

test('the owner sees accounts, consumption, preferences and advanced', () => {
  const { renderSettingsPage } = loadView();
  const html = renderSettingsPage({ consumption: '<consumption-body></consumption-body>' });
  assert.deepEqual(sectionIds(html), ['accounts', 'consumption', 'preferences', 'advanced']);
  assert.match(html, /<accounts-body><\/accounts-body>/);
  assert.match(html, /<consumption-body><\/consumption-body>/);
  assert.match(html, /<transfer-panel><\/transfer-panel>/);
});

test('an unauthenticated reader keeps the same sections but loses advanced', () => {
  // Transfer is a Hub-web owner-only mutation, so the section must not exist for
  // a reader; accounts and preferences are still theirs.
  const { renderSettingsPage } = loadView({ authenticated: false });
  const html = renderSettingsPage({ consumption: '<consumption-body></consumption-body>' });
  assert.deepEqual(sectionIds(html), ['accounts', 'consumption', 'preferences']);
  assert.doesNotMatch(html, /<transfer-panel>/);
});

test('a Hub without accounts hides the accounts section', () => {
  const { renderSettingsPage } = loadView({ capabilities: { hubAccounts: false, subscriptions: true, pricing: true } });
  const html = renderSettingsPage({ consumption: '<consumption-body></consumption-body>' });
  assert.deepEqual(sectionIds(html), ['consumption', 'preferences', 'advanced']);
});

test('a Hub without subscriptions or pricing hides the consumption section', () => {
  const { renderSettingsPage } = loadView({ authenticated: false, capabilities: { hubAccounts: true, subscriptions: false, pricing: false } });
  const html = renderSettingsPage();
  assert.deepEqual(sectionIds(html), ['accounts', 'preferences']);
});

test('the desktop host renders its device groups and no transfer section', () => {
  // Device transfer is a Hub-web admin operation; the desktop client has no code
  // path to it, so `advanced` must not appear however the scopes look.
  const { renderSettingsPage } = loadView({ desktop: true });
  const html = renderSettingsPage({ consumption: '<consumption-body></consumption-body>' });
  assert.deepEqual(sectionIds(html), ['accounts', 'consumption', 'preferences']);
  assert.match(html, /<desktop-settings><\/desktop-settings>/);
  assert.doesNotMatch(html, /<transfer-panel>/);
});

test('the stored section marks exactly one section active', () => {
  // The rail highlights the section the route asked for; without the marker the
  // page would always open on the first section.
  const { renderSettingsPage } = loadView({ prefs: { managementSection: 'consumption' } });
  const html = renderSettingsPage({ consumption: '<consumption-body></consumption-body>' });
  const active = [...html.matchAll(/data-settings-section="([a-z]+)"( data-settings-active)?/g)]
    .filter(([, , marker]) => marker)
    .map(([, id]) => id);
  assert.deepEqual(active, ['consumption']);
});
