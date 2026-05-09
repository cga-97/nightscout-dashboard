import { Treatment } from '../../domain/models/Treatment';

export class TreatmentsPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(treatments: Treatment[]): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Recent Treatments';
    wrapper.appendChild(title);

    if (treatments.length === 0) {
      const message = document.createElement('div');
      message.className = 'message';
      message.textContent = 'No treatments';
      wrapper.appendChild(message);
      this.container.appendChild(wrapper);
      return;
    }

    const sorted = [...treatments]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.style.marginTop = '0';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Time', 'Event', 'Carbs', 'Insulin'];
    headers.forEach((text, index) => {
      const th = document.createElement('th');
      th.textContent = text;
      if (index >= 2) {
        th.style.textAlign = 'right';
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sorted.forEach((treatment) => {
      const row = document.createElement('tr');

      const timeCell = document.createElement('td');
      timeCell.textContent = this.formatTime(treatment.timestamp);
      row.appendChild(timeCell);

      const typeCell = document.createElement('td');
      typeCell.textContent = treatment.eventType;
      row.appendChild(typeCell);

      const carbsCell = document.createElement('td');
      if (treatment.carbs !== undefined && treatment.carbs > 0) {
        carbsCell.textContent = `${treatment.carbs} g`;
        carbsCell.style.color = '#f59e0b';
        carbsCell.style.fontWeight = '600';
      } else {
        carbsCell.textContent = '-';
      }
      carbsCell.style.textAlign = 'right';
      row.appendChild(carbsCell);

      const insulinCell = document.createElement('td');
      if (treatment.insulin !== undefined && treatment.insulin > 0) {
        insulinCell.textContent = `${treatment.insulin} U`;
        insulinCell.style.color = '#3b82f6';
        insulinCell.style.fontWeight = '600';
      } else {
        insulinCell.textContent = '-';
      }
      insulinCell.style.textAlign = 'right';
      row.appendChild(insulinCell);

      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
