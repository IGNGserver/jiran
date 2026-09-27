'use strict';

// Which settings changes have to tear a runtime down and build it again.
//
// Only the *mode* keys are structural any more. The collector cadence keys
// (collectionMode / interval / watch / history / archive / projects / WSL /
// allTimeSince / upload cadence) left the settings document with the surface
// that used to write them — see src/shared/collectorConfig.js, where they are
// constants now — so no renderer write can reshape the usage runtime.

const { usageConfigFromSource } = require('../shared/collectorConfig');

const MODE_STRUCTURAL_KEYS = Object.freeze([
  'hubMode',
  'hubUrl',
  'allowInsecureHubHttp',
  'secret',
  'deviceId'
]);

function equalSetting(left, right) {
  if (left === right) return true;
  if ((left === undefined || left === null) && (right === undefined || right === null)) return true;
  try { return JSON.stringify(left) === JSON.stringify(right); }
  catch (_) { return false; }
}

function changedAny(previous, next, keys) {
  return keys.some((key) => !equalSetting(previous?.[key], next?.[key]));
}

function usageConfigFromSettings(settings = {}, context = {}) {
  return usageConfigFromSource(settings, context);
}

function envelopeFromSettings(settings = {}, context = {}) {
  return {
    deviceId: settings.deviceId || context.defaultDeviceId,
    agentVersion: context.agentVersion,
    agentRuntime: context.agentRuntime || 'electron-widget'
  };
}

function classifySettingsChange(previous = {}, next = {}) {
  return {
    modeStructural: changedAny(previous, next, MODE_STRUCTURAL_KEYS)
  };
}

module.exports = {
  MODE_STRUCTURAL_KEYS,
  classifySettingsChange,
  envelopeFromSettings,
  usageConfigFromSettings
};
