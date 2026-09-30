'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { migrateLegacySharedData } = require('../../src/shared/sharedDataMigration');

function tempDirs(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jiran-shareddata-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { source: path.join(root, 'Token Monitor'), target: path.join(root, 'Jiran') };
}

test('merges every legacy shared-data entry into the new directory', (t) => {
  const { source, target } = tempDirs(t);
  fs.mkdirSync(path.join(source, 'tokscale'), { recursive: true });
  fs.writeFileSync(path.join(source, 'device-identity.json'), '{"deviceId":"stable-id"}');
  fs.writeFileSync(path.join(source, 'agent.pid'), '4242');
  fs.writeFileSync(path.join(source, 'tokscale', 'cache.json'), '{}');

  const result = migrateLegacySharedData({ source, target });
  assert.equal(result.migrated, true);
  assert.deepEqual(result.copied.sort(), ['agent.pid', 'device-identity.json', 'tokscale']);
  assert.equal(fs.readFileSync(path.join(target, 'device-identity.json'), 'utf8'), '{"deviceId":"stable-id"}');
  assert.ok(fs.existsSync(path.join(target, 'tokscale', 'cache.json')));
  // the legacy directory must survive: a still-running pre-rename agent or
  // desktop keeps writing there and deleting would recreate it under us
  assert.ok(fs.existsSync(path.join(source, 'device-identity.json')));
});

test('never overwrites an existing target file — the device id keeps first-mover semantics', (t) => {
  const { source, target } = tempDirs(t);
  fs.mkdirSync(source, { recursive: true });
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(source, 'device-identity.json'), '{"deviceId":"legacy"}');
  fs.writeFileSync(path.join(target, 'device-identity.json'), '{"deviceId":"current"}');

  const result = migrateLegacySharedData({ source, target });
  assert.equal(result.migrated, true);
  assert.deepEqual(result.preserved, ['device-identity.json']);
  assert.equal(fs.readFileSync(path.join(target, 'device-identity.json'), 'utf8'), '{"deviceId":"current"}');
});

test('no-ops without a legacy directory and for a collapsed same path', (t) => {
  const { source, target } = tempDirs(t);
  assert.equal(migrateLegacySharedData({ source, target }).reason, 'no-legacy-dir');
  assert.equal(migrateLegacySharedData({ source: target, target }).reason, 'same-path');
  assert.equal(fs.existsSync(target), false);
});

test('is idempotent across restarts', (t) => {
  const { source, target } = tempDirs(t);
  fs.mkdirSync(source, { recursive: true });
  fs.writeFileSync(path.join(source, 'daily-history-archive.json'), '{}');
  const first = migrateLegacySharedData({ source, target });
  const second = migrateLegacySharedData({ source, target });
  assert.equal(first.migrated, true);
  assert.equal(second.migrated, true);
  assert.deepEqual(second.copied, []);
  assert.deepEqual(second.preserved, ['daily-history-archive.json']);
});
