import { type ViewMode } from '../components/ViewModeSelector';

export class DashboardSkeletonRenderer {
  static showSkeletons(container: HTMLElement, viewMode: ViewMode): void {
    container.innerHTML = '';

    if (viewMode === 'live') {
      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('40%', 'var(--font-xs)'),
        this.createSkeletonText('60%', 'var(--font-4xl)'),
        this.createSkeletonText('50%', 'var(--font-md)'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '160px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonGrid(2),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonGrid(3),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonGrid(2),
      ]));
    } else {
      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '8px'),
        this.createSkeletonText('60%', 'var(--font-sm)'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('40%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '80px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('35%', 'var(--font-xs)'),
        this.createSkeletonGrid(3),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('35%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '60px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('40%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '140px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('40%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '100px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('40%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '80px'),
      ]));

      container.appendChild(this.createSkeletonCard([
        this.createSkeletonText('30%', 'var(--font-xs)'),
        this.createSkeletonBlock('100%', '120px'),
      ]));
    }
  }

  static applyStaggerAnimation(container: HTMLElement): void {
    const cards = container.querySelectorAll('.card, .skeleton-card');
    cards.forEach((card, index) => {
      const delayClass = `stagger-${Math.min(index + 1, 8)}`;
      card.classList.add('animate-fade-in-up', delayClass);
    });
  }

  private static createSkeletonCard(children: HTMLElement[]): HTMLElement {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    children.forEach((child) => card.appendChild(child));
    return card;
  }

  private static createSkeletonText(width: string, height?: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'skeleton skeleton-text';
    el.style.width = width;
    if (height) el.style.height = height;
    return el;
  }

  private static createSkeletonBlock(width: string, height: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'skeleton skeleton-block';
    el.style.width = width;
    el.style.height = height;
    return el;
  }

  private static createSkeletonGrid(columns: number): HTMLElement {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.gap = 'var(--spacing-md)';
    grid.style.marginTop = 'var(--spacing-sm)';
    for (let i = 0; i < columns * 2; i++) {
      const item = document.createElement('div');
      item.appendChild(this.createSkeletonText('70%', 'var(--font-xs)'));
      item.appendChild(this.createSkeletonText('50%', 'var(--font-xl)'));
      grid.appendChild(item);
    }
    return grid;
  }
}
