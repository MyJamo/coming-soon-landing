// Google Analytics: property "MyJamo Web" (services@myjamo.com), stream "Coming soon". Only built
// pages report; `npm run dev` loads nothing.

const ID = 'G-81GHWLS3L5';

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

export function startAnalytics() {
  if (!import.meta.env.PROD) return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads `arguments` objects off the queue, not arrays.
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.append(script);
}

/** An event for GA. A no-op in dev, and never given the contact itself. */
export function track(event: string, params?: Record<string, string>) {
  window.gtag?.(event, params);
}
