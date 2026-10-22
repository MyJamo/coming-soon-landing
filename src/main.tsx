import { createRoot } from 'react-dom/client';
import { App } from './App';
import { startAnalytics } from './shared/analytics';
import './styles.css';

startAnalytics();
createRoot(document.getElementById('root')!).render(<App />);

// Jamo's face from index.html makes way once the page is drawn under it, and its styles are in: the
// build links them after the face (vite.config.ts), so the script can run before they arrive.
const boot = document.getElementById('boot');
if (boot) {
  const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    boot.classList.add('gone');
    setTimeout(() => boot.remove(), 600);
  }));
  const css = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/assets/"]');
  if (css && !css.sheet) { css.addEventListener('load', go, { once: true }); css.addEventListener('error', go, { once: true }); }
  else go();
}
