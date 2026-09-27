'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { MESSAGE_KEYS, SUPPORTED_LOCALES } = require('../../src/shared-ui/core/i18n.js');

const REPO_ROOT = path.join(__dirname, '..', '..');
const APP_SOURCE = fs.readFileSync(path.join(REPO_ROOT, 'src/shared-ui/app.js'), 'utf8');
const TRANSFER_SOURCE = fs.readFileSync(path.join(REPO_ROOT, 'src/shared-ui/views/transfer.js'), 'utf8');

/** Every id the rendered navigation groups list, in source order. */
function navigationGroupIds() {
  const groups = [...APP_SOURCE.matchAll(/\['nav\.(group[A-Za-z]+)',\s*\[([^\]]*)\]\]/g)];
  assert.ok(groups.length >= 3, 'the navigation group table must still be parseable');
  return groups.flatMap(([, , ids]) => [...ids.matchAll(/'([a-z]+)'/g)].map(([, id]) => id));
}

test('every navigation id has a label in every supported locale', () => {
  // `tr()` falls back to English, so a missing translation is invisible at runtime —
  // which is how `nav.transfer` stayed alive in the catalogue with no caller and the
  // page then shipped with no navigation entry at all. The reverse is checked here:
  // an id that navigation renders must be labelled everywhere.
  for (const id of navigationGroupIds()) {
    for (const locale of SUPPORTED_LOCALES) {
      assert.ok(
        MESSAGE_KEYS[locale].includes(`nav.${id}`),
        `nav.${id} is missing from the ${locale} catalogue`
      );
    }
  }
});

test('device transfer is reachable from the administration navigation', () => {
  // The endpoint (`POST /api/devices/:id/transfer`), the standalone view, the route and
  // the five locale labels all existed while no navigation group listed the id, so the
  // page was reachable only by typing `/transfer`. This is that regression's guard.
  const ids = navigationGroupIds();
  assert.ok(ids.includes('transfer'), 'transfer must appear in a navigation group');
  const administration = APP_SOURCE.match(/\['nav\.groupAdministration',\s*\[([^\]]*)\]\]/);
  assert.ok(administration, 'the administration group must exist');
  assert.match(administration[1], /'transfer'/, 'transfer belongs to the administration group');
});

test('the transfer view stays admin-gated', () => {
  // The Hub rejects a non-admin transfer outright, so an entry that is always visible
  // would only lead to a disabled form. Both halves are asserted: the navigation filter
  // and the panel's own submit gate.
  assert.match(APP_SOURCE, /view\.id === 'transfer'\)\s*return admin === true/);
  assert.match(TRANSFER_SOURCE, /scopes\?\.includes\('admin'\)/);
  assert.match(TRANSFER_SOURCE, /transfer\.needsAdmin/);
});

test('the standalone transfer page does not borrow desktop-only settings scaffolding', () => {
  // `settings-layout` is a two-column grid above 860px and the `desktop-settings-*`
  // classes are styled only by the Electron renderer, so a single-panel page built out
  // of them renders in an empty column on the web dashboard. Asserted on the class
  // attributes rather than on the file text, so the comment explaining this stays put.
  assert.match(TRANSFER_SOURCE, /export function renderTransfer\(\)/);
  assert.doesNotMatch(TRANSFER_SOURCE, /class="[^"]*settings-transfer-layout/);
  assert.doesNotMatch(TRANSFER_SOURCE, /class="[^"]*desktop-settings-body/);
  assert.doesNotMatch(TRANSFER_SOURCE, /class="[^"]*settings-layout/);
});