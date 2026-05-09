import { DataQuality } from '../../application/CalculateDataQuality';

export class DataQualityIndicator {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(quality: DataQuality): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card data-quality';

    const title = document.createElement('h3');
    title.textContent = 'Data Quality';
    wrapper.appendChild(title);

    const barContainer = document.createElement('div');
    barContainer.className = 'quality-bar-container';

    const bar = document.createElement('div');
    bar.className = 'quality-bar';
    bar.style.width = `${quality.coveragePercentage}%`;

    if (quality.coveragePercentage >= 90) {
      bar.classList.add('good');
    } else if (quality.coveragePercentage >= 70) {
      bar.classList.add('warning');
    } else {
      bar.classList.add('alert');
    }

    barContainer.appendChild(bar);
    wrapper.appendChild(barContainer);

    const info = document.createElement('div');
    info.className = 'quality-info';
    info.textContent = `${quality.actualReadings.toLocaleString()} of ${quality.expectedReadings.toLocaleString()} expected readings (${quality.coveragePercentage.toFixed(1)}%)`;
    wrapper.appendChild(info);

    if (quality.coveragePercentage < 70) {
      const warning = document.createElement('div');
      warning.className = 'quality-warning';
      warning.textContent = 'Low data coverage — metrics may not be representative.';
      wrapper.appendChild(warning);
    }

    this.container.appendChild(wrapper);
  }
}
