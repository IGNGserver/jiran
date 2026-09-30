'use strict';
/*
 * Shared-data consolidation for the 计然 / Jiran rename.
 *
 * Pre-rename builds kept shared runtime state (device-identity.json, agent.pid,
 * the daily/session archives, the tokscale cache) under `<appData>/Token
 * Monitor`; renamed builds anchor on `<appData>/Jiran`. The rev.37 desktop
 * already copied the folder forward for userData, but `sharedDataDir()` still
 * read the legacy location, leaving the split. Merge the legacy directory into
 * the new one before either runtime touches it: never overwrite a target file
 * (device-identity.json keeps first-mover semantics — the id must not fork or
 * the hub splits one machine into two devices), and never delete the legacy
 * directory (a still-running pre-rename desktop/agent recreates and keeps
 * writing there; the pid fallback covers it).
 */
const fs = require('node:fs');
const path = require('node:path');

const { legacySharedDataDir, sharedDataDir } = require('./config');

function migrateLegacySharedData(options = {}) {
  const target = options.target || sharedDataDir(options);
  const source = options.source || legacySharedDataDir(options);
  if (!source || !target) return { migrated: false, reason: 'missing-path' };
  if (source === target) return { migrated: false, reason: 'same-path' };
  if (!fs.existsSync(source)) return { migrated: false, reason: 'no-legacy-dir' };
  fs.mkdirSync(target, { recursive: true });
  const copied = [];
  const preserved = [];
  for (const entry of fs.readdirSync(source)) {
    const from = path.join(source, entry);
    const to = path.join(target, entry);
    if (fs.existsSync(to)) {
      preserved.push(entry);
      continue;
    }
    fs.cpSync(from, to, { recursive: true });
    copied.push(entry);
  }
  return { migrated: true, copied, preserved, source, target };
}

module.exports = { migrateLegacySharedData };
