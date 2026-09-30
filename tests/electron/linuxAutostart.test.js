'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  autostartSupported,
  desktopFilePath,
  desktopFileContents,
  isAutostartEnabled,
  setAutostartEnabled,
  STARTED_AT_LOGIN_ARG
} = require('../../src/electron/linuxAutostart');

function tmpConfigHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'jiran-autostart-'));
}

test('autostartSupported accepts AppImage and native-package executable paths on Linux', () => {
  assert.equal(autostartSupported({ platform: 'linux', env: { APPIMAGE: '/opt/Jiran.AppImage' } }), true);
  assert.equal(autostartSupported({ platform: 'linux', env: {}, appPath: '/opt/Jiran/jiran' }), true);
  assert.equal(autostartSupported({ platform: 'linux', env: {} }), false);
  assert.equal(autostartSupported({ platform: 'linux', env: { APPIMAGE: '' } }), false);
  assert.equal(autostartSupported({ platform: 'darwin', env: { APPIMAGE: '/x.AppImage' } }), false);
  assert.equal(autostartSupported({ platform: 'win32', env: { APPIMAGE: '/x.AppImage' } }), false);
});

test('desktopFilePath honors XDG_CONFIG_HOME and falls back to ~/.config', () => {
  assert.equal(
    desktopFilePath({ env: { XDG_CONFIG_HOME: '/custom/config' } }),
    '/custom/config/autostart/jiran.desktop'
  );
  assert.equal(
    desktopFilePath({ env: { HOME: '/home/frank' } }),
    '/home/frank/.config/autostart/jiran.desktop'
  );
});

test('desktopFileContents produces a desktop entry pointing at the executable', () => {
  const contents = desktopFileContents('/opt/apps/Jiran.AppImage');
  assert.match(contents, /^\[Desktop Entry\]\n/);
  assert.match(contents, /\nType=Application\n/);
  assert.match(contents, /\nName=Jiran\n/);
  assert.match(contents, /\nExec="\/opt\/apps\/Jiran\.AppImage"\n/);
  assert.match(contents, /\nX-GNOME-Autostart-enabled=true\n/);
  assert.ok(contents.endsWith('\n'));
});

test('desktopFileContents escapes reserved characters inside the quoted Exec argument', () => {
  const contents = desktopFileContents('/home/a"b/$HOME/`x`/App\\Image.AppImage');
  const execLine = contents.split('\n').find((line) => line.startsWith('Exec='));
  assert.equal(execLine, 'Exec="/home/a\\\\"b/\\\\$HOME/\\\\`x\\\\`/App\\\\\\\\Image.AppImage"');
});

test('desktopFileContents escapes literal percent signs in Exec arguments', () => {
  const contents = desktopFileContents('/opt/apps/Jiran 100%.AppImage');
  const execLine = contents.split('\n').find((line) => line.startsWith('Exec='));
  assert.equal(execLine, 'Exec="/opt/apps/Jiran 100%%.AppImage"');
});

test('setAutostartEnabled(true) writes the desktop file, creating the autostart dir', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/opt/Jiran.AppImage' };
  assert.equal(isAutostartEnabled({ env }), false);
  assert.equal(setAutostartEnabled(true, { env }), true);
  assert.equal(isAutostartEnabled({ env }), true);
  const written = fs.readFileSync(path.join(configHome, 'autostart', 'jiran.desktop'), 'utf8');
  assert.match(written, /Exec="\/opt\/Jiran\.AppImage"/);
});

test('setAutostartEnabled(true) writes a native .deb executable path without APPIMAGE', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome };
  const appPath = '/opt/Jiran/jiran';
  assert.equal(isAutostartEnabled({ env, appPath }), false);
  assert.equal(setAutostartEnabled(true, { env, appPath }), true);
  assert.equal(isAutostartEnabled({ env, appPath }), true);
  const written = fs.readFileSync(path.join(configHome, 'autostart', 'jiran.desktop'), 'utf8');
  assert.match(written, /Exec="\/opt\/Jiran\/jiran"/);
});

test('isAutostartEnabled still reads an entry written with the retired login marker', () => {
  // Startup no longer has a separate hidden-in-tray marker. An install that
  // opted in once still has the retired marker in its autostart file, and that
  // must keep reading as "start at login: on" rather than flipping off under
  // the user after an update.
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/opt/Jiran.AppImage' };
  fs.mkdirSync(path.join(configHome, 'autostart'), { recursive: true });
  fs.writeFileSync(
    path.join(configHome, 'autostart', 'jiran.desktop'),
    `Exec="/opt/Jiran.AppImage" ${STARTED_AT_LOGIN_ARG}\n`
  );
  assert.equal(isAutostartEnabled({ env }), true);
});

test('setAutostartEnabled(true) rewrites a marked entry without the retired marker', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/opt/Jiran.AppImage' };
  fs.mkdirSync(path.join(configHome, 'autostart'), { recursive: true });
  fs.writeFileSync(
    path.join(configHome, 'autostart', 'jiran.desktop'),
    `Exec="/opt/Jiran.AppImage" ${STARTED_AT_LOGIN_ARG}\n`
  );
  assert.equal(setAutostartEnabled(true, { env }), true);
  const written = fs.readFileSync(path.join(configHome, 'autostart', 'jiran.desktop'), 'utf8');
  assert.ok(!written.includes(STARTED_AT_LOGIN_ARG), 'the retired marker must not be rewritten');
});

test('isAutostartEnabled requires the desktop file to target the current AppImage', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/opt/Jiran.AppImage' };
  const staleEnv = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/old/Jiran.AppImage' };
  setAutostartEnabled(true, { env: staleEnv });
  assert.equal(isAutostartEnabled({ env }), false);
  assert.equal(setAutostartEnabled(true, { env }), true);
  assert.equal(isAutostartEnabled({ env }), true);
});

test('isAutostartEnabled detects a stale native-package executable path', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome };
  setAutostartEnabled(true, { env, appPath: '/opt/Jiran/jiran' });
  assert.equal(isAutostartEnabled({ env, appPath: '/opt/Jiran/old-jiran' }), false);
  assert.equal(setAutostartEnabled(true, { env, appPath: '/opt/Jiran/old-jiran' }), true);
});

test('setAutostartEnabled(false) removes the desktop file and is idempotent', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome, APPIMAGE: '/opt/Jiran.AppImage' };
  setAutostartEnabled(true, { env });
  assert.equal(setAutostartEnabled(false, { env }), false);
  assert.equal(isAutostartEnabled({ env }), false);
  assert.equal(setAutostartEnabled(false, { env }), false); // no file present — must not throw
});

test('setAutostartEnabled(true) without an executable path reports failure', () => {
  const configHome = tmpConfigHome();
  const env = { XDG_CONFIG_HOME: configHome };
  assert.equal(setAutostartEnabled(true, { env }), false);
  assert.equal(isAutostartEnabled({ env }), false);
});
