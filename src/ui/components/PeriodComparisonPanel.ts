import { PeriodComparison, PeriodMetrics } from '../../domain/models/PeriodComparison';

export class PeriodComparisonPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(comparison: PeriodComparison): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Period Comparison';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    grid.style.gap = 'var(--spacing-lg)';

    grid.appendChild(this.createPeriodCard('Previous Period', comparison.previousPeriod));
    grid.appendChild(this.createCurrentPeriodCard(comparison));

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
  }

  private createPeriodCard(heading: string, metrics: PeriodMetrics): HTMLElement {
    const card = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'card-title';
    header.textContent = heading;
    card.appendChild(header);

    card.appendChild(this.createMetricRow('TIR', `${metrics.tirPercentage.toFixed(1)}%`));
    card.appendChild(this.createMetricRow('Average', `${metrics.averageGlucose.toFixed(0)} mg/dL`));
    card.appendChild(this.createMetricRow('CV', `${metrics.coefficientOfVariation.toFixed(1)}%`));
    card.appendChild(this.createMetricRow('GMI', `${metrics.gmiPercentage.toFixed(1)}%`));
    card.appendChild(this.createMetricRow('Readings', `${metrics.totalReadings}`));

    return card;
  }

  private createCurrentPeriodCard(comparison: PeriodComparison): HTMLElement {
    const card = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'card-title';
    header.textContent = 'Current Period';
    card.appendChild(header);

    card.appendChild(
      this.createMetricRow('TIR', `${comparison.currentPeriod.tirPercentage.toFixed(1)}%`, comparison.tirChange, 'tir')
    );
    card.appendChild(
      this.createMetricRow('Average', `${comparison.currentPeriod.averageGlucose.toFixed(0)} mg/dL`, comparison.averageChange, 'average')
    );
    card.appendChild(
      this.createMetricRow('CV', `${comparison.currentPeriod.coefficientOfVariation.toFixed(1)}%`, comparison.cvChange, 'cv')
    );
    card.appendChild(this.createMetricRow('GMI', `${comparison.currentPeriod.gmiPercentage.toFixed(1)}%`));
    card.appendChild(this.createMetricRow('Readings', `${comparison.currentPeriod.totalReadings}`));

    return card;
  }

  private createMetricRow(
    label: string,
    value: string,
    change?: number,
    type?: 'tir' | 'average' | 'cv'
  ): HTMLElement {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.padding = 'var(--spacing-xs) 0';
    row.style.borderBottom = '1px solid var(--bg-tertiary)';

    const left = document.createElement('div');

    const valEl = document.createElement('span');
    valEl.className = 'metric-value';
    valEl.style.fontSize = 'var(--font-lg)';
    valEl.textContent = value;
    left.appendChild(valEl);

    const labEl = document.createElement('span');
    labEl.className = 'metric-label';
    labEl.style.marginLeft = 'var(--spacing-sm)';
    labEl.textContent = label;
    left.appendChild(labEl);

    row.appendChild(left);

    if (change !== undefined && type) {
      const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
      const changeText = `${arrow} ${Math.abs(change).toFixed(type === 'average' ? 0 : 1)}`;

      const changeEl = document.createElement('span');
      changeEl.textContent = changeText;
      changeEl.style.fontWeight = '600';
      changeEl.style.fontSize = 'var(--font-md)';

      if (change === 0) {
        changeEl.style.color = 'var(--text-secondary)';
      } else {
        const isGood = this.isGoodChange(change, type);
        changeEl.className = isGood ? 'in-range' : 'out-of-range';
      }

      row.appendChild(changeEl);
    }

    return row;
  }

  private isGoodChange(change: number, type: 'tir' | 'average' | 'cv'): boolean {
    switch (type) {
      case 'tir':
        return change > 0;
      case 'average':
        return change < 0;
      case 'cv':
        return change < 0;
    }
  }
}
