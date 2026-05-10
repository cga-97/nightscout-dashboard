import { GlucoseReading } from '../../domain/models/GlucoseReading';

const DIRECTION_ARROWS: Record<string, string> = {
  Flat: '→',
  SingleUp: '↑',
  DoubleUp: '↑↑',
  SingleDown: '↓',
  DoubleDown: '↓↓',
  FortyFiveUp: '↗',
  FortyFiveDown: '↘',
  None: '–',
};

const LOW_THRESHOLD = 70;
const HIGH_THRESHOLD = 180;

function getColorClass(value: number): string {
  if (value < LOW_THRESHOLD || value > HIGH_THRESHOLD) {
    return 'out-of-range';
  }
  if (value === LOW_THRESHOLD || value === HIGH_THRESHOLD) {
    return 'border-range';
  }
  return 'in-range';
}

export class CurrentGlucose {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(reading: GlucoseReading, previous?: GlucoseReading): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card current-glucose';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Current Glucose';
    wrapper.appendChild(title);

    const valueEl = document.createElement('div');
    valueEl.className = `glucose-value ${getColorClass(reading.value)}`;
    valueEl.textContent = Number.isFinite(reading.value) ? String(Math.round(reading.value)) : '?';
    wrapper.appendChild(valueEl);

    const meta = document.createElement('div');
    meta.className = 'glucose-meta';

    const direction = document.createElement('span');
    direction.className = 'glucose-direction';
    direction.textContent = DIRECTION_ARROWS[reading.direction ?? ''] ?? '?';
    meta.appendChild(direction);

    const delta = document.createElement('span');
    delta.className = 'glucose-delta';
    const deltaValue = this.calculateDelta(reading, previous);
    if (deltaValue !== null) {
      const sign = deltaValue > 0 ? '+' : '';
      delta.textContent = `${sign}${Math.round(deltaValue)} mg/dL`;
      delta.classList.add(getColorClass(reading.value));
    } else {
      delta.textContent = '– mg/dL';
    }
    meta.appendChild(delta);

    wrapper.appendChild(meta);

    const time = document.createElement('div');
    time.className = 'text-sm text-secondary mt-xs';
    time.textContent = this.formatTime(reading.timestamp);
    wrapper.appendChild(time);

    this.container.appendChild(wrapper);
  }

  private calculateDelta(
    current: GlucoseReading,
    previous?: GlucoseReading
  ): number | null {
    if (!previous || !Number.isFinite(current.value) || !Number.isFinite(previous.value)) {
      return null;
    }
    return current.value - previous.value;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
