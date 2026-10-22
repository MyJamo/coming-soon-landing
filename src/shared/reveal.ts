// Adds `is-in` to every `[data-reveal]` under the root once it scrolls into view. Each landing styles
// its own entrance from that class; under reduced motion the landings show everything at once.
import { useEffect, type RefObject } from 'react';

export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    const watch = (under: Element) => {
      if (under.matches('[data-reveal]')) io.observe(under);
      under.querySelectorAll('[data-reveal]').forEach((i) => io.observe(i));
    };
    watch(el);
    // Parts that load after the first screen bring their own; only what was added is looked through.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => { if (n instanceof Element) watch(n); });
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [root]);
}

/** Sets the page background while a landing is mounted, so overscroll shows the landing's ground. */
export function useBodyGround(color: string) {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = color;
    return () => { document.body.style.background = prev; };
  }, [color]);
}
