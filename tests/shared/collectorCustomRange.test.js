'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { collectCustomRangeOnce } = require('../../src/shared/collector');

test('collectCustomRangeOnce filters tokscale rows by decorated timestamps', async () => {
  const result = await collectCustomRangeOnce({
    clients: 'codex',
    range: {
      startDate: '2026-07-24',
      endDate: '2026-07-24',
      startHour: 0,
      endHour: 23
    },
    commandTimeoutMs: 1000,
    projectsEnabled: false,
    sessionUsageArchive: { version: 1, sessions: {} },
    runTokscale: async () => ({
      entries: [
        {
          client: 'codex',
          sessionId: 's1',
          model: 'gpt-5',
          input: 10,
          output: 5,
          cacheRead: 0,
          cacheWrite: 0,
          cost: 0.1,
          startedAt: '2026-07-24T03:00:00.000Z',
          lastUsedAt: '2026-07-24T04:00:00.000Z'
        }
      ]
    }),
    sessionMetadataDeps: {
      // prevent filesystem lookups
      findSessionFiles: () => [],
      sessionTimestampMap: () => new Map()
    },
    homeDir: process.cwd()
  });

  assert.equal(result.range.startDate, '2026-07-24');
  assert.ok(result.period);
  assert.equal(result.period.totalTokens > 0, true);
});

test('collectCustomRangeOnce folds the WSL answer into the same window', async () => {
  // 昨日 / 本周 must not be a different measurement from 今日: the running-distro
  // pass used to be missing here entirely.
  let wslCalled = null;
  const result = await collectCustomRangeOnce({
    clients: 'codex',
    range: { startDate: '2026-07-24', endDate: '2026-07-24', startHour: 0, endHour: 23 },
    commandTimeoutMs: 1000,
    projectsEnabled: false,
    sessionUsageArchive: { version: 1, sessions: {} },
    homeDir: process.cwd(),
    sessionMetadataDeps: { findSessionFiles: () => [], sessionTimestampMap: () => new Map() },
    runTokscale: async () => ({
      entries: [{
        client: 'codex', sessionId: 'host-1', model: 'gpt-5', input: 10, output: 0,
        cacheRead: 0, cacheWrite: 0, cost: 0.1,
        startedAt: '2026-07-24T03:00:00.000Z', lastUsedAt: '2026-07-24T04:00:00.000Z'
      }]
    }),
    collectWslRangeUsage: async (options) => {
      wslCalled = options;
      return {
        ...require('../../src/shared/usage').emptyPeriod(),
        totalTokens: 5,
        costUsd: 0.05,
        clients: { codex: 5 },
        clientCosts: { codex: 0.05 },
        models: { 'gpt-5': 5 },
        modelCosts: { 'gpt-5': 0.05 }
      };
    }
  });

  assert.ok(wslCalled, 'the range scan never asked the WSL pass');
  assert.equal(wslCalled.range.since, '2026-07-24');
  assert.equal(wslCalled.trackedClients, 'codex');
  assert.equal(result.period.clients.codex, 15);
});

test('a failed WSL range pass keeps the host answer', async () => {
  const logs = [];
  const result = await collectCustomRangeOnce({
    clients: 'codex',
    range: { startDate: '2026-07-24', endDate: '2026-07-24', startHour: 0, endHour: 23 },
    projectsEnabled: false,
    sessionUsageArchive: { version: 1, sessions: {} },
    homeDir: process.cwd(),
    sessionMetadataDeps: { findSessionFiles: () => [], sessionTimestampMap: () => new Map() },
    logger: (message) => logs.push(message),
    runTokscale: async () => ({
      entries: [{
        client: 'codex', sessionId: 'host-1', model: 'gpt-5', input: 10, output: 0,
        cacheRead: 0, cacheWrite: 0, cost: 0.1,
        startedAt: '2026-07-24T03:00:00.000Z', lastUsedAt: '2026-07-24T04:00:00.000Z'
      }]
    }),
    collectWslRangeUsage: async () => { throw new Error('wsl.exe unavailable'); }
  });

  assert.equal(result.period.clients.codex, 10);
  assert.match(logs.join('\n'), /wsl custom-range scan failed/);
});

