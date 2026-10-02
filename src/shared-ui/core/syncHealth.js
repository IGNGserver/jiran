// Sync-health presentation.
//
// The main process sets connection states ('collecting', 'relay', 'backoff', …)
// and a failure code alongside them. This module maps those machine values onto
// translation keys.
//
// It is deliberately a named map rather than an inline lookup: a new state added
// to the main process would otherwise render as a raw slug, and the accompanying
// test asserts every state the collector can set has a label here.

export const SYNC_HEALTH_STATE_KEYS = Object.freeze({
  idle: 'settings.sync.healthState.idle',
  paused: 'settings.sync.healthState.paused',
  collecting: 'settings.sync.healthState.collecting',
  relay: 'settings.sync.healthState.relay',
  ok: 'settings.sync.healthState.ok',
  uploading: 'settings.sync.healthState.uploading',
  waiting: 'settings.sync.healthState.waiting',
  backoff: 'settings.sync.healthState.backoff',
  failed: 'settings.sync.healthState.failed',
  error: 'settings.sync.healthState.error',
  aborted: 'settings.sync.healthState.aborted',
  blocked: 'settings.sync.healthState.blocked',
  connecting: 'settings.sync.healthState.connecting',
  live: 'settings.sync.healthState.live',
  offline: 'settings.sync.healthState.offline',
  'idle-timeout': 'settings.sync.healthState.idleTimeout',
  not_applicable: 'settings.sync.healthState.notApplicable',
  stopped: 'settings.sync.healthState.stopped',
  unknown: 'settings.sync.healthState.unknown'
});

export const RECOVERY_CHANNEL_LABEL_KEYS = Object.freeze({
  collection: 'settings.sync.healthLocal',
  upload: 'settings.sync.healthUpload',
  rest: 'settings.sync.healthRest',
  stream: 'settings.sync.healthStream'
});

// Stable failure codes come from the main process and must be translated before
// they reach the UI. Keeping the fallback generic avoids exposing transport
// internals, URLs, or server response text in a settings panel.
export const SYNC_HEALTH_FAILURE_KEYS = Object.freeze({
  hub_not_configured: 'settings.sync.failure.hubNotConfigured',
  hub_secret_not_configured: 'settings.sync.failure.secretMissing',
  hub_transport_unavailable: 'settings.sync.failure.transportUnavailable',
  insecure_hub_transport: 'settings.sync.failure.insecureTransport',
  unauthorized: 'settings.sync.failure.unauthorized',
  forbidden: 'settings.sync.failure.forbidden',
  request_timeout: 'settings.sync.failure.timeout',
  refused: 'settings.sync.failure.refused',
  dns: 'settings.sync.failure.dns',
  unreachable: 'settings.sync.failure.unreachable',
  hub_server_error: 'settings.sync.failure.server',
  hub_read_failed: 'settings.sync.failure.readFailed',
  hub_invalid_response: 'settings.sync.failure.invalidResponse',
  disconnected: 'settings.sync.failure.disconnected',
  idle_timeout: 'settings.sync.failure.idleTimeout',
  stream_offline: 'settings.sync.failure.streamOffline',
  mode_reconcile_failed: 'settings.sync.failure.mode',
  upload_failed: 'settings.sync.failure.upload',
  sync_failed: 'settings.sync.failure.generic',
  aborted: 'settings.sync.failure.aborted'
});

const FAILURE_CHANNELS = Object.freeze(['rest', 'upload', 'stream', 'local']);

/** Translate a stable failure code without exposing raw Error.message text. */
export function syncHealthFailureLabel(code, t) {
  const normalized = String(code || '').trim().toLowerCase();
  const key = SYNC_HEALTH_FAILURE_KEYS[normalized] || SYNC_HEALTH_FAILURE_KEYS.sync_failed;
  return typeof t === 'function' ? t(key) : key;
}

/** Return the most useful persistent failure for the desktop connection panel. */
export function primarySyncHealthFailure(health) {
  if (!health || typeof health !== 'object') return null;
  for (const channel of FAILURE_CHANNELS) {
    const value = health[channel];
    const code = String(value?.failureCode || '').trim().toLowerCase();
    if (!code || code === 'aborted') continue;
    return {
      channel,
      code,
      status: Number.isInteger(Number(value?.status)) ? Number(value.status) : null,
      state: String(value?.state || '').trim()
    };
  }
  return null;
}

/** States the main process is allowed to publish, for tests and validation. */
export const KNOWN_SYNC_HEALTH_STATES = Object.freeze(Object.keys(SYNC_HEALTH_STATE_KEYS));

/** Translate a state for display. `t` is injected so this stays pure. */
export function syncHealthStateLabel(stateValue, t) {
  const state = String(stateValue || '').trim().toLowerCase();
  const key = SYNC_HEALTH_STATE_KEYS[state] || SYNC_HEALTH_STATE_KEYS.unknown;
  return typeof t === 'function' ? t(key) : key;
}

/** Channels that failed a recovery attempt, excluding not-applicable ones. */
export function recoveryFailures(result) {
  const channels = ['collection', 'upload', 'rest', 'stream'];
  if (!result || typeof result !== 'object') return [];
  const anyFailed = result.ok === false || channels.some((channel) => result[channel]?.ok === false);
  if (!anyFailed) return [];
  return channels
    .filter((channel) => result[channel]?.ok === false && result[channel]?.code !== 'not_applicable')
    .map((channel) => ({ channel, result: result[channel] }));
}
