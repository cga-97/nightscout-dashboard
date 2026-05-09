import { setConfig } from '../../infrastructure/storage/LocalStorageConfig';

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
    baseUrlInput.placeholder = 'https://your-nightscout.herokuapp.com';
    baseUrlInput.required = true;
    baseUrlGroup.appendChild(baseUrlInput);

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

    form.appendChild(secretGroup);

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

    if (!baseUrl) {
      return;
    }

    setConfig({
      baseUrl,
      apiSecret: apiSecret || undefined,
    });

    window.location.reload();
  }
}
