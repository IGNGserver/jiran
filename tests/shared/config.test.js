'use strict';

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { pidFilePath, sharedDataDir, applyEnvAliases } = require('../../src/shared/config');

test('sharedDataDir uses TOKEN_MONITOR_SHARED_DIR override', () => {
  const previous = process.env.TOKEN_MONITOR_SHARED_DIR;
  process.env.TOKEN_MONITOR_SHARED_DIR = path.join(os.tmpdir(), 'token-monitor-test');
  try {
    assert.equal(sharedDataDir(), process.env.TOKEN_MONITOR_SHARED_DIR);
    assert.equal(pidFilePath(), path.join(process.env.TOKEN_MONITOR_SHARED_DIR, 'agent.pid'));
  } finally {
    if (previous === undefined) delete process.env.TOKEN_MONITOR_SHARED_DIR;
    else process.env.TOKEN_MONITOR_SHARED_DIR = previous;
  }
});

test('sharedDataDir follows Electron userData-compatible platform paths', () => {
  const home = path.join(path.sep, 'Users', 'javis');
  assert.equal(
    sharedDataDir({ platform: 'darwin', homeDir: home, env: {} }),
    path.join(home, 'Library', 'Application Support', 'Token Monitor')
  );
  assert.equal(
    sharedDataDir({ platform: 'win32', homeDir: home, env: { APPDATA: 'C:\\Users\\javis\\AppData\\Roaming' } }),
    path.join('C:\\Users\\javis\\AppData\\Roaming', 'Token Monitor')
  );
  assert.equal(
    sharedDataDir({ platform: 'linux', homeDir: home, env: { XDG_CONFIG_HOME: '/tmp/config' } }),
    path.join('/tmp/config', 'Token Monitor')
  );
});

test('applyEnvAliases folds JIRAN_* into the legacy TOKEN_MONITOR_* slots', () => {
  const env = {
    JIRAN_SECRET: 'new-secret',
    JIRAN_VERSION: '0.48.0',
    TOKEN_MONITOR_HUB_URL: 'http://hub',
    TOKEN_MONITOR_PORT: '18000',
    JIRAN_PORT: '19000',
    UNRELATED: 'x'
  };
  assert.equal(applyEnvAliases(env).TOKEN_MONITOR_SECRET, 'new-secret');
  assert.equal(env.TOKEN_MONITOR_VERSION, '0.48.0');
  // a legacy key that is already set always wins
  assert.equal(env.TOKEN_MONITOR_PORT, '18000');
  // no reverse alias: JIRAN_* never materialises from legacy-only keys
  assert.equal(env.JIRAN_HUB_URL, undefined);
  assert.equal(env.UNRELATED, 'x');
});

test('JIRAN_SECRET reaches hub auth through the real environment', () => {
  const previous = [process.env.JIRAN_SECRET, process.env.TOKEN_MONITOR_SECRET];
  try {
    delete process.env.TOKEN_MONITOR_SECRET;
    process.env.JIRAN_SECRET = 'aliased-secret';
    applyEnvAliases();
    assert.equal(process.env.TOKEN_MONITOR_SECRET, 'aliased-secret');
  } finally {
    [previous[0], previous[1]].forEach((value, index) => {
      const key = index === 0 ? 'JIRAN_SECRET' : 'TOKEN_MONITOR_SECRET';
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});
