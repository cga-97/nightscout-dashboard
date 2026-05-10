import {
  DistributionHistogram as DistributionHistogramModel,
  HistogramBin,
} from '../../domain/models/DistributionHistogram';

export class DistributionHistogram {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(data: DistributionHistogramModel): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Glucose Distribution';
    wrapper.appendChild(title);

    if (data.totalReadings === 0 || data.bins.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-secondary text-sm';
      empty.style.padding = '16px 0';
      empty.textContent = 'No data available';
      wrapper.appendChild(empty);
      this.container.appendChild(wrapper);
      return;
    }

    const chart = document.createElement('div');
    chart.className = 'flex flex-col gap-10 mt-12';

    data.bins.forEach((bin) => {
      const row = document.createElement('div');
      row.className = 'grid items-center histogram-grid gap-12';

      const label = document.createElement('div');
      label.className = 'text-sm text-secondary text-right text-nowrap';
      label.textContent = `${Math.round(bin.rangeStart)}-${Math.round(bin.rangeEnd)}`;
      row.appendChild(label);

      const track = document.createElement('div');
      track.className = 'h-22 bg-slate-100 rounded overflow-hidden relative';

      // Subtle vertical grid lines at 25%, 50%, 75%
      const grid = document.createElement('div');
      grid.className = 'absolute inset-0 pointer-events-none';
      [25, 50, 75].forEach((pct) => {
        const line = document.createElement('div');
        line.className = 'absolute';
        line.style.left = `${pct}%`;
        line.style.top = '0';
        line.style.bottom = '0';
        line.style.width = '1px';
        line.style.backgroundColor = '#e2e8f0';
        grid.appendChild(line);
      });
      track.appendChild(grid);

      const fill = document.createElement('div');
      fill.className = 'h-full rounded';
      fill.style.width = `${Math.min(100, Math.max(0, bin.percentage))}%`;
      fill.style.background = this.getBarBackground(
        bin,
        data.lowThreshold,
        data.highThreshold
      );
      track.appendChild(fill);

      row.appendChild(track);

      const pctLabel = document.createElement('div');
      pctLabel.className = 'text-sm text-secondary text-left';
      pctLabel.textContent = `${Math.round(bin.percentage)}%`;
      row.appendChild(pctLabel);

      chart.appendChild(row);
    });

    wrapper.appendChild(chart);
    this.container.appendChild(wrapper);
  }

  private getBarBackground(
    bin: HistogramBin,
    low: number,
    high: number
  ): string {
    const span = bin.rangeEnd - bin.rangeStart;
    if (span <= 0) {
      return '#94a3b8';
    }

    const belowOverlap = Math.max(
      0,
      Math.min(bin.rangeEnd, low) - bin.rangeStart
    );
    const inRangeOverlap = Math.max(
      0,
      Math.min(bin.rangeEnd, high) - Math.max(bin.rangeStart, low)
    );
    const aboveOverlap = Math.max(
      0,
      bin.rangeEnd - Math.max(bin.rangeStart, high)
    );

    const stops: string[] = [];
    let cursor = 0;

    if (belowOverlap > 0) {
      const end = cursor + (belowOverlap / span) * 100;
      stops.push(`#60a5fa ${cursor}%`);
      stops.push(`#60a5fa ${end}%`);
      cursor = end;
    }

    if (inRangeOverlap > 0) {
      const end = cursor + (inRangeOverlap / span) * 100;
      stops.push(`#4ade80 ${cursor}%`);
      stops.push(`#4ade80 ${end}%`);
      cursor = end;
    }

    if (aboveOverlap > 0) {
      const end = cursor + (aboveOverlap / span) * 100;
      stops.push(`#fbbf24 ${cursor}%`);
      stops.push(`#f87171 ${end}%`);
      cursor = end;
    }

    if (stops.length === 0) {
      return '#94a3b8';
    }

    // Solid color shortcut when the entire bar is one category
    const firstColor = stops[0].split(' ')[0];
    const lastColor = stops[stops.length - 1].split(' ')[0];
    if (stops.length === 2 && firstColor === lastColor) {
      return firstColor;
    }

    return `linear-gradient(to right, ${stops.join(', ')})`;
  }
}
