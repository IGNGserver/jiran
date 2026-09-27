'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  classifySettingsChange,
  envelopeFromSettings,
  usageConfigFromSettings
} = require('../../src/electron/runtimeConfig');

test('runtime config keeps usage and envelope separate from Hub credentials', () => {
  const settings = {
    deviceId: 'device-1',
    // Retired keys: a stale settings.json must not reach the collector.
    clients: 'claude,cursor',
    collectionIntervalMs: 300000,
    projectsEnabled: false,
    historyEnabled: false,
    hubHostSecret: 'legacy-host-secret',
    kimiApiKey: 'legacy-local-secret'
  };
  const usage = usageConfigFromSettings(settings, { agentVersion: '1.2.3' });
  const envelope = envelopeFromSettings(settings, { agentVersion: '1.2.3' });

  assert.equal(usage.intervalMs, 300000);
  assert.equal(usage.clients, require('../../src/shared/clientTracking').TRACKED_CLIENTS);
  assert.equal(usage.projectsEnabled, true);
  assert.equal(usage.historyEnabled, true);
  assert.equal(Object.hasOwn(usage, 'hubHostSecret'), false);
  assert.equal(Object.hasOwn(usage, 'kimiApiKey'), false);
  assert.deepEqual(envelope, {
    deviceId: 'device-1',
    agentVersion: '1.2.3',
    agentRuntime: 'electron-widget'
  });
});

test('local provider credential changes do not reconfigure a device limits lane', () => {
  const classification = classifySettingsChange(
    { kimiApiKey: 'old', openrouterProfiles: { work: { apiKey: 'old' } } },
    { kimiApiKey: 'new', openrouterProfiles: { work: { apiKey: 'new' } } }
  );

  assert.deepEqual(Object.keys(classification), ['modeStructural']);
  assert.equal(classification.modeStructural, false);
});

test('display-only settings do not restart usage or probe providers', () => {
  const classification = classifySettingsChange(
    { currency: 'USD', theme: 'dark' },
    { currency: 'HKD', theme: 'light' }
  );
  assert.deepEqual(Object.keys(classification), ['modeStructural']);
  assert.equal(classification.modeStructural, false);
});

test('no collector-cadence setting can restart the usage runtime', () => {
  // These keys are retired: the only remaining structural input is the Hub mode.
  const classification = classifySettingsChange(
    { projectsEnabled: true, historyEnabled: true, watchEnabled: true, collectionIntervalMs: 1, syncUploadIntervalMs: 1, allTimeSince: '2020-01-01' },
    { projectsEnabled: false, historyEnabled: false, watchEnabled: false, collectionIntervalMs: 2, syncUploadIntervalMs: 2, allTimeSince: '2021-01-01' }
  );
  assert.equal(classification.modeStructural, false);
});

test('allowInsecureHubHttp change triggers mode structural restart', () => {
  const classification = classifySettingsChange(
    { allowInsecureHubHttp: false },
    { allowInsecureHubHttp: true }
  );
  assert.equal(classification.modeStructural, true);
});

