import { DailyTrend } from '../../domain/models/DailyTrend';

export class TrendSparkline {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(trends: DailyTrend[]): void {
    this.container.innerHTML = '';
    if (trends.length < 2) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('h3');
    title.textContent = 'Daily Average Trend';
    wrapper.appendChild(title);

    const svgWidth = 600;
    const svgHeight = 120;
    const padding = 10;

    const values = trends.map(t => t.averageGlucose);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = trends.map((t, i) => {
      const x = padding + (i / (trends.length - 1)) * (svgWidth - 2 * padding);
      const y = svgHeight - padding - ((t.averageGlucose - min) / range) * (svgHeight - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width = '100%';
    svg.style.height = '120px';

    // Target range lines (70-180)
    const y70 = svgHeight - padding - ((70 - min) / range) * (svgHeight - 2 * padding);
    const y180 = svgHeight - padding - ((180 - min) / range) * (svgHeight - 2 * padding);

    if (y70 >= padding && y70 <= svgHeight - padding) {
      const line70 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line70.setAttribute('x1', String(padding));
      line70.setAttribute('y1', String(y70));
      line70.setAttribute('x2', String(svgWidth - padding));
      line70.setAttribute('y2', String(y70));
      line70.setAttribute('stroke', '#e74c3c');
      line70.setAttribute('stroke-width', '1');
      line70.setAttribute('stroke-dasharray', '4');
      svg.appendChild(line70);
    }

    if (y180 >= padding && y180 <= svgHeight - padding) {
      const line180 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line180.setAttribute('x1', String(padding));
      line180.setAttribute('y1', String(y180));
      line180.setAttribute('x2', String(svgWidth - padding));
      line180.setAttribute('y2', String(y180));
      line180.setAttribute('stroke', '#e74c3c');
      line180.setAttribute('stroke-width', '1');
      line180.setAttribute('stroke-dasharray', '4');
      svg.appendChild(line180);
    }

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#3498db');
    polyline.setAttribute('stroke-width', '2');
    svg.appendChild(polyline);

    wrapper.appendChild(svg);
    this.container.appendChild(wrapper);
  }
}
