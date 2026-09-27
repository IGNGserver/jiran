'use strict';

// Common contract for local usage sources. The collector still owns scheduling,
// anchors, and host-specific transport, while each adapter owns its on-disk
// format. Keeping this descriptor small lets Qoder retain its multi-source
// parser without making the main collector know about its file layout.
const { QODER_CLIENT_IDS, QODER_SITE_BY_CLIENT_ID } = require('./qoderCnUsage');

const LOCAL_USAGE_ADAPTERS = Object.freeze([
  Object.freeze({
    id: 'proma',
    clients: Object.freeze(['proma']),
    source: 'filesystem-jsonl',
    supportsRange: true,
    supportsHistory: true
  }),
  Object.freeze({
    id: 'claude-desktop',
    clients: Object.freeze(['claude-desktop']),
    source: 'filesystem-jsonl',
    supportsRange: true,
    supportsHistory: true
  }),
  ...QODER_CLIENT_IDS.map((clientId) => Object.freeze({
    id: clientId,
    clients: Object.freeze([clientId]),
    site: QODER_SITE_BY_CLIENT_ID[clientId],
    source: 'filesystem-multi-source',
    supportsRange: true,
    supportsHistory: true,
    supportsNativeMeters: true
  }))
]);

const LOCAL_USAGE_CLIENT_IDS = Object.freeze(
  LOCAL_USAGE_ADAPTERS.flatMap((adapter) => adapter.clients)
);

function localUsageAdapterContract(adapter) {
  if (!adapter || typeof adapter !== 'object') return null;
  return {
    id: adapter.id,
    clients: [...(adapter.clients || [])],
    source: adapter.source || 'filesystem',
    site: adapter.site || null,
    supportsRange: adapter.supportsRange === true,
    supportsHistory: adapter.supportsHistory === true,
    supportsNativeMeters: adapter.supportsNativeMeters === true
  };
}

function localUsageAdapterFor(clientId) {
  const id = String(clientId || '').trim().toLowerCase();
  return LOCAL_USAGE_ADAPTERS.find((adapter) => adapter.clients.includes(id)) || null;
}

module.exports = {
  LOCAL_USAGE_ADAPTERS,
  LOCAL_USAGE_CLIENT_IDS,
  localUsageAdapterContract,
  localUsageAdapterFor
};
