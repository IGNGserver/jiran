'use strict';
/*
 * One-time userData migration for the 计然 / Jiran rename.
 *
 * Electron derives `userData` from `app.getName()`, so renaming the product would
 * silently strand `settings.json`, `credentials.json`, the stats cache and every
 * other profile file in the legacy `Token Monitor` folder. Copy that folder's
 * contents into the new one before anything reads it, but only when the target
 * has no settings.json yet — a fresh or already-migrated profile is never
 * clobbered, and per-entry conflicts resolve in favour of the new profile. The
 * legacy folder is intentionally left in place as an accidental backup.
 */
const fs = require('node:fs');
const path = require('node:path');

const LEGACY_APP_NAME = 'Token Monitor';

function migrateLegacyUserData({ appDataDir, appName = 'Jiran', legacyName = LEGACY_APP_NAME } = {}) {
  if (!appDataDir) return { migrated: false, reason: 'missing-appDataDir' };
  const target = path.join(appDataDir, appName);
  const source = path.join(appDataDir, legacyName);
  if (source === target) return { migrated: false, reason: 'same-path' };
  if (!fs.existsSync(source)) return { migrated: false, reason: 'no-legacy-dir' };
  if (fs.existsSync(path.join(target, 'settings.json'))) return { migrated: false, reason: 'target-has-settings' };
  fs.mkdirSync(target, { recursive: true });
  const copied = [];
  const preserved = [];
  for (const entry of fs.readdirSync(source)) {
    if (fs.existsSync(path.join(target, entry))) {
      preserved.push(entry);
      continue;
    }
    fs.cpSync(path.join(source, entry), path.join(target, entry), { recursive: true });
    copied.push(entry);
  }
  return { migrated: true, copied, preserved, source, target };
}

module.exports = { migrateLegacyUserData, LEGACY_APP_NAME };
