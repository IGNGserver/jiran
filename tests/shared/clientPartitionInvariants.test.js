'use strict';

// Targeted watch ticks (`--client <changed client> --today`) key the scan on a
// client id that is produced by two independent code paths: clientWatchCandidates()
// maps a changed file back to an id, and normalizeClientName() decides which id
// tokscale's rows land under. replaceTodayPartitions() clears the target's
// partition and fills it from whatever key the fresh rows normalize to, so the
// moment those two disagree a client's partition is zeroed on every watch tick
// and applyPeriodDelta() feeds the negative delta into month/allTime until the
// next full scan. These are cheap invariants; the failure they prevent is
// silently wrong token counts.

const assert = require('node:assert/strict');
const test = require('node:test');

const { TRACKED_CLIENTS } = require('../../src/shared/clientTracking');
const {
  clientWatchCandidates,
  tokscaleClientFilter,
  TOKSCALE_CLIENT_ALIASES
} = require('../../src/shared/collector');
const { normalizeClientName } = require('../../src/shared/usage');
const { MARKER_CLIENTS } = require('../../src/shared/wslUsage');
const { usageConfigFromSource } = require('../../src/shared/collectorConfig');

const trackedClients = TRACKED_CLIENTS.split(',').map((value) => value.trim()).filter(Boolean);

test('every tracked client id is a fixed point of normalizeClientName', () => {
  for (const client of trackedClients) {
    assert.equal(
      normalizeClientName(client),
      client,
      `${client} normalizes to "${normalizeClientName(client)}", so a targeted scan would clear the "${client}" partition and write a different key`
    );
  }
});

test('every watch-mapped client id is a tracked client id', () => {
  // A watch root that maps to an id outside the tracked set produces a target
  // canTargetTodayPartitions() can never satisfy, silently degrading every
  // watch tick to a full scan (or worse, targeting a partition nothing fills).
  const watched = Object.keys(clientWatchCandidates(TRACKED_CLIENTS));
  assert.ok(watched.length > 0, 'expected the tracked list to produce watch candidates');
  for (const client of watched) {
    assert.ok(
      trackedClients.includes(client),
      `clientWatchCandidates() emitted "${client}", which is not in TRACKED_CLIENTS`
    );
  }
});

test('every tokscale alias normalizes back to the client that owns it', () => {
  for (const [client, aliases] of Object.entries(TOKSCALE_CLIENT_ALIASES)) {
    assert.ok(trackedClients.includes(client), `alias owner "${client}" is not a tracked client`);
    for (const alias of aliases) {
      assert.equal(
        normalizeClientName(alias),
        client,
        `alias "${alias}" normalizes to "${normalizeClientName(alias)}" instead of "${client}", so its rows would land in a partition the targeted scan never clears`
      );
    }
  }
});

test('tokscaleClientFilter expands a targeted client to all of its aliases', () => {
  for (const [client, aliases] of Object.entries(TOKSCALE_CLIENT_ALIASES)) {
    const filter = tokscaleClientFilter(client).split(',');
    assert.ok(filter.includes(client), `targeting "${client}" dropped the client itself`);
    for (const alias of aliases) {
      assert.ok(
        filter.includes(alias),
        `targeting "${client}" alone would skip its "${alias}" data, under-counting the client on every watch tick`
      );
    }
  }
});

test('tokscaleClientFilter keeps Reasonix in the current Tokscale subprocess', () => {
  assert.equal(tokscaleClientFilter('reasonix'), 'reasonix');
  assert.equal(tokscaleClientFilter('reasonix,claude'), 'reasonix,claude');
});

test('tokscaleClientFilter never emits the synthetic pseudo-client', () => {
  // tokscale treats a client list containing `synthetic` as "enable every
  // client" (include_synthetic in scanner.rs), which re-enables all scan roots
  // and turns a targeted scan back into a full one with no visible symptom
  // beyond the CPU the targeting was supposed to save.
  const full = tokscaleClientFilter(TRACKED_CLIENTS).split(',');
  assert.ok(!full.includes('synthetic'), 'the full client filter leaked the synthetic pseudo-client');
  for (const client of trackedClients) {
    assert.ok(
      !tokscaleClientFilter(client).split(',').includes('synthetic'),
      `targeting "${client}" leaked the synthetic pseudo-client into the tokscale filter`
    );
  }
});

