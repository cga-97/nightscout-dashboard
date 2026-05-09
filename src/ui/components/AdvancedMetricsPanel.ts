import { AdvancedMetrics } from '../../domain/models/AdvancedMetrics';

export class AdvancedMetricsPanel {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(metrics: AdvancedMetrics): void {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'advanced-metrics-grid';

    const createCard = (label: string, value: string, sub?: string, alert?: boolean) => {
      const card = document.createElement('div');
      card.className = 'card metric-card';
      if (alert) card.classList.add('alert');
      
      const val = document.createElement('div');
      val.className = 'metric-value';
      val.textContent = value;
      
      const lab = document.createElement('div');
      lab.className = 'metric-label';
      lab.textContent = label;
      
      card.appendChild(val);
      card.appendChild(lab);
      
      if (sub) {
        const s = document.createElement('div');
        s.className = 'metric-sub';
        s.textContent = sub;
        card.appendChild(s);
      }
      
      return card;
    };

    wrapper.appendChild(createCard('TIR', `${metrics.tirPercentage.toFixed(1)}%`, '70-180 mg/dL'));
    wrapper.appendChild(createCard('TBR Level 1', `${metrics.tbrLevel1Percentage.toFixed(1)}%`, '< 70 mg/dL', metrics.tbrLevel1Percentage > 4));
    wrapper.appendChild(createCard('TBR Level 2', `${metrics.tbrLevel2Percentage.toFixed(1)}%`, '< 54 mg/dL', metrics.tbrLevel2Percentage > 1));
    wrapper.appendChild(createCard('TAR Level 1', `${metrics.tarLevel1Percentage.toFixed(1)}%`, '180-250 mg/dL', metrics.tarLevel1Percentage > 25));
    wrapper.appendChild(createCard('TAR Level 2', `${metrics.tarLevel2Percentage.toFixed(1)}%`, '> 250 mg/dL', metrics.tarLevel2Percentage > 5));
    wrapper.appendChild(createCard('GMI', `${metrics.gmiPercentage.toFixed(1)}%`, 'Est. HbA1c'));
    wrapper.appendChild(createCard('CV', `${metrics.coefficientOfVariation.toFixed(1)}%`, 'Variability', metrics.coefficientOfVariation > 36));
    wrapper.appendChild(createCard('Average', `${metrics.averageGlucose.toFixed(0)} mg/dL`));
    wrapper.appendChild(createCard('Readings', `${metrics.totalReadings}`));

    this.container.appendChild(wrapper);
  }
}
