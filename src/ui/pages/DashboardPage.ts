import { NightscoutApiClient } from '../../infrastructure/api/NightscoutApiClient';
import { getConfig, clearConfig, getThresholds, getViewMode, getLiveRange, getAnalysisRange, saveViewMode, saveLiveRange, saveAnalysisRange } from '../../infrastructure/storage/LocalStorageConfig';
import { GetCurrentGlucose } from '../../application/GetCurrentGlucose';
import { GetGlucoseHistory } from '../../application/GetGlucoseHistory';
import { CalculateTimeInRange } from '../../application/CalculateTimeInRange';
import { CalculateVariability } from '../../application/CalculateVariability';
import { CalculateGMI } from '../../application/CalculateGMI';
import { CountCriticalEvents } from '../../application/CountCriticalEvents';
import { AnalyzeHourlyPatterns } from '../../application/AnalyzeHourlyPatterns';
import { AnalyzeAdvancedMetrics } from '../../application/AnalyzeAdvancedMetrics';
import { CalculateWeeklyComparison } from '../../application/CalculateWeeklyComparison';
import { CalculateDailyTrends } from '../../application/CalculateDailyTrends';
import { ConfigForm } from '../components/ConfigForm';
import { CurrentGlucose } from '../components/CurrentGlucose';
import { GlucoseChart } from '../components/GlucoseChart';
import { StatsPanel } from '../components/StatsPanel';
import { VariabilityPanel } from '../components/VariabilityPanel';
import { EventsPanel } from '../components/EventsPanel';
import { PatternsPanel } from '../components/PatternsPanel';
import { RangeSelector } from '../components/RangeSelector';
import { ViewModeSelector, type ViewMode } from '../components/ViewModeSelector';
import { AdvancedMetricsPanel } from '../components/AdvancedMetricsPanel';
import { WeeklyComparisonPanel } from '../components/WeeklyComparisonPanel';
import { TrendSparkline } from '../components/TrendSparkline';
import { CalculateDataQuality } from '../../application/CalculateDataQuality';
import { DataQualityIndicator } from '../components/DataQualityIndicator';

const REFRESH_INTERVAL_MS = 300000;

const LIVE_OPTIONS = [
  { label: '6h', hours: 6 },
  { label: '12h', hours: 12 },
  { label: '24h', hours: 24 },
];

const ANALYSIS_OPTIONS = [
  { label: '7d', hours: 168 },
  { label: '14d', hours: 336 },
  { label: '30d', hours: 720 },
  { label: '60d', hours: 1440 },
  { label: '90d', hours: 2160 },
];

export class DashboardPage {
  private readonly app: HTMLElement;
  private intervalId: number | null = null;
  private viewMode: ViewMode = getViewMode();
  private selectedHoursLive = getLiveRange();
  private selectedHoursAnalysis = getAnalysisRange();

  constructor(app: HTMLElement) {
    this.app = app;
  }

  private get selectedHours(): number {
    return this.viewMode === 'live' ? this.selectedHoursLive : this.selectedHoursAnalysis;
  }

  private set selectedHours(hours: number) {
    if (this.viewMode === 'live') {
      this.selectedHoursLive = hours;
    } else {
      this.selectedHoursAnalysis = hours;
    }
  }

