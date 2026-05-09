import { GlucoseReading } from '../../domain/models/GlucoseReading';

const CANVAS_HEIGHT = 160;
const CANVAS_WIDTH = 640;
const PADDING = 16;

export class GlucoseChart {
  private readonly container: HTMLElement;
  private readonly hoursToShow: number;

  constructor(container: HTMLElement, hoursToShow = 6) {
    this.container = container;
    this.hoursToShow = hoursToShow;
  }

  render(readings: GlucoseReading[]): void {
    this.container.innerHTML = '';

    if (readings.length === 0) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = `Last ${this.hoursToShow} Hours`;
    wrapper.appendChild(title);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    chartContainer.appendChild(canvas);
    wrapper.appendChild(chartContainer);

    this.container.appendChild(wrapper);

    this.draw(canvas, readings);
  }

  private draw(canvas: HTMLCanvasElement, readings: GlucoseReading[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const now = Date.now();
    const cutoff = now - this.hoursToShow * 60 * 60 * 1000;
    const filtered = readings
      .filter((r) => r.timestamp.getTime() >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (filtered.length < 2) {
      this.drawEmpty(ctx, width, height);
      return;
    }

    const values = filtered.map((r) => r.value);
    const minValue = Math.min(...values, 70);
    const maxValue = Math.max(...values, 180);
    const valueRange = maxValue - minValue || 1;

    const times = filtered.map((r) => r.timestamp.getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1;

    const plotWidth = width - PADDING * 2;
    const plotHeight = height - PADDING * 2;

    const getX = (time: number): number =>
      PADDING + ((time - minTime) / timeRange) * plotWidth;
    const getY = (value: number): number =>
      PADDING + plotHeight - ((value - minValue) / valueRange) * plotHeight;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines for range
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const lowY = getY(70);
    const highY = getY(180);

    ctx.beginPath();
    ctx.moveTo(PADDING, lowY);
    ctx.lineTo(width - PADDING, lowY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING, highY);
    ctx.lineTo(width - PADDING, highY);
    ctx.stroke();

    ctx.setLineDash([]);

    // In-range band
    ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
    ctx.fillRect(PADDING, highY, plotWidth, lowY - highY);

    // Polyline
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    filtered.forEach((reading, i) => {
      const x = getX(reading.timestamp.getTime());
      const y = getY(reading.value);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Data points
    filtered.forEach((reading) => {
      const x = getX(reading.timestamp.getTime());
      const y = getY(reading.value);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = reading.value >= 70 && reading.value <= 180 ? '#4ade80' : '#f87171';
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(maxValue)), PADDING - 4, PADDING + 8);
    ctx.fillText(String(Math.round(minValue)), PADDING - 4, height - PADDING);
  }

  private drawEmpty(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data', width / 2, height / 2);
  }
}
