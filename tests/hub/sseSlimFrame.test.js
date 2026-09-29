'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createHub } = require('../../src/hub/server');
const { MemoryRepository } = require('./memory-repository');

function createMemoryHub(options = {}) {
  const repository = options.repository || new MemoryRepository();
  return {
    repository,
    hub: createHub({
      port: 0,
      host: '127.0.0.1',
      secret: '',
      repository,
      logger: { error() {}, warn() {}, info() {} },
      ...options
    })
  };
}

function sessions(count, deviceTag) {
  const out = {};
  for (let i = 0; i < count; i++) {
    const lastUsedAt = new Date(Date.UTC(2026, 6, 18) - i * 60000).toISOString();
    out[`codex:${deviceTag}-${i}`] = {
      client: 'codex',
      sessionId: `${deviceTag}-${i}`,
      projectId: `project-${i % 5}`,
      projectLabel: `Project ${i % 5}`,
      totalTokens: 1000 + i,
      messageCount: 12,
      costUsd: (1000 + i) / 1_000_000,
      startedAt: lastUsedAt,
      lastUsedAt,
      models: { 'gpt-5': 1000 + i }
    };
  }
  return out;
}

function period(totalTokens, count, deviceTag) {
  return {
    totalTokens,
    costUsd: totalTokens / 1_000_000,
    clients: { codex: totalTokens },
    clientCosts: { codex: totalTokens / 1_000_000 },
    models: { 'gpt-5': totalTokens },
    modelCosts: { 'gpt-5': totalTokens / 1_000_000 },
    clientModels: { codex: { 'gpt-5': totalTokens } },
    clientModelCosts: { codex: { 'gpt-5': totalTokens / 1_000_000 } },
    clientEstimated: {},
    clientCredits: {},
    clientMeasurements: {},
    estimated: false,
    projects: { 'project-0': { label: 'Project 0', tokens: totalTokens, costUsd: 0, clients: { codex: totalTokens } } },
    sessions: sessions(count, deviceTag)
  };
}

function payload(totalTokens, { deviceId = 'dev-a', sessionCount = 120 } = {}) {
  return {
    deviceId,
    // "Now", or `isPeriodExpired` clears today/month (the record's day no longer
    // matches the clock) and the session archive under test never arrives.
    updatedAt: new Date().toISOString(),
    allTime: period(totalTokens, sessionCount, deviceId),
    month: period(totalTokens, sessionCount, deviceId),
    today: period(totalTokens, sessionCount, deviceId)
  };
}

// A frame is only complete once its terminating blank line has arrived; a large
// payload is delivered in several chunks, so matching the event name alone would
// hand back a truncated JSON body.
function frameComplete(marker) {
  return (text) => text.includes(marker) && text.endsWith('\n\n');
}

async function readFrames(reader, predicate, timeoutMs = 2000) {
  const decoder = new TextDecoder();
  let text = '';
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await Promise.race([
      reader.read(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('sse_timeout')), Math.max(1, deadline - Date.now())))
    ]);
    if (result.done) throw new Error('sse_closed');
    text += decoder.decode(result.value, { stream: true });
    if (predicate(text)) return text;
  }
  throw new Error('sse_timeout');
}

function frames(text) {
  return text
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const eventLine = block.split('\n').find((line) => line.startsWith('event: '));
      const dataLine = block.split('\n').find((line) => line.startsWith('data: '));
      return {
        event: eventLine ? eventLine.slice('event: '.length) : null,
        data: dataLine ? JSON.parse(dataLine.slice('data: '.length)) : null
      };
    });
}

test('the SSE snapshot frame is the first-paint shape when detail=slim is requested', async () => {
  const { hub } = createMemoryHub({ sseHeartbeatMs: 5000 });
  await hub.start();
  const controller = new AbortController();
  try {
    const { port } = hub.server.address();
    for (const deviceId of ['dev-a', 'dev-b']) {
      await hub.ingest(payload(5000, { deviceId }));
    }

    const response = await fetch(`http://127.0.0.1:${port}/api/stats/stream?detail=slim`, {
      headers: { accept: 'text/event-stream' },
      signal: controller.signal
    });
    const text = await readFrames(response.body.getReader(), frameComplete('event: snapshot'));
    const [snapshot] = frames(text);

    assert.equal(snapshot.event, 'snapshot');
    const stats = snapshot.data.stats;
    assert.ok(stats.periods.allTime.totalTokens > 0);
    assert.ok(stats.devices.length === 2);
    // Detail is dropped: that is the whole point of the slim frame.
    assert.equal(stats.periods.allTime.sessions, undefined);
    assert.equal(stats.devices[0].periods.allTime.sessions, undefined);
    assert.equal(stats.devices[0].periods.allTime.projects, undefined);
    assert.equal(stats.devices[0].periods.allTime.clientModels, undefined);
    // ...but the invalidation tokens needed to re-fetch what is missing survive.
    assert.equal(typeof stats.historyRevision, 'string');
    assert.equal(typeof stats.deviceHistoryRevision, 'string');
    assert.equal(typeof stats.subscriptionsUpdatedAt, 'string');
  } finally {
    controller.abort();
    await hub.stop();
  }
});

test('the default stream keeps the full document the shared renderer reads', async () => {
  const { hub } = createMemoryHub({ sseHeartbeatMs: 5000 });
  await hub.start();
  const controller = new AbortController();
  try {
    const { port } = hub.server.address();
    await hub.ingest(payload(5000, { deviceId: 'dev-a' }));

    const response = await fetch(`http://127.0.0.1:${port}/api/stats/stream`, {
      headers: { accept: 'text/event-stream' },
      signal: controller.signal
    });
    const text = await readFrames(response.body.getReader(), frameComplete('event: snapshot'));
    const stats = frames(text)[0].data.stats;

    // A client that does not opt in is untouched: the shared UI renders the
    // session archive and per-device detail straight off the stream.
    assert.ok(Object.keys(stats.periods.today.sessions).length > 0);
    assert.ok(Object.keys(stats.devices[0].periods.today.sessions).length > 0);
    assert.ok(Object.keys(stats.devices[0].periods.today.clientModels).length > 0);
  } finally {
    controller.abort();
    await hub.stop();
  }
});

test('a slim subscriber frame is much smaller than the full snapshot', async () => {
  const { hub } = createMemoryHub({ sseHeartbeatMs: 5000 });
  await hub.start();
  const controller = new AbortController();
  try {
    const { port } = hub.server.address();
    await hub.ingest(payload(5000, { deviceId: 'dev-a' }));

    const response = await fetch(`http://127.0.0.1:${port}/api/stats/stream?detail=slim`, {
      headers: { accept: 'text/event-stream' },
      signal: controller.signal
    });
    const reader = response.body.getReader();
    await readFrames(reader, frameComplete('event: snapshot'));

    // A second device's ingest broadcasts a frame to every subscriber.
    await hub.ingest(payload(7000, { deviceId: 'dev-b' }));
    const text = await readFrames(reader, frameComplete('"reason":"ingest"'));
    const broadcast = frames(text).find((frame) => frame.data?.reason === 'ingest');
    assert.ok(broadcast, 'expected an ingest frame');

    const frameBytes = Buffer.byteLength(JSON.stringify(broadcast.data.stats));
    const fullBytes = Buffer.byteLength(JSON.stringify(await hub.getStats()));
    assert.ok(frameBytes < fullBytes, `${frameBytes} !< ${fullBytes}`);
    assert.equal(broadcast.data.stats.periods.allTime.sessions, undefined);
  } finally {
    controller.abort();
    await hub.stop();
  }
});
