'use strict';

// The browser-login-only lifecycle for the two OAuth providers.
//
// `codex` and `antigravity` are configured exclusively through the Hub-side
// browser sign-in; the manual `authJson` / `endpoint+csrfToken` shapes are no
// longer reachable from the UI. Editing such an account must therefore be able to
// (a) report whether a credential is still stored without echoing it, (b) clear
// it while keeping the account, and (c) replace it in place on re-authorization
// instead of accumulating a second account.

const assert = require('node:assert/strict');
const test = require('node:test');

const { decryptCredential } = require('../../src/hub/accountCrypto');
const { createHubAccountService } = require('../../src/hub/accountService');
const { MemoryRepository } = require('./memory-repository');

function probeRow(provider, accountKey = `${provider}-account`) {
  return {
    provider,
    status: 'ok',
    accountKey,
    accountEmail: `${accountKey}@example.test`,
    accountLabel: 'Manual Hub account',
    windows: [{ kind: 'weekly', usedPercent: 10 }]
  };
}

function serviceFor(repository, probe = async (provider) => probeRow(provider)) {
  return createHubAccountService({
    store: repository,
    credentialKey: 'hub-key',
    probe,
    now: () => Date.parse('2026-09-28T00:00:00Z')
  });
}

test('a stored credential is reported as configured without echoing it', async () => {
  const repository = new MemoryRepository();
  const service = serviceFor(repository);
  const account = await service.addAccount({
    provider: 'codex',
    credential: { accessToken: 'chatgpt-secret', source: 'oauth' }
  });

  const listed = await service.listAccounts({ includeCredentialMetadata: true });
  assert.equal(listed[0].credentialConfigured, true);
  assert.equal(JSON.stringify(listed).includes('chatgpt-secret'), false);

  // Metadata-only records carry the flag as well, so a plain (non-owner) read
  // still tells the UI "filled in" without leaking a value.
  const plain = await service.listAccounts();
  assert.equal(Object.prototype.hasOwnProperty.call(plain[0], 'credentialConfigured'), false);
  assert.equal(JSON.stringify(plain).includes('chatgpt-secret'), false);

  const added = await service.addAccount({
    provider: 'deepseek',
    credential: { apiKey: 'k' }
  });
  assert.equal(added.credentialConfigured, true);
});

test('clearing a credential keeps the account but reports it unconfigured', async () => {
  const repository = new MemoryRepository();
  let probes = 0;
  const service = serviceFor(repository, async (provider) => {
    probes += 1;
    return probeRow(provider, 'clear-me');
  });

  const account = await service.addAccount({
    provider: 'antigravity',
    name: 'agy-work',
    label: 'Work',
    credential: { accessToken: 'agy-access', refreshToken: 'agy-refresh', source: 'oauth' }
  });
  assert.equal(probes, 1);

  const cleared = await service.clearAccountCredential(account.id);
  assert.equal(cleared, true);
  // Clearing is not a probe: an empty credential would only fail.
  assert.equal(probes, 1);

  const listed = await service.listAccounts({ includeCredentialMetadata: true });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].id, account.id);
  assert.equal(listed[0].name, 'agy-work');
  assert.equal(listed[0].label, 'Work');
  assert.equal(listed[0].enabled, true);
  assert.equal(listed[0].credentialConfigured, false);
  assert.equal(listed[0].status, 'notConfigured');
  assert.equal(listed[0].accountKey, '');
  assert.equal(listed[0].accountEmail, '');
  assert.equal(listed[0].limits.status, 'notConfigured');
  assert.deepEqual(listed[0].limits.windows, []);

  // The encrypted envelope no longer holds anything usable.
  assert.deepEqual(decryptCredential(repository.hubCredentials.get(account.id), 'hub-key'), {});

  // A cleared account that is not re-authorized stays out of the central limits
  // aggregate (it has no quota to report).
  const summary = await service.getLimitsSummary();
  assert.equal(summary.providers[0].status, 'notConfigured');

  assert.equal(await service.clearAccountCredential('missing'), null);
});

test('re-authorizing replaces the credential in place instead of adding a duplicate', async () => {
  const repository = new MemoryRepository();
  const service = serviceFor(repository);
  const account = await service.addAccount({
    provider: 'codex',
    name: 'codex-work',
    credential: { accessToken: 'first-access', source: 'oauth' }
  });

  const reauthorized = await service.authorizeAccount(account.id, {
    credential: { accessToken: 'second-access', source: 'oauth' },
    name: 'codex-work',
    label: 'Rotated'
  });

  assert.equal(reauthorized.id, account.id);
  assert.equal(reauthorized.status, 'ok');
  assert.equal(reauthorized.credentialConfigured, true);
  assert.equal(reauthorized.label, 'Rotated');

  const listed = await service.listAccounts({ includeCredentialMetadata: true });
  assert.equal(listed.length, 1, 're-authorization must not create a second account');
  assert.equal(decryptCredential(repository.hubCredentials.get(account.id), 'hub-key').accessToken, 'second-access');

  assert.equal(await service.authorizeAccount('missing', { credential: { accessToken: 'x' } }), null);
});

test('re-authorizing a different account onto an existing identity is rejected', async () => {
  const repository = new MemoryRepository();
  // Identity follows the token, the way a real provider reports the same account
  // for the same login. Re-authorizing account B with account A's credential must
  // therefore collide rather than silently fork one login into two rows.
  const service = serviceFor(repository, async (provider, options) => (
    probeRow(provider, options.codexAccessToken)
  ));

  await service.addAccount({ provider: 'codex', credential: { accessToken: 'account-a' } });
  const second = await service.addAccount({ provider: 'codex', credential: { accessToken: 'account-b' } });

  await assert.rejects(
    service.authorizeAccount(second.id, { credential: { accessToken: 'account-a' } }),
    { code: 'account_duplicate' }
  );
});
