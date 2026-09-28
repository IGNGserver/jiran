'use strict';

(function initWindowsBackdropMode(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TokenMonitorWindowsBackdropMode = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const WINDOWS_BACKDROP_ACRYLIC = 'acrylic';
  const WINDOWS_BACKDROP_MICA = 'mica';
  const WINDOWS_BACKDROP_TRANSPARENT = 'transparent';
  const WINDOWS_SURFACE_NONE = 'none';
  const WINDOWS_SURFACE_MICA = 'mica';
  const WINDOWS_SURFACE_ACRYLIC = 'acrylic';
  const WINDOWS_SURFACE_TRANSPARENT = 'transparent';
  const WINDOWS_SURFACE_WIN10_FALLBACK = 'win10-fallback';
  const WINDOWS_NATIVE_MIN_BUILD = 22621;


  function normalizeWindowsBackdropMode(value) {
    if (value === WINDOWS_BACKDROP_MICA) return WINDOWS_BACKDROP_MICA;
    if (value === WINDOWS_BACKDROP_TRANSPARENT) return WINDOWS_BACKDROP_TRANSPARENT;
    return WINDOWS_BACKDROP_ACRYLIC;
  }

  function windowsElectronBackgroundMaterial(mode) {
    const normalized = normalizeWindowsBackdropMode(mode);
    if (normalized === WINDOWS_BACKDROP_MICA) {
      // `tabbed` is Mica Alt, which applies the stronger tint intended for a
      // window with a tabbed title bar. The setting exposed here is the base
      // Mica material used by long-lived Windows surfaces such as Settings.
      return 'mica';
    }
    if (normalized === WINDOWS_BACKDROP_TRANSPARENT) {
      return 'none';
    }
    return WINDOWS_BACKDROP_ACRYLIC;
  }

  function normalizeWindowsSurface(value) {
    if (value === WINDOWS_SURFACE_MICA) return WINDOWS_SURFACE_MICA;
    if (value === WINDOWS_SURFACE_ACRYLIC) return WINDOWS_SURFACE_ACRYLIC;
    if (value === WINDOWS_SURFACE_TRANSPARENT) return WINDOWS_SURFACE_TRANSPARENT;
    if (value === WINDOWS_SURFACE_WIN10_FALLBACK) return WINDOWS_SURFACE_WIN10_FALLBACK;
    return WINDOWS_SURFACE_NONE;
  }

  function windowsBuildNumber(osRelease) {
    const build = Number(String(osRelease || '').split('.')[2] || 0);
    return Number.isFinite(build) ? build : 0;
  }

  function windowsNativeBackdropSupported({ platform = '', osRelease = '' } = {}) {
    return platform === 'win32' && windowsBuildNumber(osRelease) >= WINDOWS_NATIVE_MIN_BUILD;
  }

  // `backdropMode` is the operator's material choice; it only reaches the window on
  // the builds where Electron can apply a background material at all.
  function windowsSurfaceProfile({ platform = '', osRelease = '', systemGlass = true, backdropMode = WINDOWS_BACKDROP_MICA } = {}) {
    if (platform !== 'win32' || systemGlass === false) {
      return {
        kind: WINDOWS_SURFACE_NONE,
        nativeBackdrop: false,
        nativeMaterial: null,
        useLegacyAccent: false
      };
    }
    const normalizedMode = normalizeWindowsBackdropMode(backdropMode);
    if (normalizedMode === WINDOWS_BACKDROP_TRANSPARENT) {
      return {
        kind: WINDOWS_SURFACE_TRANSPARENT,
        nativeBackdrop: false,
        nativeMaterial: 'none',
        useLegacyAccent: false
      };
    }
    if (windowsNativeBackdropSupported({ platform, osRelease })) {
      return {
        kind: normalizedMode === WINDOWS_BACKDROP_MICA ? WINDOWS_SURFACE_MICA : WINDOWS_SURFACE_ACRYLIC,
        nativeBackdrop: true,
        nativeMaterial: windowsElectronBackgroundMaterial(normalizedMode),
        useLegacyAccent: false
      };
    }
    return {
      kind: WINDOWS_SURFACE_WIN10_FALLBACK,
      nativeBackdrop: false,
      nativeMaterial: null,
      useLegacyAccent: true
    };
  }

  return {
    WINDOWS_BACKDROP_ACRYLIC,
    WINDOWS_BACKDROP_MICA,
    WINDOWS_BACKDROP_TRANSPARENT,
    WINDOWS_SURFACE_NONE,
    WINDOWS_SURFACE_MICA,
    WINDOWS_SURFACE_ACRYLIC,
    WINDOWS_SURFACE_TRANSPARENT,
    WINDOWS_SURFACE_WIN10_FALLBACK,
    WINDOWS_NATIVE_MIN_BUILD,
    normalizeWindowsBackdropMode,
    windowsElectronBackgroundMaterial,
    normalizeWindowsSurface,
    windowsBuildNumber,
    windowsNativeBackdropSupported,
    windowsSurfaceProfile
  };
});