  mount(): void {
    this.app.innerHTML = '';

    const header = document.createElement('header');
    header.className = 'header';
    const headerTitle = document.createElement('h1');
    headerTitle.textContent = 'Nightscout Dashboard';
    header.appendChild(headerTitle);

    const controls = document.createElement('div');
    controls.className = 'header-controls';
    controls.appendChild(this.createSettingsButton());
    header.appendChild(controls);

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

    const thresholds = getThresholds();
    this.loadDashboard(main, config.baseUrl, config.apiSecret, thresholds);
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
    apiSecret?: string,
    thresholds: { low: number; high: number } = { low: 70, high: 180 }
  ): Promise<void> {
    const apiClient = new NightscoutApiClient({ baseUrl, apiSecret });
    await apiClient.detectUnits();
    const getCurrent = new GetCurrentGlucose(apiClient);
    const getHistory = new GetGlucoseHistory(apiClient);
    const calculateTir = new CalculateTimeInRange(thresholds);
    const calculateVariability = new CalculateVariability();
    const calculateGMI = new CalculateGMI();
    const countEvents = new CountCriticalEvents(thresholds);
    const analyzePatterns = new AnalyzeHourlyPatterns(thresholds);
    const analyzeAdvanced = new AnalyzeAdvancedMetrics(thresholds);
    const calculateWeekly = new CalculateWeeklyComparison(thresholds);
    const calculateDailyTrends = new CalculateDailyTrends(thresholds);

    // View mode selector container
    const viewModeContainer = document.createElement('div');
    const viewModeSelector = new ViewModeSelector(viewModeContainer, (mode) => {
      this.viewMode = mode;
      saveViewMode(mode);
      void load();
    }, this.viewMode);

    // Range selector container
    const rangeSelectorContainer = document.createElement('div');
    let rangeSelector: RangeSelector | null = null;

    const createRangeSelector = (): RangeSelector => {
      const options = this.viewMode === 'live' ? LIVE_OPTIONS : ANALYSIS_OPTIONS;
      return new RangeSelector(
        rangeSelectorContainer,
        options,
        (hours) => {
          this.selectedHours = hours;
          if (this.viewMode === 'live') {
            saveLiveRange(hours);
          } else {
            saveAnalysisRange(hours);
          }
          void load();
        },
        this.selectedHours
      );
    };

    const load = async (): Promise<void> => {
      this.showLoading(main);

      try {
        const [current, history] = await Promise.all([
          getCurrent.execute(),
          getHistory.execute(this.selectedHours),
        ]);

        main.innerHTML = '';

        // Controls row
        const controlsRow = document.createElement('div');
        controlsRow.className = 'controls-row';
        main.appendChild(controlsRow);

        viewModeContainer.innerHTML = '';
        controlsRow.appendChild(viewModeContainer);
        viewModeSelector.setActiveMode(this.viewMode);

        rangeSelectorContainer.innerHTML = '';
        controlsRow.appendChild(rangeSelectorContainer);
        rangeSelector = createRangeSelector();
        rangeSelector.setActiveHours(this.selectedHours);

        if (this.viewMode === 'live') {
          this.renderLiveView(main, current, history, {
            calculateTir,
            calculateVariability,
            calculateGMI,
            countEvents,
          });
        } else {
          this.renderAnalysisView(main, history, {
            analyzeAdvanced,
            calculateWeekly,
            calculateDailyTrends,
            analyzePatterns,
          });
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

  private renderLiveView(
    main: HTMLElement,
    current: import('../../domain/models/GlucoseReading').GlucoseReading | null,
    history: import('../../domain/models/GlucoseReading').GlucoseReading[],
    services: {
      calculateTir: CalculateTimeInRange;
      calculateVariability: CalculateVariability;
      calculateGMI: CalculateGMI;
      countEvents: CountCriticalEvents;
    }
  ): void {
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
      services.calculateTir.execute(history).then((tir) => {
        const average =
          history.reduce((sum, r) => sum + r.value, 0) / history.length;
        const stats = new StatsPanel(statsContainer);
        stats.render(tir, average);
      });

      const variability = services.calculateVariability.execute(history);
      const gmi = services.calculateGMI.execute(history);
      const events = services.countEvents.execute(history);

      const variabilityContainer = document.createElement('div');
      main.appendChild(variabilityContainer);
      const variabilityPanel = new VariabilityPanel(variabilityContainer);
      variabilityPanel.render(variability, gmi);

      const eventsContainer = document.createElement('div');
      main.appendChild(eventsContainer);
      const eventsPanel = new EventsPanel(eventsContainer);
      eventsPanel.render(events);
    } else {
      const noStats = document.createElement('div');
      noStats.className = 'card message';
      noStats.textContent = 'Not enough data for statistics.';
      statsContainer.appendChild(noStats);
    }
  }

  private renderAnalysisView(
    main: HTMLElement,
    history: import('../../domain/models/GlucoseReading').GlucoseReading[],
    services: {
      analyzeAdvanced: AnalyzeAdvancedMetrics;
      calculateWeekly: CalculateWeeklyComparison;
      calculateDailyTrends: CalculateDailyTrends;
      analyzePatterns: AnalyzeHourlyPatterns;
    }
  ): void {
    if (history.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'card message';
      noData.textContent = 'Not enough historical data for this range.';
      main.appendChild(noData);
      return;
    }

    const advancedMetrics = services.analyzeAdvanced.execute(history);
    const weeklyMetrics = services.calculateWeekly.execute(history);
    const dailyTrends = services.calculateDailyTrends.execute(history);

    const dataQuality = new CalculateDataQuality().execute(history, this.selectedHours);
    const qualityContainer = document.createElement('div');
    main.appendChild(qualityContainer);
    const qualityIndicator = new DataQualityIndicator(qualityContainer);
    qualityIndicator.render(dataQuality);

    if (advancedMetrics) {
      const advancedContainer = document.createElement('div');
      main.appendChild(advancedContainer);
      const advancedPanel = new AdvancedMetricsPanel(advancedContainer);
      advancedPanel.render(advancedMetrics);
    }

    if (dailyTrends.length > 1) {
      const sparklineContainer = document.createElement('div');
      main.appendChild(sparklineContainer);
      const sparkline = new TrendSparkline(sparklineContainer);
      sparkline.render(dailyTrends);
    }

    if (weeklyMetrics.length > 0) {
      const weeklyContainer = document.createElement('div');
      main.appendChild(weeklyContainer);
      const weeklyPanel = new WeeklyComparisonPanel(weeklyContainer);
      weeklyPanel.render(weeklyMetrics);
    }

    const patterns = services.analyzePatterns.execute(history);
    const patternsContainer = document.createElement('div');
    main.appendChild(patternsContainer);
    const patternsPanel = new PatternsPanel(patternsContainer);
    patternsPanel.render(patterns);
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
