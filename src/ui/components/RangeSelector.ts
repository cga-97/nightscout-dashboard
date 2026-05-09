export class RangeSelector {
  private readonly container: HTMLElement;
  private readonly onChange: (hours: number) => void;
  private activeHours: number;

  constructor(container: HTMLElement, onChange: (hours: number) => void, initialHours = 24) {
    this.container = container;
    this.onChange = onChange;
    this.activeHours = initialHours;
  }

  render(): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'range-selector';

    const options: { label: string; hours: number }[] = [
      { label: '6h', hours: 6 },
      { label: '12h', hours: 12 },
      { label: '24h', hours: 24 },
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'range-btn';
      if (opt.hours === this.activeHours) {
        btn.classList.add('active');
      }
      btn.textContent = opt.label;

      btn.addEventListener('click', () => {
        if (this.activeHours !== opt.hours) {
          this.activeHours = opt.hours;
          this.onChange(opt.hours);
          this.render();
        }
      });

      wrapper.appendChild(btn);
    });

    this.container.appendChild(wrapper);
  }

  setActiveHours(hours: number): void {
    this.activeHours = hours;
    this.render();
  }
}
