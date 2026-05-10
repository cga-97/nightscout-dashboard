import { GlucoseVariability } from '../../domain/models/GlucoseVariability';
import { GMI } from '../../domain/models/GMI';

function getSDColorClass(sd: number): string {
  if (sd > 40) return 'out-of-range';
  if (sd >= 20) return 'border-range';
  return 'in-range';
}

function getCVColorClass(cv: number): string {
  if (cv > 36) return 'out-of-range';
  if (cv >= 25) return 'border-range';
  return 'in-range';
}

function getGlucoseColorClass(value: number): string {
  if (value < 70 || value > 180) return 'out-of-range';
  if (value === 70 || value === 180) return 'border-range';
  return 'in-range';
}

export class VariabilityPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(variability: GlucoseVariability, gmi: GMI | null): void {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Variability & GMI';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'panel-grid';

    // SD
    const sdCard = document.createElement('div');
    const sdLabel = document.createElement('div');
    sdLabel.className = 'text-sm text-secondary';
    sdLabel.textContent = 'SD (mg/dL)';
    sdCard.appendChild(sdLabel);

    const sdValue = document.createElement('div');
    sdValue.className = 'stat-value';
    sdValue.textContent = `${Math.round(variability.standardDeviation)}`;
    sdValue.classList.add(getSDColorClass(variability.standardDeviation));
    sdCard.appendChild(sdValue);
    grid.appendChild(sdCard);

    // CV
    const cvCard = document.createElement('div');
    const cvLabel = document.createElement('div');
    cvLabel.className = 'text-sm text-secondary';
    cvLabel.textContent = 'CV (%)';
    cvCard.appendChild(cvLabel);

    const cvValue = document.createElement('div');
    cvValue.className = 'stat-value';
    cvValue.textContent = `${Math.round(variability.coefficientOfVariation)}%`;
    cvValue.classList.add(getCVColorClass(variability.coefficientOfVariation));
    cvCard.appendChild(cvValue);
    grid.appendChild(cvCard);

    // Min / Max
    const minMaxCard = document.createElement('div');
    const minMaxLabel = document.createElement('div');
    minMaxLabel.className = 'text-sm text-secondary';
    minMaxLabel.textContent = 'Min / Max Glucose';
    minMaxCard.appendChild(minMaxLabel);

    const minMaxValue = document.createElement('div');
    minMaxValue.className = 'stat-value';
    const minRounded = Math.round(variability.minGlucose);
    const maxRounded = Math.round(variability.maxGlucose);
    minMaxValue.textContent = `${minRounded} / ${maxRounded}`;
    // Color by the more severe of the two
    const minColor = getGlucoseColorClass(variability.minGlucose);
    const maxColor = getGlucoseColorClass(variability.maxGlucose);
    if (minColor === 'out-of-range' || maxColor === 'out-of-range') {
      minMaxValue.classList.add('out-of-range');
    } else if (minColor === 'border-range' || maxColor === 'border-range') {
      minMaxValue.classList.add('border-range');
    } else {
      minMaxValue.classList.add('in-range');
    }
    minMaxCard.appendChild(minMaxValue);
    grid.appendChild(minMaxCard);

    // GMI
    const gmiCard = document.createElement('div');
    const gmiLabel = document.createElement('div');
    gmiLabel.className = 'text-sm text-secondary';
    gmiLabel.textContent = 'GMI (%)';
    gmiCard.appendChild(gmiLabel);

    const gmiValue = document.createElement('div');
    gmiValue.className = 'stat-value';
    gmiValue.textContent = gmi ? `${gmi.gmiPercentage.toFixed(1)}%` : '–';
    gmiCard.appendChild(gmiValue);
    grid.appendChild(gmiCard);

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
  }
}
