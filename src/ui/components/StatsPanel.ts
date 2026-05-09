import { TimeInRange } from '../../domain/models/TimeInRange';

export class StatsPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(timeInRange: TimeInRange, averageGlucose: number): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Statistics';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'stats-grid';

    const tirCard = document.createElement('div');
    const tirLabel = document.createElement('div');
    tirLabel.style.fontSize = 'var(--font-sm)';
    tirLabel.style.color = 'var(--text-secondary)';
    tirLabel.textContent = `Time in Range (${timeInRange.low}-${timeInRange.high})`;
    tirCard.appendChild(tirLabel);

    const tirValue = document.createElement('div');
    tirValue.className = 'stat-value';
    const percentage = Math.round(timeInRange.percentage);
    tirValue.textContent = `${percentage}%`;
    tirValue.classList.add(percentage >= 70 ? 'in-range' : 'out-of-range');
    tirCard.appendChild(tirValue);

    grid.appendChild(tirCard);

    const avgCard = document.createElement('div');
    const avgLabel = document.createElement('div');
    avgLabel.style.fontSize = 'var(--font-sm)';
    avgLabel.style.color = 'var(--text-secondary)';
    avgLabel.textContent = 'Average Glucose';
    avgCard.appendChild(avgLabel);

    const avgValue = document.createElement('div');
    avgValue.className = 'stat-value';
    avgValue.textContent = `${Math.round(averageGlucose)} mg/dL`;
    avgValue.classList.add(
      averageGlucose >= 70 && averageGlucose <= 180 ? 'in-range' : 'out-of-range'
    );
    avgCard.appendChild(avgValue);

    grid.appendChild(avgCard);

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
  }
}
