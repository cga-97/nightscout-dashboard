import { HourlyPattern } from '../../domain/models/HourlyPattern';

interface BlockAggregate {
  label: string;
  averageGlucose: number;
  tirPercentage: number;
  readingsCount: number;
}

function getGlucoseColorClass(value: number): string {
  if (value < 70 || value > 180) return 'out-of-range';
  if (value === 70 || value === 180) return 'border-range';
  return 'in-range';
}

function formatHour(h: number): string {
  return h.toString().padStart(2, '0') + ':00';
}

function aggregateIntoBlocks(patterns: HourlyPattern[]): BlockAggregate[] {
  const blocks: BlockAggregate[] = [];

  for (let start = 0; start < 24; start += 4) {
    const end = start + 4;
    const label = `${formatHour(start)} - ${formatHour(end)}`;

    const relevant = patterns.filter((p) => p.hourStart >= start && p.hourStart < end);

    const totalReadings = relevant.reduce((sum, p) => sum + p.readingsCount, 0);

    if (totalReadings === 0) {
      blocks.push({ label, averageGlucose: 0, tirPercentage: 0, readingsCount: 0 });
      continue;
    }

    const weightedAvgGlucose =
      relevant.reduce((sum, p) => sum + p.averageGlucose * p.readingsCount, 0) / totalReadings;

    const weightedTIR =
      relevant.reduce((sum, p) => sum + p.timeInRangePercentage * p.readingsCount, 0) /
      totalReadings;

    blocks.push({
      label,
      averageGlucose: Math.round(weightedAvgGlucose),
      tirPercentage: Math.round(weightedTIR),
      readingsCount: totalReadings,
    });
  }

  return blocks;
}

export class PatternsPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(patterns: HourlyPattern[]): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Patterns by Time of Day';
    wrapper.appendChild(title);

    const blocks = aggregateIntoBlocks(patterns);

    blocks.forEach((block) => {
      const row = document.createElement('div');
      row.className = 'pattern-row';

      const header = document.createElement('div');
      header.className = 'pattern-header';

      const label = document.createElement('span');
      label.className = 'pattern-label';
      label.textContent = block.label;
      header.appendChild(label);

      if (block.readingsCount === 0) {
        const noData = document.createElement('span');
        noData.className = 'pattern-no-data';
        noData.textContent = 'No data';
        header.appendChild(noData);
      } else {
        const avg = document.createElement('span');
        avg.className = `pattern-avg ${getGlucoseColorClass(block.averageGlucose)}`;
        avg.textContent = `${block.averageGlucose} mg/dL`;
        header.appendChild(avg);
      }

      row.appendChild(header);

      if (block.readingsCount > 0) {
        const barContainer = document.createElement('div');
        barContainer.className = 'pattern-bar-container';

        const bar = document.createElement('div');
        bar.className = 'pattern-bar';
        bar.style.width = `${block.tirPercentage}%`;
        barContainer.appendChild(bar);

        const count = document.createElement('span');
        count.className = 'pattern-count';
        count.textContent = `${block.readingsCount} readings`;
        barContainer.appendChild(count);

        row.appendChild(barContainer);
      }

      wrapper.appendChild(row);
    });

    this.container.appendChild(wrapper);
  }
}
