import { CriticalEvents } from '../../domain/models/CriticalEvents';

export class EventsPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(events: CriticalEvents): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Critical Events';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'panel-grid';

    // Hypos <70
    const hyposCard = this.createBadge('Hypos (<70)', events.hypos, 'border-range');
    grid.appendChild(hyposCard);

    // Severe Hypos <54
    const severeHyposCard = this.createBadge('Severe Hypos (<54)', events.severeHypos, 'out-of-range');
    grid.appendChild(severeHyposCard);

    // Hypers >180
    const hypersCard = this.createBadge('Hypers (>180)', events.hypers, 'border-range');
    grid.appendChild(hypersCard);

    // Severe Hypers >250
    const severeHypersCard = this.createBadge('Severe Hypers (>250)', events.severeHypers, 'out-of-range');
    grid.appendChild(severeHypersCard);

    wrapper.appendChild(grid);

    const label = document.createElement('div');
    label.style.fontSize = 'var(--font-sm)';
    label.style.color = 'var(--text-secondary)';
    label.style.marginTop = 'var(--spacing-sm)';
    label.textContent = 'Counts from the selected period.';
    wrapper.appendChild(label);

    this.container.appendChild(wrapper);
  }

  private createBadge(labelText: string, count: number, colorClass: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'event-badge';

    const label = document.createElement('div');
    label.style.fontSize = 'var(--font-sm)';
    label.style.color = 'var(--text-secondary)';
    label.textContent = labelText;
    card.appendChild(label);

    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = String(count);
    value.classList.add(colorClass);
    card.appendChild(value);

    return card;
  }
}
