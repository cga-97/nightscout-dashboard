import { setConfig, saveThresholds } from '../../infrastructure/storage/LocalStorageConfig';

export class ConfigForm {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = 'Nightscout Configuration';
    card.appendChild(title);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    const baseUrlGroup = document.createElement('div');
    baseUrlGroup.className = 'form-group';

    const baseUrlLabel = document.createElement('label');
    baseUrlLabel.textContent = 'Nightscout Base URL';
    baseUrlLabel.setAttribute('for', 'ns-base-url');
    baseUrlGroup.appendChild(baseUrlLabel);

    const baseUrlInput = document.createElement('input');
    baseUrlInput.type = 'url';
    baseUrlInput.id = 'ns-base-url';
    baseUrlInput.name = 'baseUrl';
    baseUrlInput.className = 'form-input';
    baseUrlInput.placeholder = 'https://my-site.herokuapp.com';
    baseUrlInput.required = true;
    baseUrlGroup.appendChild(baseUrlInput);

    const baseUrlHint = document.createElement('div');
    baseUrlHint.className = 'form-hint';
    baseUrlHint.textContent = 'Your Nightscout site URL, e.g. https://my-site.herokuapp.com';
    baseUrlGroup.appendChild(baseUrlHint);

    form.appendChild(baseUrlGroup);

    const secretGroup = document.createElement('div');
    secretGroup.className = 'form-group';

    const secretLabel = document.createElement('label');
    secretLabel.textContent = 'API Secret (optional)';
    secretLabel.setAttribute('for', 'ns-api-secret');
    secretGroup.appendChild(secretLabel);

    const secretInput = document.createElement('input');
    secretInput.type = 'password';
    secretInput.id = 'ns-api-secret';
    secretInput.name = 'apiSecret';
    secretInput.className = 'form-input';
    secretInput.placeholder = 'Your API secret';
    secretGroup.appendChild(secretInput);

    const secretHint = document.createElement('div');
    secretHint.className = 'form-hint';
    secretHint.style.color = 'var(--color-border)';
    secretHint.textContent = 'Your API secret is stored only for this browser session and will be cleared when you close the tab.';
    secretGroup.appendChild(secretHint);

    form.appendChild(secretGroup);

    const lowGroup = document.createElement('div');
    lowGroup.className = 'form-group';

    const lowLabel = document.createElement('label');
    lowLabel.textContent = 'Low Threshold (mg/dL)';
    lowLabel.setAttribute('for', 'ns-low-threshold');
    lowGroup.appendChild(lowLabel);

    const lowInput = document.createElement('input');
    lowInput.type = 'number';
    lowInput.id = 'ns-low-threshold';
    lowInput.name = 'lowThreshold';
    lowInput.className = 'form-input';
    lowInput.placeholder = '70';
    lowInput.min = '1';
    lowInput.step = '1';
    lowInput.required = true;
    lowGroup.appendChild(lowInput);

    form.appendChild(lowGroup);

    const highGroup = document.createElement('div');
    highGroup.className = 'form-group';

    const highLabel = document.createElement('label');
    highLabel.textContent = 'High Threshold (mg/dL)';
    highLabel.setAttribute('for', 'ns-high-threshold');
    highGroup.appendChild(highLabel);

    const highInput = document.createElement('input');
    highInput.type = 'number';
    highInput.id = 'ns-high-threshold';
    highInput.name = 'highThreshold';
    highInput.className = 'form-input';
    highInput.placeholder = '180';
    highInput.min = '1';
    highInput.step = '1';
    highInput.required = true;
    highGroup.appendChild(highInput);

    form.appendChild(highGroup);

    const errorMsg = document.createElement('div');
    errorMsg.className = 'message message-error';
    errorMsg.style.display = 'none';
    errorMsg.id = 'ns-config-error';
    form.appendChild(errorMsg);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn';
    submitBtn.textContent = 'Save';
    form.appendChild(submitBtn);

    card.appendChild(form);
    this.container.appendChild(card);
  }

  private handleSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const baseUrl = String(formData.get('baseUrl') ?? '').trim();
    const apiSecret = String(formData.get('apiSecret') ?? '').trim();
    const lowStr = String(formData.get('lowThreshold') ?? '').trim();
    const highStr = String(formData.get('highThreshold') ?? '').trim();

    const errorEl = form.querySelector<HTMLElement>('#ns-config-error');
    if (errorEl) errorEl.style.display = 'none';

    if (!baseUrl) {
      return;
    }

    const low = Number(lowStr);
    const high = Number(highStr);

    if (Number.isNaN(low) || Number.isNaN(high) || low <= 0 || high <= 0) {
      if (errorEl) {
        errorEl.textContent = 'Thresholds must be positive numbers.';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (low >= high) {
      if (errorEl) {
        errorEl.textContent = 'Low threshold must be less than high threshold.';
        errorEl.style.display = 'block';
      }
      return;
    }

    setConfig({
      baseUrl,
      apiSecret: apiSecret || undefined,
    });

    saveThresholds({ low, high });

    window.location.reload();
  }
}