// The archive is what keeps a pruned day visible on the fixed tabs. A custom
// range that skipped it made 昨日 / 本周 disagree with 本月 for exactly the days
// the tool had already cleaned up — the same day measured two ways.
function archivedEntry(client, sessionId, day, tokens) {
  return {
    [`${client}:${sessionId}`]: {
      client,
      sessionId,
      capturedAt: `${day}T23:00:00.000Z`,
      day,
      month: day.slice(0, 7),
      periodWindows: { today: { day }, month: { month: day.slice(0, 7) }, allTime: {} },
      periods: {
        today: { client, sessionId, totalTokens: tokens, costUsd: 0, models: { 'gpt-5': tokens }, modelCosts: {} },
        month: { client, sessionId, totalTokens: tokens, costUsd: 0, models: { 'gpt-5': tokens }, modelCosts: {} },
        allTime: { client, sessionId, totalTokens: tokens, costUsd: 0, models: { 'gpt-5': tokens }, modelCosts: {} }
      }
    }
  };
}

function rangeScanOptions(archive) {
  return {
    clients: 'claude',
    range: { startDate: '2026-07-23', endDate: '2026-07-24', startHour: 0, endHour: 23 },
    projectsEnabled: false,
    homeDir: process.cwd(),
    sessionUsageArchive: { version: 1, sessions: archive },
    sessionMetadataDeps: { findSessionFiles: () => [], sessionTimestampMap: () => new Map() },
    runTokscale: async () => ({
      entries: [{
        client: 'claude', sessionId: 'live-1', model: 'gpt-5', input: 10, output: 0,
        cacheRead: 0, cacheWrite: 0, cost: 0,
        startedAt: '2026-07-24T03:00:00.000Z', lastUsedAt: '2026-07-24T04:00:00.000Z'
      }]
    })
  };
}

test('collectCustomRangeOnce restores archived sessions for the days in the window', async () => {
  const result = await collectCustomRangeOnce(rangeScanOptions({
    ...archivedEntry('claude', 'gone-1', '2026-07-23', 40),
    ...archivedEntry('claude', 'gone-2', '2026-07-24', 5),
    ...archivedEntry('claude', 'outside', '2026-07-20', 999)
  }));

  // live 10 + in-window archive 45; the out-of-window entry must not appear.
  assert.equal(result.period.totalTokens, 55);
  assert.equal(result.period.clients.claude, 55);
  assert.ok(Object.keys(result.period.sessions).includes('claude:gone-1'));
});

test('a session the range scan already saw is not counted twice', async () => {
  const options = rangeScanOptions(archivedEntry('claude', 'live-1', '2026-07-24', 10));
  const result = await collectCustomRangeOnce(options);
  assert.equal(result.period.totalTokens, 10, 'the archive mirrors the live session, so nothing should be added');
});

test('a disabled session archive leaves the range answer as scanned', async () => {
  const options = { ...rangeScanOptions(archivedEntry('claude', 'gone-1', '2026-07-23', 40)), sessionUsageArchiveEnabled: false };
  const result = await collectCustomRangeOnce(options);
  assert.equal(result.period.totalTokens, 10);
});

test('the range restores through the reader the desktop path actually uses', async () => {
  // `sessionUsageArchive` is the test seam; production hands over nothing and the
  // collector reads the archive itself. Injecting only the reader exercises that
  // real branch without touching a file.
  const result = await collectCustomRangeOnce({
    ...rangeScanOptions({}),
    sessionUsageArchive: undefined,
    readSessionUsageArchive: () => ({ version: 1, sessions: archivedEntry('claude', 'gone-1', '2026-07-23', 40) })
  });
  assert.equal(result.period.totalTokens, 50);
  assert.ok(Object.keys(result.period.sessions).includes('claude:gone-1'));
});

