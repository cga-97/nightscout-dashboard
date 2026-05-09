export type ViewMode = 'live' | 'analysis';

export class ViewModeSelector {
  private readonly container: HTMLElement;
  private readonly onChange: (mode: ViewMode) => void;
  private activeMode: ViewMode;

  constructor(container: HTMLElement, onChange: (mode: ViewMode) => void, initialMode: ViewMode = 'live') {
    this.container = container;
    this.onChange = onChange;
    this.activeMode = initialMode;
  }

  render(): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-mode-selector';

    const options: { label: string; mode: ViewMode }[] = [
      { label: 'Live', mode: 'live' },
      { label: 'Analysis', mode: 'analysis' },
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'view-mode-btn';
      if (opt.mode === this.activeMode) {
        btn.classList.add('active');
      }
      btn.textContent = opt.label;

      btn.addEventListener('click', () => {
        if (this.activeMode !== opt.mode) {
          this.activeMode = opt.mode;
          this.onChange(opt.mode);
          this.render();
        }
      });

      wrapper.appendChild(btn);
    });

    this.container.appendChild(wrapper);
  }

  setActiveMode(mode: ViewMode): void {
    this.activeMode = mode;
    this.render();
  }
}
