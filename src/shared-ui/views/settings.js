// Management page: the single Administration destination.
//
// Three destinations that used to be separate views are consolidated here:
// 账号 (provider accounts), 消费 (subscriptions + pricing, supplied by app.js
// because those renderers share its ledger state) and the dashboard
// preferences. A web admin additionally gets 高级 (device data transfer).
//
// The settings-scaffolding classes (`settings-layout`, `settings-form`,
// `[data-settings-section]`) are what `settingsNavigation()` in core/fluent.js
// turns into the left-hand section rail, so every section is a top-level child
// of `.settings-layout` and the rail switches between them.
//
// The dispatched view id stays `settings`: it is the persisted-route and
// native-menu compatibility surface. Only its label became 管理.

import { isCapable } from '../transport/index.js';
import { tr, escapeHtml, appState, settingsOptionList } from '../core/viewContext.js';
import { clampHomeLimitAccountCount } from '../core/data.js';
import { renderDesktopSettings } from './settingsDesktop.js';
import { renderTransferPanel } from './transfer.js';
import { renderAccounts } from './accounts.js';

function section(id, title, body, { active = false } = {}) {
  return `<section class="panel settings-section" data-settings-section="${escapeHtml(id)}"${active ? ' data-settings-active' : ''}>
      <div class="panel-head"><h2 class="panel-title">${escapeHtml(title)}</h2></div>
      <div class="settings-section-body">${body}</div>
    </section>`;
}

function renderPreferences({ active = false } = {}) {
  const desktopHost = isCapable('desktopSettings');
  const settingsDescription = tr('settings.pageDescription');
  // The form is itself the rail item (`.settings-form`); wrapping it in another
  // section would register two entries for one block.
  return `<form class="panel settings-form" data-web-settings-form data-draft-key="preferences" data-settings-section="preferences"${active ? ' data-settings-active' : ''}>
        <div class="panel-head"><h2 class="panel-title">${escapeHtml(tr('management.section.preferences'))}</h2><span class="panel-meta tiny">${escapeHtml(settingsDescription)}</span></div>
        <div class="form-grid">
          <label class="field"><span>${tr('settings.language')}</span><fluent-dropdown name="language">${settingsOptionList([['auto', 'Auto'], ['en', 'English'], ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['ja', '日本語'], ['ko', '한국어']], appState().prefs.language || 'auto')}</fluent-dropdown></label>
          <label class="field"><span>${tr('settings.theme')}</span><fluent-dropdown name="theme">${settingsOptionList([['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], appState().prefs.theme || 'system')}</fluent-dropdown></label>
          ${desktopHost ? '' : `<label class="field"><span>${tr('desktop.settings.reduceMotion')}</span><fluent-dropdown name="reduceMotion">${settingsOptionList([['system', tr('desktop.settings.motionSystem')], ['on', tr('desktop.settings.motionOn')], ['off', tr('desktop.settings.motionOff')]], appState().prefs.reduceMotion || 'system')}</fluent-dropdown></label>`}
          <label class="field"><span>${tr('settings.currency')}</span><fluent-dropdown name="currency">${settingsOptionList([['USD', 'USD'], ['CNY', 'CNY'], ['TWD', 'TWD'], ['HKD', 'HKD']], appState().prefs.currency || 'USD')}</fluent-dropdown></label>
          ${desktopHost ? '' : `<label class="field"><span>${tr('settings.homeLimitAccountCount')}</span><input name="homeLimitAccountCount" type="number" min="1" max="12" step="1" value="${clampHomeLimitAccountCount(appState().prefs.homeLimitAccountCount, 3)}" /></label>`}
          ${desktopHost ? '' : `<fluent-text-input class="field field-wide" name="secret" type="password" autocomplete="off" spellcheck="false" value="${escapeHtml(appState().secret || '')}">${tr('settings.secret')}</fluent-text-input>`}
        </div>
        <p class="muted tiny settings-form-hint">${escapeHtml(desktopHost ? tr('settings.desktopLocalHint') : tr('settings.authHint'))}</p>
        <div class="drawer-actions settings-actions"><fluent-button appearance="primary" type="submit" class="primary-btn" data-settings-submit disabled>${escapeHtml(tr('settings.savePage'))}</fluent-button>${desktopHost ? '' : `<fluent-button appearance="transparent" type="button" class="ghost-btn" data-web-signout>${escapeHtml(tr('settings.signOut'))}</fluent-button>`}</div>
      </form>`;
}

/**
 * @param {object} [sections]
 * @param {string} [sections.consumption]  The 消费 section body, rendered by app.js
 *        because its subscriptions/pricing renderers share app state.
 */
export function renderSettingsPage({ consumption = '' } = {}) {
  const desktopHost = isCapable('desktopSettings');
  const owner = appState().authorization?.authenticated === true;
  const capabilities = appState().authorization?.capabilities || {};
  const pageLabel = tr('settings.pageTitle');
  const pageDescription = tr('page.settings.description');
  const accountsVisible = capabilities.hubAccounts !== false;
  const consumptionVisible = capabilities.subscriptions !== false
    || (capabilities.pricing !== false && owner);
  const currentSection = appState().prefs.managementSection || 'accounts';
  // The active marker is a web-host routing concern. On desktop the rail also
  // owns the device groups (显示/行为/连接) that have no route, so it keeps
  // remembering the last clicked section instead.
  const active = (id) => (!desktopHost && currentSection === id ? { active: true } : {});
  return `<section class="page-intro settings-page-intro"><div><div class="eyebrow">${escapeHtml(tr('settings.appTitle'))}</div><h2>${escapeHtml(pageLabel)}</h2><p>${escapeHtml(pageDescription)}</p></div></section>
    <div class="settings-layout">
      ${accountsVisible ? section('accounts', tr('management.section.accounts'), renderAccounts(), active('accounts')) : ''}
      ${consumptionVisible && consumption ? section('consumption', tr('management.section.consumption'), consumption, active('consumption')) : ''}
      ${renderPreferences({ active: active('preferences').active === true })}
      ${desktopHost
        ? `<div class="settings-desktop-stack" data-desktop-settings data-draft-key="desktop-settings">${renderDesktopSettings(appState().desktopSettings || {}, appState().desktopInfo || {})}</div>`
        : ''}
      ${!desktopHost && owner
        ? section('advanced', tr('management.section.advanced'), renderTransferPanel(), { active: currentSection === 'advanced' })
        : ''}
    </div>`;
}
