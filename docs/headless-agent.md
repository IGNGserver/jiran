# Token Monitor Headless Agent

The headless agent collects the same local usage snapshot as the Electron
desktop app's **Connect to a hub** mode and sends the same normalized payload to the
same Docker Compose Hub. It has no window, tray, renderer, or local quota
account probing.

## Install

Use Node.js 22.13.0 or newer on the machine that owns the tool data. Extract
the `Token-Monitor-Headless-<version>.tar.gz` release asset, then install only
production dependencies:

```bash
tar -xzf Token-Monitor-Headless-<version>.tar.gz
cd token-monitor-headless-<version>
npm ci --omit=dev
cp .env.example .env
```

`npm ci --omit=dev` is intentional: Electron is a development dependency and
is not installed for the headless runtime. The target platform's tokscale
package is installed by npm on that machine.

Set at least these values in `.env`:

```env
TOKEN_MONITOR_HUB_URL=https://hub.example.com
TOKEN_MONITOR_SECRET=YOUR_HUB_SECRET
TOKEN_MONITOR_DEVICE_ID=server-agent
```

For a trusted LAN/VPN without HTTPS, also set
`TOKEN_MONITOR_ALLOW_INSECURE_HTTP=1`. The device ID should be unique per
installation. If it changes later, the agent attempts the same Hub-side
baseline migration as the desktop app before posting the next snapshot.

## Run and verify

Run one collection and upload first:

```bash
npm run agent:once
```

Then keep the collector running:

```bash
npm run agent
```

The agent and the desktop app share the collector, summary transformation, payload
serialization, upload queue, retry/backoff, request timeout, device identity,
and history/archive rules. The only intentional difference is presentation:
the desktop app may display local status and Hub updates; the agent logs status and
posts snapshots without a GUI.

## Collection is fixed

There is no collection surface to configure. Every supported tool is tracked, and
the file watchers, usage history, deleted-session archive, Projects and the WSL
scan always run — the same behaviour the desktop app has. The agent takes only
its connection inputs (`--hub`, `--secret`, `--device`), `--timeoutMs` for the
tokscale budget, and `--once` / `--dry-run`.

`--clients`, `--collectionMode`, `--interval`, `--watch`, `--watchDebounceMs`,
`--history`, `--projects`, `--sessionArchive`, `--wslScan`, `--since`,
`--syncUploadInterval` and their `TOKEN_MONITOR_*` environment equivalents are
gone: the agent warns and ignores them so an existing systemd/launchd/cron unit
keeps running through the upgrade instead of failing on an unknown flag.

The Hub owns AI Tool Limits accounts. Do not put provider quota credentials in
the headless environment; add those accounts to the Hub instead.