// ---------------------------------------------------------------------------
// Coverage guards. TRACKED_CLIENTS is now the complete wired set and every
// runtime collects it, so a client that no sub-pipeline can reach is silent
// under-counting rather than a visible "not tracked" state. These are the
// reverse of the checks above: they ask whether each tracked id is reachable.
// ---------------------------------------------------------------------------

// Self-synced clients are deliberately not watched: their tokscale cache is
// written by our own `maybeSync*` calls, so watching it re-triggers forever
// (AGENTS.md). Their usage still lands on every full tick, which is why they are
// an allowlist here rather than a hole.
const WATCH_EXEMPT = ['cursor', 'antigravity', 'trae', 'warp'];

test('every tracked client has a watch candidate unless it is a known self-synced id', () => {
  const watched = new Set(Object.keys(clientWatchCandidates(TRACKED_CLIENTS)));
  const unreachable = trackedClients.filter((client) => !watched.has(client) && !WATCH_EXEMPT.includes(client));
  assert.deepEqual(
    unreachable,
    [],
    `tracked clients with no watch root (a changed session file cannot trigger their refresh): ${unreachable.join(', ')}`
  );
});

// WSL attribution is marker-based: a distro home that matches no marker is never
// scanned at all, so a tracked tool whose Linux data root is missing here reads as
// `missing` with zero tokens for the whole of Windows.
const WSL_UNREACHABLE = {
  'claude-desktop': 'a desktop app; its data root is Windows/macOS Application Support',
  'devin-desktop': 'macOS Application Support only (documented in wslUsage.js)',
  reasonix: 'tokscale PathRoot::ReasonixHome conflicts with the Linux .reasonix/stats path',
  // One directory holds both Codebuff and Freebuff chats, so the marker fires for
  // the home and tokscale splits the rows by root agent id. Only the *status*
  // attribution collapses onto codebuff.
  freebuff: 'shares .config/manicode/projects with codebuff (scanned, status attributed there)'
};

test('every tracked client is reachable from a WSL home or carries a written reason', () => {
  const markerIds = new Set(Object.values(MARKER_CLIENTS));
  const missing = trackedClients.filter((client) => !markerIds.has(client));
  for (const client of missing) {
    assert.ok(
      WSL_UNREACHABLE[client],
      `"${client}" has no WSL_DATA_MARKERS root and no documented reason — a WSL-only install of it would be collected as zero`
    );
  }
  // A documented reason that has since become reachable is a stale comment.
  for (const client of Object.keys(WSL_UNREACHABLE)) {
    assert.ok(
      missing.includes(client) || WATCH_EXEMPT.includes(client),
      `"${client}" is listed as WSL-unreachable but now has a marker — drop the exemption`
    );
  }
});

test('the self-synced client caches are all marker-covered in WSL', () => {
  // The four self-synced tools keep their sessions under the same
  // `.config/tokscale/<client>-cache` derivation, so a distro holding only one of
  // them is invisible unless every id appears here. cursor/antigravity were
  // missing while trae/warp were present, which is how the rule drifted.
  for (const client of WATCH_EXEMPT) {
    assert.ok(
      Object.keys(MARKER_CLIENTS).some((marker) => marker === `.config/tokscale/${client}-cache`),
      `${client} has no WSL cache marker, so a ${client}-only distro home is never scanned`
    );
    assert.equal(MARKER_CLIENTS[`.config/tokscale/${client}-cache`], client);
  }
});

test('no runtime can narrow the tracked set', () => {
  // The client-selection surface is gone; the config layer that replaced it must
  // ignore a subset arriving from any direction.
  assert.equal(usageConfigFromSource({ clients: 'claude' }).clients, TRACKED_CLIENTS);
  assert.equal(usageConfigFromSource({ collectionMode: 'interval', projectsEnabled: false }).clients, TRACKED_CLIENTS);
  const electronMain = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', '..', 'src', 'electron', 'main.js'), 'utf8'
  );
  // The only `clients` the desktop path passes is the fixed list itself.
  assert.match(electronMain, /const clients = TRACKED_CLIENTS;/);
  assert.doesNotMatch(electronMain, /clients:\s*settings\./, 'the desktop app must not feed a settings value into the client list');
});
