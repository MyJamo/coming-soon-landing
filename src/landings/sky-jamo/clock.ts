// 02's day clock, rebuilt so scrolling stays smooth. 02 sets the sky's colours on the page's root, so
// every frame restyles the whole page (thousands of elements in the app windows), and re-renders the
// page on each 5-minute tick. Here the colours go on the sky alone, only when they change; section
// positions are measured on resize instead of every frame; and only the bar's clock re-renders.
import { useEffect, useState } from 'react';
import { DAY_FROM, DAY_TO, SKY } from '../sky/data';

const mix = (a: string, b: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};

/** The sky's values for an hour, as `--sk-*` properties: colours between the two nearest keyframes, the sun on its arc. */
function skyAt(h: number): [string, string][] {
  const i = Math.max(0, SKY.findIndex((_, j) => j === SKY.length - 1 || SKY[j + 1].at > h));
  const a = SKY[i], b = SKY[Math.min(i + 1, SKY.length - 1)];
  const k = b.at === a.at ? 0 : Math.min(1, Math.max(0, (h - a.at) / (b.at - a.at)));
  const t = (h - DAY_FROM) / (DAY_TO - DAY_FROM);
  return [
    ['--sk-top', mix(a.top, b.top, k)], ['--sk-mid', mix(a.mid, b.mid, k)], ['--sk-low', mix(a.low, b.low, k)], ['--sk-sun', mix(a.sun, b.sun, k)],
    ['--sk-t', t.toFixed(3)], ['--sk-sun-x', `${(8 + t * 84).toFixed(2)}vw`], ['--sk-sun-y', `${(62 - Math.sin(t * Math.PI) * 48).toFixed(2)}vh`],
    ['--sk-dusk', Math.max(0, (t - 0.82) / 0.18).toFixed(3)],
  ];
}

/** Paints the sky under `root` for an hour once, for a page whose sky stands still. */
export function paintSky(root: HTMLElement, h: number) {
  const sky = root.querySelector<HTMLElement>('.sk-sky');
  for (const [k, v] of skyAt(h)) sky?.style.setProperty(k, v);
}

/**
 * The hour the page is at. Every `[data-at]` section pins an hour to its middle; between two of them
 * the hour runs on with the scroll. Returns the hour in 5-minute steps, which is all the clock shows.
 */
export function useDayClock(root: React.RefObject<HTMLElement | null>) {
  const [hour, setHour] = useState(DAY_FROM);
  useEffect(() => {
    const el = root.current;
    const sky = el?.querySelector<HTMLElement>('.sk-sky');
    if (!el || !sky) return;
    let raf = 0, measure = 0, step = -1;
    let pins: { y: number; h: number; at: number }[] = [];
    const set = new Map<string, string>();

    const measurePins = () => {
      measure = 0;
      pins = [...el.querySelectorAll<HTMLElement>('[data-at]')].map((s) => {
        const r = s.getBoundingClientRect();
        return { y: r.top + scrollY, h: r.height, at: Number(s.dataset.at) };
      });
      frame();
    };

    const frame = () => {
      raf = 0;
      if (!pins.length) return;
      const mid = scrollY + innerHeight / 2;
      const ys = pins.map((p) => p.y + Math.min(p.h, innerHeight) / 2);
      let h = pins[0].at;
      if (mid >= ys[ys.length - 1]) h = pins[pins.length - 1].at;
      else for (let i = 0; i < pins.length - 1; i++) {
        if (mid >= ys[i] && mid < ys[i + 1]) { h = pins[i].at + (pins[i + 1].at - pins[i].at) * (mid - ys[i]) / (ys[i + 1] - ys[i]); break; }
      }
      for (const [k, v] of skyAt(h)) if (set.get(k) !== v) { set.set(k, v); sky.style.setProperty(k, v); }
      const q = Math.floor(h * 12);
      if (q !== step) { step = q; setHour(q / 12); }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { if (!measure) measure = requestAnimationFrame(measurePins); };
    measurePins();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); ro.disconnect();
      cancelAnimationFrame(raf); cancelAnimationFrame(measure);
    };
  }, [root]);
  return hour;
}
