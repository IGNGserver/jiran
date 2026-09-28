'use strict';

// The browser-login-only Hub routes: credential status on read, in-place
// re-authorization through `/oauth/exchange`, and the clear-credential endpoint.

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { createHub } = require(path.join(__dirname, '..', '..', 'src', 'hub', 'server.js'));
const { MemoryRepository } = require('./memory-repository');

function accountProbe(provider) {
  return {
    provider,
    status: 'ok',
    accountKey: `${provider}-key`,
    accountEmail: `${provider}@example.test`,
    accountLabel: provider,
    windows: [{ kind: 'weekly', usedPercent: 5 }]
  };
}

async function requestJson(port, routePath, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${routePath}`, {
    method: options.method || 'GET',
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  return { response, body: await response.json().catch(() => null) };
}

function startHub(repository, overrides = {}) {
  return createHub({
    port: 0,
    host: '127.0.0.1',
    adminSecret: 'admin-token',
    accountCredentialKey: 'account-encryption-key',
    accountProbe: async (provider) => accountProbe(provider),
    accountRefreshMs: 60_000,
    repository,
    logger: { error() {}, warn() {}, info() {} },
    ...overrides
  });
}

test('GET /api/accounts reports whether a credential is still stored', async () => {
  const repository = new MemoryRepository();
  const hub = startHub(repository);
  await hub.start();
  try {
    const { port } = hub.server.address();
    const added = await requestJson(port, '/api/accounts', {
      method: 'POST',
      token: 'admin-token',
      body: { provider: 'codex', name: 'codex-work', credential: { accessToken: 'chatgpt-secret' } }
    });
    assert.equal(added.response.status, 201);

    const listed = await requestJson(port, '/api/accounts', { token: 'admin-token' });
    assert.equal(listed.response.status, 200);
    assert.equal(listed.body.accounts[0].credentialConfigured, true);
    assert.equal(JSON.stringify(listed.body).includes('chatgpt-secret'), false);
  } finally {
    await hub.stop();
  }
});

test('DELETE /api/accounts/:id/credential clears the secret but keeps the account', async () => {
  const repository = new MemoryRepository();
  const hub = startHub(repository);
  await hub.start();
  try {
    const { port } = hub.server.address();
    const added = await requestJson(port, '/api/accounts', {
      method: 'POST',
      token: 'admin-token',
      body: { provider: 'antigravity', name: 'agy', label: 'Work', credential: { accessToken: 'agy-secret' } }
    });
    const accountId = added.body.account.id;

    const cleared = await requestJson(port, `/api/accounts/${encodeURIComponent(accountId)}/credential`, {
      method: 'DELETE',
      token: 'admin-token'
    });
    assert.equal(cleared.response.status, 200);
    assert.equal(cleared.body.ok, true);
    assert.equal(cleared.body.account.id, accountId);
    assert.equal(cleared.body.account.credentialConfigured, false);
    assert.equal(cleared.body.account.status, 'notConfigured');
    assert.equal(cleared.body.account.name, 'agy');
    assert.equal(JSON.stringify(cleared.body).includes('agy-secret'), false);

    // The account survives, so re-authorization can target the same row.
    const listed = await requestJson(port, '/api/accounts', { token: 'admin-token' });
    assert.equal(listed.body.accounts.length, 1);

    const missing = await requestJson(port, '/api/accounts/nope/credential', {
      method: 'DELETE',
      token: 'admin-token'
    });
    assert.equal(missing.response.status, 404);

    const unauthorized = await requestJson(port, `/api/accounts/${encodeURIComponent(accountId)}/credential`, {
      method: 'DELETE'
    });
    assert.equal(unauthorized.response.status, 401);
  } finally {
    await hub.stop();
  }
});

test('POST /api/accounts/oauth/exchange with an accountId re-authorizes in place', async () => {
  const repository = new MemoryRepository();
  const hub = startHub(repository, {
    oauthFetch: async () => new Response(JSON.stringify({
      access_token: 'agy-access-2',
      refresh_token: 'agy-refresh-2',
      expires_in: 3600
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  });
  await hub.start();
  try {
    const { port } = hub.server.address();
    const added = await requestJson(port, '/api/accounts', {
      method: 'POST',
      token: 'admin-token',
      body: { provider: 'antigravity', name: 'agy', credential: { accessToken: 'agy-first' } }
    });
    const accountId = added.body.account.id;

    const start = await requestJson(port, '/api/accounts/oauth/start', {
      method: 'POST',
      token: 'admin-token',
      body: { provider: 'antigravity' }
    });
    const exchange = await requestJson(port, '/api/accounts/oauth/exchange', {
      method: 'POST',
      token: 'admin-token',
      body: {
        sessionId: start.body.sessionId,
        redirectUrl: '4/0AX4XfWhReauthCode',
        accountId
      }
    });

    assert.equal(exchange.response.status, 200);
    assert.equal(exchange.body.account.id, accountId);
    assert.equal(exchange.body.account.credentialConfigured, true);
    assert.equal(JSON.stringify(exchange.body).includes('agy-access-2'), false);

    const listed = await requestJson(port, '/api/accounts', { token: 'admin-token' });
    assert.equal(listed.body.accounts.length, 1, 're-authorization must not add a second account');
  } finally {
    await hub.stop();
  }
});