test('an unreadable archive does not void the host answer', async () => {
  // A failing restoration must degrade to "as scanned" — never to a range that
  // silently reports less than the tool still has on disk, and never to a throw
  // that blanks the tab.
  const logs = [];
  const result = await collectCustomRangeOnce({
    ...rangeScanOptions({}),
    sessionUsageArchive: undefined,
    readSessionUsageArchive: () => { throw new Error('EACCES'); },
    logger: (message) => logs.push(message)
  });
  assert.equal(result.period.totalTokens, 10);
  assert.match(logs.join('\n'), /session archive range restore failed/);
});

// Both Qoder editions are read by this project's own adapter, so a range answer
// that skipped the adapter showed Qoder in 今日 / 本月 / 全部 and nothing in
// 昨日 / 本周 — the same tool measured two ways.
test('collectCustomRangeOnce folds both Qoder editions into the window', async () => {
  const inWindow = new Date(2026, 6, 24, 12, 0, 0).getTime();
  const outside = new Date(2026, 6, 22, 12, 0, 0).getTime();
  const asked = [];
  const result = await collectCustomRangeOnce({
    clients: 'claude,qoder,qodercn',
    range: { startDate: '2026-07-23', endDate: '2026-07-24', startHour: 0, endHour: 23 },
    projectsEnabled: false,
    homeDir: process.cwd(),
    sessionUsageArchive: { version: 1, sessions: {} },
    sessionMetadataDeps: { findSessionFiles: () => [], sessionTimestampMap: () => new Map() },
    runTokscale: async () => ({
      entries: [{
        client: 'claude', sessionId: 'c1', model: 'sonnet', input: 10, output: 0,
        cacheRead: 0, cacheWrite: 0, cost: 0.1,
        startedAt: '2026-07-24T03:00:00.000Z', lastUsedAt: '2026-07-24T04:00:00.000Z'
      }]
    }),
    collectQoderClientUsage: async (clientId) => {
      asked.push(clientId);
      return {
        rows: [
          {
            sessionId: 's-in', model: 'qoder-large', input: 20, output: 5, cacheRead: 0,
            cacheWrite: 0, messages: 2, credits: 1.5, createdAt: inWindow, estimated: true
          },
          {
            sessionId: 's-out', model: 'qoder-large', input: 999, output: 0, cacheRead: 0,
            cacheWrite: 0, messages: 1, createdAt: outside
          }
        ],
        pricing: {}
      };
    }
  });

  assert.deepEqual(asked.sort(), ['qoder', 'qodercn']);
  assert.equal(result.period.clients.claude, 10);
  // The in-window row only: 20 + 5 per edition, and the out-of-window 999 stayed out.
  assert.equal(result.period.clients.qoder, 25);
  assert.equal(result.period.clients.qodercn, 25);
  // Qoder token totals are an estimate and its credits are the exact provider
  // unit; a range that dropped either would present an estimate as a measurement.
  assert.equal(result.period.clientEstimated.qoder, true);
  assert.equal(result.period.clientEstimated.qodercn, true);
  assert.equal(result.period.clientCredits.qodercn, 1.5);
});

test('a failing Qoder adapter leaves the rest of the range answer intact', async () => {
  const logs = [];
  const result = await collectCustomRangeOnce({
    clients: 'claude,qodercn',
    range: { startDate: '2026-07-23', endDate: '2026-07-24', startHour: 0, endHour: 23 },
    projectsEnabled: false,
    homeDir: process.cwd(),
    sessionUsageArchive: { version: 1, sessions: {} },
    sessionMetadataDeps: { findSessionFiles: () => [], sessionTimestampMap: () => new Map() },
    logger: (message) => logs.push(message),
    runTokscale: async () => ({
      entries: [{
        client: 'claude', sessionId: 'c1', model: 'sonnet', input: 10, output: 0,
        cacheRead: 0, cacheWrite: 0, cost: 0.1,
        startedAt: '2026-07-24T03:00:00.000Z', lastUsedAt: '2026-07-24T04:00:00.000Z'
      }]
    }),
    collectQoderClientUsage: async () => { throw new Error('local.db locked'); }
  });

  assert.equal(result.period.clients.claude, 10);
  assert.equal(result.period.clients.qodercn, undefined);
  assert.match(logs.join('\n'), /qodercn custom-range parse failed/);
});
