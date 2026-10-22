// Google Analytics: property "MyJamo Web" (services@myjamo.com), stream "Landing". Only built pages
// report; `npm run dev` loads nothing.
//
// The pages route by hash, so #/download is reported as /download. The stream's own history-based
// page views are off, or every in-page anchor (#sk-join) would count as a page.

const ID = 'G-GCX9L5TBDE';

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

/** The address as GA should see it: a hash route as a path, the query (utm_*) kept, anchors dropped. */
function pageUrl() {
  const url = new URL(location.href);
  const route = url.hash.match(/^#\/(.+)/)?.[1];
  if (route) url.pathname = `/${route}`;
  url.hash = '';
  return url.href;
}

export function startAnalytics() {
  if (!import.meta.env.PROD) return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads `arguments` objects off the queue, not arrays.
  window.gtag = function () { window.dataLayer!.push(arguments); };
  let page = pageUrl();
  window.gtag('js', new Date());
  window.gtag('set', { page_location: page });
  window.gtag('config', ID);
  addEventListener('hashchange', () => {
    if (pageUrl() === page) return;
    page = pageUrl();
    window.gtag!('set', { page_location: page });
    window.gtag!('event', 'page_view');
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.append(script);
}

/** An event for GA. A no-op in dev, and never given the contact itself. */
export function track(event: string, params?: Record<string, string>) {
  window.gtag?.(event, params);
}
