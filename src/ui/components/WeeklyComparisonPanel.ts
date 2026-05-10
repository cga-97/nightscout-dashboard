import { WeeklyMetrics } from '../../domain/models/WeeklyMetrics';

export class WeeklyComparisonPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(weeks: WeeklyMetrics[]): void {
    this.container.innerHTML = '';
    if (weeks.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('h3');
    title.textContent = 'Weekly Comparison';
    wrapper.appendChild(title);

    const table = document.createElement('table');
    table.className = 'comparison-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Week', 'TIR', 'TBR <70', 'TBR <54', 'TAR >180', 'TAR >250', 'Avg', 'CV', 'Readings'];
    headers.forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const w of weeks) {
      const startStr = w.weekStart.toLocaleDateString();
      const endStr = w.weekEnd.toLocaleDateString();
      const tr = document.createElement('tr');

      const weekCell = document.createElement('td');
      weekCell.textContent = `${startStr} – ${endStr}`;
      tr.appendChild(weekCell);

      const tirCell = document.createElement('td');
      tirCell.textContent = `${w.tirPercentage.toFixed(1)}%`;
      if (w.tirPercentage >= 70) tirCell.classList.add('good');
      else tirCell.classList.add('warning');
      tr.appendChild(tirCell);

      const tbr1Cell = document.createElement('td');
      tbr1Cell.textContent = `${w.tbrLevel1Percentage.toFixed(1)}%`;
      tr.appendChild(tbr1Cell);

      const tbr2Cell = document.createElement('td');
      tbr2Cell.textContent = `${w.tbrLevel2Percentage.toFixed(1)}%`;
      if (w.tbrLevel2Percentage > 1) tbr2Cell.classList.add('alert');
      tr.appendChild(tbr2Cell);

      const tar1Cell = document.createElement('td');
      tar1Cell.textContent = `${w.tarLevel1Percentage.toFixed(1)}%`;
      tr.appendChild(tar1Cell);

      const tar2Cell = document.createElement('td');
      tar2Cell.textContent = `${w.tarLevel2Percentage.toFixed(1)}%`;
      if (w.tarLevel2Percentage > 5) tar2Cell.classList.add('alert');
      tr.appendChild(tar2Cell);

      const avgCell = document.createElement('td');
      avgCell.textContent = `${w.averageGlucose.toFixed(0)}`;
      tr.appendChild(avgCell);

      const cvCell = document.createElement('td');
      cvCell.textContent = `${w.coefficientOfVariation.toFixed(1)}%`;
      tr.appendChild(cvCell);

      const readingsCell = document.createElement('td');
      readingsCell.textContent = `${w.totalReadings}`;
      tr.appendChild(readingsCell);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }
}
