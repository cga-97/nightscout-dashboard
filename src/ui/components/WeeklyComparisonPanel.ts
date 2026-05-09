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
    thead.innerHTML = `
      <tr>
        <th>Week</th>
        <th>TIR</th>
        <th>TBR <70</th>
        <th>TBR <54</th>
        <th>TAR >180</th>
        <th>TAR >250</th>
        <th>Avg</th>
        <th>CV</th>
        <th>Readings</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const w of weeks) {
      const startStr = w.weekStart.toLocaleDateString();
      const endStr = w.weekEnd.toLocaleDateString();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${startStr} - ${endStr}</td>
        <td class="${w.tirPercentage >= 70 ? 'good' : 'warning'}">${w.tirPercentage.toFixed(1)}%</td>
        <td>${w.tbrLevel1Percentage.toFixed(1)}%</td>
        <td class="${w.tbrLevel2Percentage > 1 ? 'alert' : ''}">${w.tbrLevel2Percentage.toFixed(1)}%</td>
        <td>${w.tarLevel1Percentage.toFixed(1)}%</td>
        <td class="${w.tarLevel2Percentage > 5 ? 'alert' : ''}">${w.tarLevel2Percentage.toFixed(1)}%</td>
        <td>${w.averageGlucose.toFixed(0)}</td>
        <td>${w.coefficientOfVariation.toFixed(1)}%</td>
        <td>${w.totalReadings}</td>
      `;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }
}
