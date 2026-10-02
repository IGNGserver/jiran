'use strict';

// The Fluent switch owns the thumb position inside its shadow tree. A host-level
// ::part override that guesses at the checked attribute can pin every state to
// the middle/left, so keep the renderer stylesheet from taking over that logic.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..', '..');
const appCss = fs.readFileSync(path.join(root, 'src', 'shared-ui', 'styles', 'app.css'), 'utf8');
const desktopCss = fs.readFileSync(path.join(root, 'src', 'electron', 'renderer', 'desktop.css'), 'utf8');

test('desktop CSS does not override Fluent switch thumb positioning', () => {
  assert.doesNotMatch(appCss, /fluent-switch::part\(checked-indicator\)/);
  assert.doesNotMatch(appCss, /fluent-switch\[aria-checked=/);
  assert.match(appCss, /fluent-switch\s*\{\s*display:\s*inline-flex/);
  assert.match(desktopCss, /desktop-setting-switch-row > fluent-switch/);
});
