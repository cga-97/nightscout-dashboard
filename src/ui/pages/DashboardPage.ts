import { createNightscoutApiClient } from '../../infrastructure/api/NightscoutApiClient';
import { getConfig, getThresholds, getViewMode, getLiveRange, getAnalysisRange, saveViewMode, saveLiveRange, saveAnalysisRange } from '../../infrastructure/storage/LocalStorageConfig';
import { GetCurrentGlucose } from '../../application/GetCurrentGlucose';
import { GetGlucoseHistory } from '../../application/GetGlucoseHistory';
import { Treatment } from '../../domain/models/Treatment';
import { GlucoseReading } from '../../domain/models/GlucoseReading';
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
import { CalculateHourlyHeatmap } from '../../application/CalculateHourlyHeatmap';
import { HourlyHeatmap } from '../components/HourlyHeatmap';
import { CalculateDistributionHistogram } from '../../application/CalculateDistributionHistogram';
import { DistributionHistogram } from '../components/DistributionHistogram';
import { CalculatePeriodComparison } from '../../application/CalculatePeriodComparison';
import { PeriodComparisonPanel } from '../components/PeriodComparisonPanel';
import { TreatmentsPanel } from '../components/TreatmentsPanel';
import { CheckSevereHypo } from '../../application/CheckSevereHypo';
import { NotificationService } from '../../application/NotificationService';
import { SettingsModal } from '../components/SettingsModal';
import { DashboardCache, type CachedData } from '../services/DashboardCache';
import { DashboardSkeletonRenderer } from '../services/DashboardSkeletonRenderer';
import { REFRESH_INTERVAL_MS, DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD } from '../../domain/constants';

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
  private currentBaseUrl?: string;
  private currentApiSecret?: string;

  // Persistent DOM elements
  private controlsRow: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private viewModeContainer: HTMLElement | null = null;
  private rangeSelectorContainer: HTMLElement | null = null;

  // Persistent component instances
  private viewModeSelector: ViewModeSelector | null = null;
  private rangeSelector: RangeSelector | null = null;

  // Data cache
  private cache = new DashboardCache();
  private lastScrollTop = 0;
  private loadAbortController: AbortController | null = null;
  private notificationService = new NotificationService();

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

  private get cacheKey(): string {
    return `${this.viewMode}-${this.selectedHours}`;
  }

  mount(): void {
    this.app.innerHTML = '';
    this.cache.clear();

    const header = document.createElement('header');
    header.className = 'header';
    const headerTitle = document.createElement('h1');
    headerTitle.textContent = 'Nightscout Dashboard';
    header.appendChild(headerTitle);

    const controls = document.createElement('div');
    controls.className = 'header-controls';
    controls.appendChild(this.createNotificationButton());
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
    this.currentBaseUrl = config.baseUrl;
    this.currentApiSecret = config.apiSecret;
    this.initDashboard(main, config.baseUrl, config.apiSecret, thresholds);
  }

  private createNotificationButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-ghost';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
    btn.title = 'Enable notifications';
    btn.addEventListener('click', async () => {
      const granted = await this.notificationService.requestPermission();
      if (granted) {
        btn.title = 'Notifications enabled';
        btn.style.opacity = '1';
      } else {
        btn.title = 'Notifications blocked';
        btn.style.opacity = '0.5';
      }
    });
    return btn;
  }

  private createSettingsButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-ghost';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    btn.title = 'Settings';
    btn.setAttribute('aria-label', 'Settings');
    btn.addEventListener('click', () => {
      const config = getConfig();
      const thresholds = getThresholds();
      const modal = new SettingsModal(config, thresholds, (result) => {
        if (result.reset) {
          window.location.reload();
          return;
        }
        if (result.saved) {
          const newConfig = getConfig();
          if (newConfig.baseUrl !== this.currentBaseUrl || newConfig.apiSecret !== this.currentApiSecret) {
            window.location.reload();
          } else {
            const main = document.getElementById('dashboard-main');
            if (main && newConfig.baseUrl) {
              this.initDashboard(main, newConfig.baseUrl, newConfig.apiSecret, getThresholds());
            }
          }
        }
      });
      modal.open();
    });
    return btn;
  }

  private initDashboard(
    main: HTMLElement,
    _baseUrl: string,
    _apiSecret: string | undefined,
    thresholds: { low: number; high: number } = { low: DEFAULT_LOW_THRESHOLD, high: DEFAULT_HIGH_THRESHOLD }
  ): void {
    // Clear previous state
    main.innerHTML = '';
    this.controlsRow = null;
    this.contentContainer = null;
    this.viewModeContainer = null;
    this.rangeSelectorContainer = null;
    this.viewModeSelector = null;
    this.rangeSelector = null;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Create persistent controls
    this.controlsRow = document.createElement('div');
    this.controlsRow.className = 'controls-row animate-fade-in-up';
    main.appendChild(this.controlsRow);

    this.viewModeContainer = document.createElement('div');
    this.controlsRow.appendChild(this.viewModeContainer);

    this.rangeSelectorContainer = document.createElement('div');
    this.controlsRow.appendChild(this.rangeSelectorContainer);

    const createRangeSelector = (): RangeSelector => {
      const options = this.viewMode === 'live' ? LIVE_OPTIONS : ANALYSIS_OPTIONS;
      return new RangeSelector(
        this.rangeSelectorContainer!,
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

    this.viewModeSelector = new ViewModeSelector(this.viewModeContainer, (mode) => {
      this.viewMode = mode;
      saveViewMode(mode);
      // Recreate range selector with new options for the mode
      this.rangeSelector = createRangeSelector();
      this.rangeSelector.render();
      void load();
    }, this.viewMode);
    this.viewModeSelector.render();

    this.rangeSelector = createRangeSelector();
    this.rangeSelector.render();

    // Create content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'dashboard-content';
    main.appendChild(this.contentContainer);

    const load = async (): Promise<void> => {
      if (this.loadAbortController) {
        this.loadAbortController.abort();
      }
      this.loadAbortController = new AbortController();
      const signal = this.loadAbortController.signal;

      const content = this.contentContainer;
      if (!content) return;
      if (signal.aborted) return;

      // Save scroll position
      this.lastScrollTop = content.scrollTop || 0;

      try {
        if (!this.currentBaseUrl) return;

        const apiClient = await createNightscoutApiClient({
          baseUrl: this.currentBaseUrl,
          apiSecret: this.currentApiSecret,
        });
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
        const calculateHeatmap = new CalculateHourlyHeatmap(thresholds);
        const calculateHistogram = new CalculateDistributionHistogram(thresholds);
        const calculatePeriodComparison = new CalculatePeriodComparison(thresholds);
        const checkHypo = new CheckSevereHypo();

        // Check cache for instant render
        const cached = this.cache.get(this.cacheKey);
        if (cached) {
          // Render from cache immediately while fetching fresh data
          this.renderFromCache(content, cached, {
            calculateTir,
            calculateVariability,
            calculateGMI,
            countEvents,
            analyzeAdvanced,
            calculateWeekly,
            calculateDailyTrends,
            analyzePatterns,
            calculateHeatmap,
            calculateHistogram,
            calculatePeriodComparison,
          });
        } else {
          DashboardSkeletonRenderer.showSkeletons(content, this.viewMode);
        }

        if (signal.aborted) return;
        const cutoff = new Date(Date.now() - this.selectedHours * 60 * 60 * 1000);

        // Fetch current only in live mode, or if not cached
        const shouldFetchCurrent = this.viewMode === 'live' || !cached;
        const [current, history, treatments] = await Promise.all([
          shouldFetchCurrent ? getCurrent.execute() : Promise.resolve(cached?.current ?? null),
          getHistory.execute(this.selectedHours),
          apiClient.getTreatments(cutoff),
        ]);

        if (signal.aborted) return;

        // Check for severe hypo and notify
        const hypoAlert = checkHypo.execute(current);
        if (hypoAlert.triggered && hypoAlert.value !== undefined) {
          this.notificationService.sendSevereHypoAlert(hypoAlert.value);
        }

        // Update cache
        this.cache.set(this.cacheKey, {
          current,
          history,
          treatments,
          timestamp: Date.now(),
        });

        this.removeCacheIndicator();

        // Update selectors
        this.viewModeSelector?.setActiveMode(this.viewMode);
        this.rangeSelector?.setActiveHours(this.selectedHours);

        // Render
        content.innerHTML = '';
        if (this.viewMode === 'live') {
          this.renderLiveView(content, current, history, treatments, {
            calculateTir,
            calculateVariability,
            calculateGMI,
            countEvents,
          });
        } else {
          this.renderAnalysisView(content, history, {
            analyzeAdvanced,
            calculateWeekly,
            calculateDailyTrends,
            analyzePatterns,
            calculateHeatmap,
            calculateHistogram,
            calculatePeriodComparison,
          });
        }

        DashboardSkeletonRenderer.applyStaggerAnimation(content);

        // Restore scroll position
        content.scrollTop = this.lastScrollTop;
      } catch (err) {
        if (signal.aborted) return;
        this.showError(
          content,
          err instanceof Error ? err.message : 'Failed to load data.'
        );
      }
    };

    // Initial load
    void load();

    this.intervalId = window.setInterval(() => {
      load().catch((err) => {
        console.error('Background refresh failed:', err instanceof Error ? err.message : String(err));
        // Don't show error to user on background refresh — just log it.
        // The stale cache data is still displayed.
      });
    }, REFRESH_INTERVAL_MS);
  }

  private renderFromCache(
    content: HTMLElement,
    cached: CachedData,
    services: {
      calculateTir: CalculateTimeInRange;
      calculateVariability: CalculateVariability;
      calculateGMI: CalculateGMI;
      countEvents: CountCriticalEvents;
      analyzeAdvanced: AnalyzeAdvancedMetrics;
      calculateWeekly: CalculateWeeklyComparison;
      calculateDailyTrends: CalculateDailyTrends;
      analyzePatterns: AnalyzeHourlyPatterns;
      calculateHeatmap: CalculateHourlyHeatmap;
      calculateHistogram: CalculateDistributionHistogram;
      calculatePeriodComparison: CalculatePeriodComparison;
    }
  ): void {
    content.innerHTML = '';

    this.showCacheIndicator(content);

    if (this.viewMode === 'live') {
      this.renderLiveView(content, cached.current, cached.history, cached.treatments, {
        calculateTir: services.calculateTir,
        calculateVariability: services.calculateVariability,
        calculateGMI: services.calculateGMI,
        countEvents: services.countEvents,
      });
    } else {
      this.renderAnalysisView(content, cached.history, {
        analyzeAdvanced: services.analyzeAdvanced,
        calculateWeekly: services.calculateWeekly,
        calculateDailyTrends: services.calculateDailyTrends,
        analyzePatterns: services.analyzePatterns,
        calculateHeatmap: services.calculateHeatmap,
        calculateHistogram: services.calculateHistogram,
        calculatePeriodComparison: services.calculatePeriodComparison,
      });
    }
    DashboardSkeletonRenderer.applyStaggerAnimation(content);
    content.scrollTop = this.lastScrollTop;
  }

  private renderLiveView(
    container: HTMLElement,
    current: GlucoseReading | null,
    history: GlucoseReading[],
    treatments: Treatment[],
    services: {
      calculateTir: CalculateTimeInRange;
      calculateVariability: CalculateVariability;
      calculateGMI: CalculateGMI;
      countEvents: CountCriticalEvents;
    }
  ): void {
    const currentContainer = document.createElement('div');
    container.appendChild(currentContainer);

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
    container.appendChild(chartContainer);
    const chart = new GlucoseChart(chartContainer, this.selectedHours);
    chart.render(history, treatments);

    const statsContainer = document.createElement('div');
    container.appendChild(statsContainer);

    if (history.length > 0) {
      const tir = services.calculateTir.execute(history);
      const average = history.reduce((sum, r) => sum + r.value, 0) / history.length;
      const stats = new StatsPanel(statsContainer);
      stats.render(tir, average);

      const variability = services.calculateVariability.execute(history);
      const gmi = services.calculateGMI.execute(history);
      const events = services.countEvents.execute(history);

      const variabilityContainer = document.createElement('div');
      container.appendChild(variabilityContainer);
      const variabilityPanel = new VariabilityPanel(variabilityContainer);
      variabilityPanel.render(variability, gmi);

      const eventsContainer = document.createElement('div');
      container.appendChild(eventsContainer);
      const eventsPanel = new EventsPanel(eventsContainer);
      eventsPanel.render(events);

      const treatmentsContainer = document.createElement('div');
      container.appendChild(treatmentsContainer);
      const treatmentsPanel = new TreatmentsPanel(treatmentsContainer);
      treatmentsPanel.render(treatments);
    } else {
      const noStats = document.createElement('div');
      noStats.className = 'card message';
      noStats.textContent = 'Not enough data for statistics.';
      statsContainer.appendChild(noStats);
    }
  }

  private renderAnalysisView(
    container: HTMLElement,
    history: GlucoseReading[],
    services: {
      analyzeAdvanced: AnalyzeAdvancedMetrics;
      calculateWeekly: CalculateWeeklyComparison;
      calculateDailyTrends: CalculateDailyTrends;
      analyzePatterns: AnalyzeHourlyPatterns;
      calculateHeatmap: CalculateHourlyHeatmap;
      calculateHistogram: CalculateDistributionHistogram;
      calculatePeriodComparison: CalculatePeriodComparison;
    }
  ): void {
    if (history.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'card message';
      noData.textContent = 'Not enough historical data for this range.';
      container.appendChild(noData);
      return;
    }

    const advancedMetrics = services.analyzeAdvanced.execute(history);
    const weeklyMetrics = services.calculateWeekly.execute(history);
    const dailyTrends = services.calculateDailyTrends.execute(history);

    const dataQuality = new CalculateDataQuality().execute(history, this.selectedHours);
    const qualityContainer = document.createElement('div');
    container.appendChild(qualityContainer);
    const qualityIndicator = new DataQualityIndicator(qualityContainer);
    qualityIndicator.render(dataQuality);

    const periodComparison = services.calculatePeriodComparison.execute(history);
    if (periodComparison) {
      const comparisonContainer = document.createElement('div');
      container.appendChild(comparisonContainer);
      const comparisonPanel = new PeriodComparisonPanel(comparisonContainer);
      comparisonPanel.render(periodComparison);
    }

    if (advancedMetrics) {
      const advancedContainer = document.createElement('div');
      container.appendChild(advancedContainer);
      const advancedPanel = new AdvancedMetricsPanel(advancedContainer);
      advancedPanel.render(advancedMetrics);
    }

    if (dailyTrends.length > 1) {
      const sparklineContainer = document.createElement('div');
      container.appendChild(sparklineContainer);
      const sparkline = new TrendSparkline(sparklineContainer);
      sparkline.render(dailyTrends);
    }

    const heatmapData = services.calculateHeatmap.execute(history);
    const heatmapContainer = document.createElement('div');
    container.appendChild(heatmapContainer);
    const heatmap = new HourlyHeatmap(heatmapContainer);
    heatmap.render(heatmapData);

    const histogramData = services.calculateHistogram.execute(history);
    const histogramContainer = document.createElement('div');
    container.appendChild(histogramContainer);
    const histogram = new DistributionHistogram(histogramContainer);
    histogram.render(histogramData);

    if (weeklyMetrics.length > 0) {
      const weeklyContainer = document.createElement('div');
      container.appendChild(weeklyContainer);
      const weeklyPanel = new WeeklyComparisonPanel(weeklyContainer);
      weeklyPanel.render(weeklyMetrics);
    }

    const patterns = services.analyzePatterns.execute(history);
    const patternsContainer = document.createElement('div');
    container.appendChild(patternsContainer);
    const patternsPanel = new PatternsPanel(patternsContainer);
    patternsPanel.render(patterns);
  }

  private showCacheIndicator(container: HTMLElement): void {
    const indicator = document.createElement('div');
    indicator.className = 'cache-indicator';
    indicator.id = 'cache-indicator';

    const dot = document.createElement('span');
    dot.className = 'cache-indicator-dot';
    indicator.appendChild(dot);

    const text = document.createElement('span');
    text.textContent = 'Cached';
    indicator.appendChild(text);

    container.appendChild(indicator);
  }

  private removeCacheIndicator(): void {
    const indicator = document.getElementById('cache-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private showError(container: HTMLElement, message: string): void {
    this.removeCacheIndicator();
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'card animate-fade-in-up';

    const msg = document.createElement('div');
    msg.className = 'message message-error';
    msg.textContent = message;
    wrapper.appendChild(msg);

    const hint = document.createElement('div');
    hint.className = 'message';
    hint.style.marginTop = 'var(--spacing-md)';
    hint.textContent = 'Check the URL or your internet connection. You can also change the configuration below.';
    wrapper.appendChild(hint);

    const btnWrapper = document.createElement('div');
    btnWrapper.style.marginTop = 'var(--spacing-md)';
    btnWrapper.appendChild(this.createSettingsButton());
    wrapper.appendChild(btnWrapper);

    container.appendChild(wrapper);
  }

  unmount(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cache.clear();
  }
}
