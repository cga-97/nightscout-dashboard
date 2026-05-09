export interface RangeOption {
  label: string;
  hours: number;
}

export class RangeSelector {
  private readonly container: HTMLElement;
  private readonly options: RangeOption[];
  private readonly onChange: (hours: number) => void;
  private activeHours: number;

  constructor(
    container: HTMLElement,
    options: RangeOption[],
    onChange: (hours: number) => void,
    initialHours = 6
  ) {
    this.container = container;
    this.options = options;
    this.onChange = onChange;
    this.activeHours = initialHours;
  }

  render(): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'range-selector';

    this.options.forEach((opt) => {
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
