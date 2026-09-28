// Device data transfer panel.
//
// Move one device's entire recorded history onto another existing device.
// The Hub rewrites every ledger row to the target, additively merges its
// periods and sessions, and then removes the source device — the warning the
// UI shows is the contract the endpoint implements. Every mutation happens
// inside one Hub transaction.
//
// Hub-web only. The transfer endpoint (`POST /api/devices/:id/transfer`) is a
// Hub admin mutation and the desktop client has no code path that requests it,
// so this panel renders only inside the web settings page's Advanced group.
// There is no standalone view, no `/transfer` route and no navigation entry.

import { request, confirmAction } from '../transport/index.js';
import { tr, escapeHtml, appState, viewHelper, showToast, rerender } from '../core/viewContext.js';
import { deviceRows } from '../core/data.js';

const viewStats = (...args) => viewHelper('viewStats')(...args);

// Fluent Dropdown binds its listbox through the default slot's slotchange
// handler. Without a `fluent-listbox` wrapper `dropdown.listbox` stays
// undefined, so the trigger neither opens nor shows a value — every option
// must be inside a listbox, not placed on the dropdown directly.
function deviceOptions(rows, selectedId) {
  return `<fluent-listbox>${rows.map((row) => `<fluent-option value="${escapeHtml(row.key)}"${row.key === selectedId ? ' selected' : ''}>${escapeHtml(row.name)}</fluent-option>`).join('')}</fluent-listbox>`;
}

/** The transfer form as it appears in the web settings page's Advanced group. */
export function renderTransferPanel() {
  const rows = deviceRows(viewStats(), 'allTime');
  const owner = appState().authorization?.authenticated === true;
  if (!rows.length) return `<p class="muted tiny">${escapeHtml(tr('transfer.noDevices'))}</p>`;
  // A stats tick re-renders this form; the chosen pair survives in app state so
  // an update cannot snap both pickers back to the defaults while the user is
  // halfway through a transfer. Selections for vanished devices fall through.
  const saved = appState().transferSelection || {};
  const isLive = (deviceId) => rows.some((row) => row.key === deviceId);
  const selectedDeviceId = appState().prefs.selectedDeviceId;
  const sourceId = isLive(saved.source) ? saved.source
    : (isLive(selectedDeviceId) ? selectedDeviceId : rows[0].key);
  // Default the target to a different device; the form still validates on
  // submit, and the change handler below keeps the pair apart as the source moves.
  const targetId = (isLive(saved.target) && saved.target !== sourceId) ? saved.target
    : (rows.find((row) => row.key !== sourceId)?.key || sourceId);
  return `
    <p class="muted tiny">${escapeHtml(tr('transfer.description'))}</p>
    <div class="notice warn" role="status">${escapeHtml(tr('transfer.notice'))}</div>
    <form class="transfer-form" data-transfer-form data-draft-key="transfer-device">
      <div class="form-grid">
        <label class="field"><span>${tr('transfer.source')}</span>
          <fluent-dropdown name="sourceDevice">${deviceOptions(rows, sourceId)}</fluent-dropdown>
        </label>
        <label class="field"><span>${tr('transfer.target')}</span>
          <fluent-dropdown name="targetDevice">${deviceOptions(rows, targetId)}</fluent-dropdown>
        </label>
      </div>
      <p class="muted tiny">${escapeHtml(tr('transfer.targetHint'))}</p>
      <div class="drawer-actions settings-actions">
         <fluent-button appearance="primary" type="submit" class="primary-btn"${owner ? '' : ' disabled'}>${escapeHtml(tr('transfer.submit'))}</fluent-button>
      </div>
       ${owner ? '' : `<p class="muted tiny">${escapeHtml(tr('transfer.needsAdmin'))}</p>`}
    </form>`;
}

/** Submit the transfer. Returns an error message or ''. */
export async function submitTransfer(form) {
  const source = String(form.querySelector('[name="sourceDevice"]')?.value || '').trim();
  const target = String(form.querySelector('[name="targetDevice"]')?.value || '').trim();
  if (!source || !target) return tr('transfer.missingFields');
  if (source === target) return tr('transfer.sameDevice');
  // The confirm dialog is the only gate: the Hub moves every recorded row to
  // the target and deletes the source device in one transaction.
  const confirmed = await confirmAction(tr('transfer.confirm', { source, target }), { danger: true });
  if (!confirmed) return '';
  try {
    await request(`/api/devices/${encodeURIComponent(source)}/transfer`, {
      // The Hub-web host authenticates per request: without the live session
      // secret this POST goes out anonymous and the owner's own key reads back
      // as "needs an admin credential". Desktop ignores the value (the main
      // process owns the secret) and never renders this panel anyway.
      secret: appState().secret,
      method: 'POST',
      body: { targetDeviceId: target }
    });
    showToast(tr('transfer.done'));
    rerender();
    return '';
  } catch (error) {
    const code = String(error?.code || error?.message || '');
    if (code.includes('target_not_found')) return tr('transfer.errorTargetMissing');
    if (code.includes('same_device')) return tr('transfer.sameDevice');
    if (code.includes('unauthorized') || code.includes('forbidden')) return tr('transfer.needsAdmin');
    return error?.message || tr('error.generic');
  }
}
