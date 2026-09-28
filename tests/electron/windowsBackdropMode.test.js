'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  WINDOWS_BACKDROP_ACRYLIC,
  WINDOWS_BACKDROP_MICA,
  WINDOWS_SURFACE_NONE,
  WINDOWS_SURFACE_MICA,
  WINDOWS_SURFACE_ACRYLIC,
  WINDOWS_SURFACE_WIN10_FALLBACK,
  normalizeWindowsBackdropMode,
  windowsElectronBackgroundMaterial,
  normalizeWindowsSurface,
  windowsSurfaceProfile
} = require('../../src/electron/windowsBackdropMode');

test('normalizeWindowsBackdropMode normalizes correctly', () => {
  assert.equal(normalizeWindowsBackdropMode('mica'), WINDOWS_BACKDROP_MICA);
  assert.equal(normalizeWindowsBackdropMode('acrylic'), WINDOWS_BACKDROP_ACRYLIC);
  assert.equal(normalizeWindowsBackdropMode('unknown'), WINDOWS_BACKDROP_ACRYLIC);
});

test('windowsElectronBackgroundMaterial maps backdrop mode to Electron material', () => {
  assert.equal(windowsElectronBackgroundMaterial('mica'), 'mica');
  assert.equal(windowsElectronBackgroundMaterial('acrylic'), 'acrylic');
});

test('normalizeWindowsSurface recognizes mica, acrylic, fallback, and none', () => {
  assert.equal(normalizeWindowsSurface('mica'), WINDOWS_SURFACE_MICA);
  assert.equal(normalizeWindowsSurface('acrylic'), WINDOWS_SURFACE_ACRYLIC);
  assert.equal(normalizeWindowsSurface('win10-fallback'), WINDOWS_SURFACE_WIN10_FALLBACK);
  assert.equal(normalizeWindowsSurface('unknown'), WINDOWS_SURFACE_NONE);
});

test('windowsSurfaceProfile distinguishes mica and acrylic kinds on supported Windows', () => {
  const micaProfile = windowsSurfaceProfile({
    platform: 'win32',
    osRelease: '10.0.22621',
    systemGlass: true,
    backdropMode: 'mica'
  });
  assert.equal(micaProfile.kind, WINDOWS_SURFACE_MICA);
  assert.equal(micaProfile.nativeBackdrop, true);
  assert.equal(micaProfile.nativeMaterial, 'mica');

  const acrylicProfile = windowsSurfaceProfile({
    platform: 'win32',
    osRelease: '10.0.22621',
    systemGlass: true,
    backdropMode: 'acrylic'
  });
  assert.equal(acrylicProfile.kind, WINDOWS_SURFACE_ACRYLIC);
  assert.equal(acrylicProfile.nativeBackdrop, true);
  assert.equal(acrylicProfile.nativeMaterial, 'acrylic');
});

test('windowsSurfaceProfile turns off on non-Windows or disabled glass', () => {
  const nonWin = windowsSurfaceProfile({
    platform: 'linux',
    osRelease: '6.5.0',
    systemGlass: true,
    backdropMode: 'mica'
  });
  assert.equal(nonWin.kind, WINDOWS_SURFACE_NONE);
  assert.equal(nonWin.nativeBackdrop, false);

  const disabled = windowsSurfaceProfile({
    platform: 'win32',
    osRelease: '10.0.22621',
    systemGlass: false,
    backdropMode: 'mica'
  });
  assert.equal(disabled.kind, WINDOWS_SURFACE_NONE);
  assert.equal(disabled.nativeBackdrop, false);
});
