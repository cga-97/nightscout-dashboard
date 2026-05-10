import { StorageConfig, ThresholdConfig, setConfig, saveThresholds, clearConfig } from '../../infrastructure/storage/LocalStorageConfig';

export interface SettingsModalResult {
  saved: boolean;
  reset: boolean;
}

export class SettingsModal {
  private readonly onClose: (result: SettingsModalResult) => void;
  private config: StorageConfig;
  private thresholds: ThresholdConfig;
  private overlay: HTMLElement | null = null;
  private previousFocus: HTMLElement | null = null;

  constructor(
    config: StorageConfig,
    thresholds: ThresholdConfig,
    onClose: (result: SettingsModalResult) => void
  ) {
    this.config = config;
    this.thresholds = thresholds;
    this.onClose = onClose;
  }

  open(): void {
    if (this.overlay) {
      return;
    }

    this.previousFocus = document.activeElement as HTMLElement;

    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close({ saved: false, reset: false });
      }
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('div');
    title.className = 'modal-title';
    title.id = 'modal-title';
    title.textContent = 'Settings';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => this.close({ saved: false, reset: false }));
    header.appendChild(closeBtn);

    modal.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave(form);
    });

    // Base URL
    form.appendChild(this.createFormGroup('Nightscout Base URL', 'ns-modal-base-url', 'url', this.config.baseUrl ?? '', 'https://your-nightscout.herokuapp.com', true));

    // API Secret
    form.appendChild(this.createFormGroup('API Secret (optional)', 'ns-modal-api-secret', 'password', this.config.apiSecret ?? '', 'Your API secret'));

    const secretHint = document.createElement('div');
    secretHint.className = 'form-hint form-hint-warning';
    secretHint.textContent = 'Your API secret is stored only for this browser session and will be cleared when you close the tab.';
    form.appendChild(secretHint);

    // Low Threshold
    form.appendChild(this.createFormGroup('Low Threshold (mg/dL)', 'ns-modal-low', 'number', String(this.thresholds.low), '70', true, '1'));

    // High Threshold
    form.appendChild(this.createFormGroup('High Threshold (mg/dL)', 'ns-modal-high', 'number', String(this.thresholds.high), '180', true, '1'));

    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message message-error hidden p-sm mb-md';
    errorMsg.id = 'ns-modal-error';
    form.appendChild(errorMsg);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn';
    saveBtn.textContent = 'Save Changes';
    form.appendChild(saveBtn);

    body.appendChild(form);
    modal.appendChild(body);

    // Footer with reset
    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-ghost';
    resetBtn.textContent = 'Reset All Data';
    resetBtn.addEventListener('click', () => this.handleReset());
    footer.appendChild(resetBtn);

    modal.appendChild(footer);

    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';

    // Focus trap: focus first input
    const firstInput = modal.querySelector<HTMLInputElement>('input');
    firstInput?.focus();
  }

  private createFormGroup(
    labelText: string,
    id: string,
    type: string,
    value: string,
    placeholder: string,
    required = false,
    step?: string
  ): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.setAttribute('for', id);
    group.appendChild(label);

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.className = 'form-input';
    input.placeholder = placeholder;
    input.value = value;
    if (required) input.required = true;
    if (step) input.step = step;
    if (type === 'number') input.min = '1';
    group.appendChild(input);

    return group;
  }

  private handleSave(form: HTMLFormElement): void {
    const baseUrl = (form.querySelector<HTMLInputElement>('#ns-modal-base-url')?.value ?? '').trim();
    const apiSecret = (form.querySelector<HTMLInputElement>('#ns-modal-api-secret')?.value ?? '').trim();
    const lowStr = (form.querySelector<HTMLInputElement>('#ns-modal-low')?.value ?? '').trim();
    const highStr = (form.querySelector<HTMLInputElement>('#ns-modal-high')?.value ?? '').trim();

    const errorEl = form.querySelector<HTMLElement>('#ns-modal-error');
    if (errorEl) errorEl.classList.add('hidden');

    if (!baseUrl) {
      if (errorEl) {
        errorEl.textContent = 'Nightscout URL is required.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const low = Number(lowStr);
    const high = Number(highStr);

    if (Number.isNaN(low) || Number.isNaN(high) || low <= 0 || high <= 0) {
      if (errorEl) {
        errorEl.textContent = 'Thresholds must be positive numbers.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (low >= high) {
      if (errorEl) {
        errorEl.textContent = 'Low threshold must be less than high threshold.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    setConfig({ baseUrl, apiSecret: apiSecret || undefined });
    saveThresholds({ low, high });

    this.close({ saved: true, reset: false });
  }

  private handleReset(): void {
    if (window.confirm('Are you sure? This will erase your Nightscout URL, API secret, and all preferences. This action cannot be undone.')) {
      clearConfig();
      localStorage.removeItem('ns_thresholds');
      localStorage.removeItem('nsd_viewMode');
      localStorage.removeItem('nsd_liveRange');
      localStorage.removeItem('nsd_analysisRange');
      this.close({ saved: false, reset: true });
    }
  }

  private close(result: SettingsModalResult): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.body.style.overflow = '';
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
    this.onClose(result);
  }
}
