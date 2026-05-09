import './styles.css';
import { DashboardPage } from './pages/DashboardPage';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Root element #app not found');
}

const dashboard = new DashboardPage(app);
dashboard.mount();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('SW registered:', reg.scope))
    .catch((err) => console.error('SW registration failed:', err));
}
