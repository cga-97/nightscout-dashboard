import { NightscoutApiClient } from '../../infrastructure/api/NightscoutApiClient';
import { getConfig, clearConfig } from '../../infrastructure/storage/LocalStorageConfig';
import { GetCurrentGlucose } from '../../application/GetCurrentGlucose';
import { GetGlucoseHistory } from '../../application/GetGlucoseHistory';
import { CalculateTimeInRange } from '../../application/CalculateTimeInRange';
import { CalculateVariability } from '../../application/CalculateVariability';
import { CalculateGMI } from '../../application/CalculateGMI';
import { CountCriticalEvents } from '../../application/CountCriticalEvents';
import { AnalyzeHourlyPatterns } from '../../application/AnalyzeHourlyPatterns';
import { ConfigForm } from '../components/ConfigForm';
import { CurrentGlucose } from '../components/CurrentGlucose';
import { GlucoseChart } from '../components/GlucoseChart';
import { StatsPanel } from '../components/StatsPanel';
import { VariabilityPanel } from '../components/VariabilityPanel';
import { EventsPanel } from '../components/EventsPanel';
import { PatternsPanel } from '../components/PatternsPanel';
import { RangeSelector } from '../components/RangeSelector';

const REFRESH_INTERVAL_MS = 300000;

export class DashboardPage {
  private readonly app: HTMLElement;
  private intervalId: number | null = null;
  private selectedHours = 6;

  constructor(app: HTMLElement) {
    this.app = app;
  }

  mount(): void {
    this.app.innerHTML = '';

    const header = document.createElement('header');
    header.className = 'header';
    const headerTitle = document.createElement('h1');
    headerTitle.textContent = 'Nightscout Dashboard';
    header.appendChild(headerTitle);
    header.appendChild(this.createSettingsButton());
    this.app.appendChild(header);

    const main = document.createElement('main');
    main.className = 'main';
    main.id = 'dashboard-main';
    this.app.appendChild(main);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.textContent = 'Nightscout Dashboard';
    this.app.appendChild(footer);

    const config = getConfig();

    if (!config.baseUrl) {
      const configForm = new ConfigForm(main);
      configForm.render();
      return;
    }

    this.loadDashboard(main, config.baseUrl, config.apiSecret);
  }

  private createSettingsButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm';
    btn.textContent = '⚙️ Settings';
    btn.addEventListener('click', () => {
      clearConfig();
      window.location.reload();
    });
    return btn;
  }

  private async loadDashboard(
    main: HTMLElement,
    baseUrl: string,
    apiSecret?: string
  ): Promise<void> {
    const apiClient = new NightscoutApiClient({ baseUrl, apiSecret });
    const getCurrent = new GetCurrentGlucose(apiClient);
    const getHistory = new GetGlucoseHistory(apiClient);
    const calculateTir = new CalculateTimeInRange();
    const calculateVariability = new CalculateVariability();
    const calculateGMI = new CalculateGMI();
    const countEvents = new CountCriticalEvents();
    const analyzePatterns = new AnalyzeHourlyPatterns();

    // Range selector
    const rangeSelectorContainer = document.createElement('div');
    const rangeSelector = new RangeSelector(rangeSelectorContainer, (hours) => {
      this.selectedHours = hours;
      void load();
    });
    rangeSelector.setActiveHours(this.selectedHours);

    const load = async (): Promise<void> => {
      this.showLoading(main);

      try {
        const [current, history] = await Promise.all([
          getCurrent.execute(),
          getHistory.execute(this.selectedHours),
        ]);

        main.innerHTML = '';
        main.appendChild(rangeSelectorContainer);
        rangeSelector.setActiveHours(this.selectedHours);

        const currentContainer = document.createElement('div');
        main.appendChild(currentContainer);

        if (current) {
          const previous = history.length > 1 ? history[1] : undefined;
          const currentGlucose = new CurrentGlucose(currentContainer);
          currentGlucose.render(current, previous);
        } else {
          const noData = document.createElement('div');
          noData.className = 'card message';
          noData.textContent = 'No current glucose data available.';
          currentContainer.appendChild(noData);
        }

        const chartContainer = document.createElement('div');
        main.appendChild(chartContainer);
        const chart = new GlucoseChart(chartContainer, this.selectedHours);
        chart.render(history);

        const statsContainer = document.createElement('div');
        main.appendChild(statsContainer);

        if (history.length > 0) {
          const tir = await calculateTir.execute(history);
          const average =
            history.reduce((sum, r) => sum + r.value, 0) / history.length;
          const stats = new StatsPanel(statsContainer);
          stats.render(tir, average);

          // Advanced metrics
          const variability = calculateVariability.execute(history);
          const gmi = calculateGMI.execute(history);
          const events = countEvents.execute(history);
          const patterns = analyzePatterns.execute(history);

          const variabilityContainer = document.createElement('div');
          main.appendChild(variabilityContainer);
          const variabilityPanel = new VariabilityPanel(variabilityContainer);
          variabilityPanel.render(variability, gmi);

          const eventsContainer = document.createElement('div');
          main.appendChild(eventsContainer);
          const eventsPanel = new EventsPanel(eventsContainer);
          eventsPanel.render(events);

          const patternsContainer = document.createElement('div');
          main.appendChild(patternsContainer);
          const patternsPanel = new PatternsPanel(patternsContainer);
          patternsPanel.render(patterns);
        } else {
          const noStats = document.createElement('div');
          noStats.className = 'card message';
          noStats.textContent = 'Not enough data for statistics.';
          statsContainer.appendChild(noStats);
        }
      } catch (err) {
        this.showError(
          main,
          err instanceof Error ? err.message : 'Failed to load data.'
        );
      }
    };

    await load();

    this.intervalId = window.setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);
  }

  private showLoading(main: HTMLElement): void {
    main.innerHTML = '';
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.textContent = 'Loading...';
    main.appendChild(msg);
  }

  private showError(main: HTMLElement, message: string): void {
    main.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    const msg = document.createElement('div');
    msg.className = 'message message-error';
    msg.textContent = message;
    wrapper.appendChild(msg);

    const hint = document.createElement('div');
    hint.className = 'message';
    hint.style.marginTop = 'var(--spacing-md)';
    hint.textContent = 'Check the URL or your internet connection. You can also change the configuration below.';
    wrapper.appendChild(hint);

    wrapper.appendChild(this.createSettingsButton());
    main.appendChild(wrapper);
  }

  unmount(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
