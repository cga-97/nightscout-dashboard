import { HeatmapCell, HourlyHeatmap as HourlyHeatmapModel } from '../../domain/models/HourlyHeatmap';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function getCellColor(value: number, low: number, high: number, maxValue: number): string {
  if (value <= low) {
    return '#60a5fa';
  }
  if (value <= high) {
    return '#4ade80';
  }
  const ratio = Math.min(1, Math.max(0, (value - high) / (maxValue - high)));
  return interpolateColor('#fbbf24', '#f87171', ratio);
}

export class HourlyHeatmap {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(data: HourlyHeatmapModel): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Hourly Glucose Heatmap';
    wrapper.appendChild(title);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.overflowX = 'auto';
    scrollWrapper.style.width = '100%';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `auto repeat(24, minmax(8px, 16px))`;
    grid.style.gap = '2px';
    grid.style.alignItems = 'center';

    // Empty top-left corner
    grid.appendChild(document.createElement('div'));

    // Hour labels
    for (let h = 0; h < 24; h++) {
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.fontSize = 'var(--font-xs, 10px)';
      header.style.color = 'var(--text-secondary)';
      if (h % 4 === 0) {
        header.textContent = h.toString();
      }
      grid.appendChild(header);
    }

    const cellMap = new Map<string, HeatmapCell>();
    data.cells.forEach((cell) => {
      cellMap.set(`${cell.dayOfWeek}-${cell.hour}`, cell);
    });

    const maxValue = Math.max(
      data.highThreshold + 50,
      ...data.cells.map((c) => c.averageGlucose)
    );

    // Day rows
    for (let d = 0; d < 7; d++) {
      const dayLabel = document.createElement('div');
      dayLabel.textContent = DAY_LABELS[d];
      dayLabel.style.fontSize = 'var(--font-sm)';
      dayLabel.style.color = 'var(--text-secondary)';
      dayLabel.style.paddingRight = '8px';
      dayLabel.style.whiteSpace = 'nowrap';
      grid.appendChild(dayLabel);

      for (let h = 0; h < 24; h++) {
        const cellData = cellMap.get(`${d}-${h}`);
        const cell = document.createElement('div');
        cell.style.aspectRatio = '1 / 1';
        cell.style.borderRadius = '2px';
        cell.style.minWidth = '8px';

        if (!cellData || cellData.readingsCount === 0) {
          cell.style.backgroundColor = '#f3f4f6';
          cell.title = `${DAY_LABELS[d]} ${h}:00 — No data`;
        } else {
          const color = getCellColor(
            cellData.averageGlucose,
            data.lowThreshold,
            data.highThreshold,
            maxValue
          );
          cell.style.backgroundColor = color;
          cell.title = `${DAY_LABELS[d]} ${h}:00 — Avg ${Math.round(
            cellData.averageGlucose
          )} mg/dL (${cellData.readingsCount} readings)`;
        }

        grid.appendChild(cell);
      }
    }

    scrollWrapper.appendChild(grid);
    wrapper.appendChild(scrollWrapper);

    // Legend
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.alignItems = 'center';
    legend.style.gap = '12px';
    legend.style.marginTop = '12px';
    legend.style.fontSize = 'var(--font-sm)';
    legend.style.color = 'var(--text-secondary)';
    legend.style.flexWrap = 'wrap';

    legend.appendChild(createLegendItem('#60a5fa', `Below ${data.lowThreshold}`));
    legend.appendChild(
      createLegendItem('#4ade80', `In Range (${data.lowThreshold}-${data.highThreshold})`)
    );

    const highGradientBox = document.createElement('div');
    highGradientBox.style.display = 'flex';
    highGradientBox.style.alignItems = 'center';
    highGradientBox.style.gap = '4px';

    const highBox = document.createElement('div');
    highBox.style.width = '24px';
    highBox.style.height = '12px';
    highBox.style.borderRadius = '2px';
    highBox.style.background = 'linear-gradient(to right, #fbbf24, #f87171)';
    highGradientBox.appendChild(highBox);

    const highText = document.createElement('span');
    highText.textContent = `Above ${data.highThreshold}`;
    highGradientBox.appendChild(highText);

    legend.appendChild(highGradientBox);

    wrapper.appendChild(legend);

    this.container.appendChild(wrapper);
  }
}

function createLegendItem(color: string, label: string): HTMLElement {
  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.alignItems = 'center';
  item.style.gap = '4px';

  const box = document.createElement('div');
  box.style.width = '12px';
  box.style.height = '12px';
  box.style.borderRadius = '2px';
  box.style.backgroundColor = color;
  item.appendChild(box);

  const text = document.createElement('span');
  text.textContent = label;
  item.appendChild(text);

  return item;
}
