'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

test('desktop sync health exposes a translated primary failure without raw errors', async () => {
  const { primarySyncHealthFailure, syncHealthFailureLabel } = await import('../../src/shared-ui/core/syncHealth.js');
  const health = {
    rest: { state: 'error', failureCode: 'unauthorized', status: 401 },
    upload: { state: 'error', failureCode: 'refused', status: null },
    stream: { state: 'offline', failureCode: null }
  };
  assert.deepEqual(primarySyncHealthFailure(health), {
    channel: 'rest',
    code: 'unauthorized',
    status: 401,
    state: 'error'
  });
  assert.equal(
    syncHealthFailureLabel('unauthorized', (key) => key),
    'settings.sync.failure.unauthorized'
  );
  assert.equal(syncHealthFailureLabel('private-token-value', (key) => key), 'settings.sync.failure.generic');
});

test('aborted recovery does not leave a persistent connection error', async () => {
  const { primarySyncHealthFailure } = await import('../../src/shared-ui/core/syncHealth.js');
  assert.equal(primarySyncHealthFailure({ rest: { failureCode: 'aborted' } }), null);
});
