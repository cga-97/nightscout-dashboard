export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    const result = await Notification.requestPermission();
    this.permission = result;
    return result === 'granted';
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  sendSevereHypoAlert(value: number): void {
    if (this.permission !== 'granted') return;

    new Notification('Severe Hypoglycemia Alert', {
      body: `Glucose is ${Math.round(value)} mg/dL — below 54. Take action immediately!`,
      icon: '/icon-192x192.png', // we'll use a generic path
      requireInteraction: true,
      tag: 'severe-hypo',
    });
  }

  sendHyperAlert(value: number): void {
    if (this.permission !== 'granted') return;

    new Notification('High Glucose Alert', {
      body: `Glucose is ${Math.round(value)} mg/dL — above 250. Check for ketones.`,
      icon: '/icon-192x192.png',
      tag: 'severe-hyper',
    });
  }
}
