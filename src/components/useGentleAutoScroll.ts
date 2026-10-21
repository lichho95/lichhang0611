import { useEffect } from 'react';

/**
 * GENTLE AUTO STORY SCROLL (V8.3)
 *
 * Starts only AFTER the guest opens the invitation and stays idle.
 * Every step scrolls a fraction of the viewport, gently (not to the next entire chapter).
 * The first real interaction stops auto-scrolling until the next opening/replay.
 * Never moves while a dialog, menu, lightbox, input, or the Admin screen is active.
 * Fully disabled for prefers-reduced-motion.
 *
 * Timing/distance are configurable in src/wedding.config.ts.
 * No scroll listener: our own programmatic scrolling must not count as guest activity.
 */
export function useGentleAutoScroll({
  enabled,
  idleDelayMs = 10000,
  intervalMs = 9000,
  stepViewport = 0.63,
}: {
  enabled: boolean;
  idleDelayMs?: number;
  intervalMs?: number;
  stepViewport?: number;
}) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let stopped = false;
    let timer: number | undefined;
    let frame: number | undefined;
    let lastAutoScrollAt = -Infinity;

    const cancelMotion = () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = undefined;
    };
    const stopForGuest = () => {
      stopped = true;
      window.clearTimeout(timer);
      cancelMotion();
    };
    const isBusy = () => {
      const focus = document.activeElement;
      const editing = focus instanceof HTMLElement &&
        (focus.matches('input, textarea, select, [contenteditable="true"]') || focus.isContentEditable);
      return document.hidden || editing || Boolean(document.querySelector(
        '[role="dialog"], .modal-backdrop, .lightbox-backdrop, .mobile-nav'
      ));
    };
    const schedule = (delay: number) => {
      window.clearTimeout(timer);
      if (!stopped) timer = window.setTimeout(step, delay);
    };
    const step = () => {
      if (stopped) return;
      if (isBusy()) { schedule(intervalMs); return; }
      const startY = window.scrollY;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const distance = Math.round(window.innerHeight * stepViewport);
      const endY = Math.min(maxY, startY + distance);
      if (endY - startY < 16) return; // The story has reached its end.

      const duration = 1800;
      let startedAt: number | undefined;
      const animate = (time: number) => {
        if (stopped || isBusy()) { cancelMotion(); if (!stopped) schedule(intervalMs); return; }
        if (startedAt === undefined) startedAt = time;
        const t = Math.min(1, (time - startedAt) / duration);
        // Sine ease-in-out: starts and ends more softly than a native smooth jump.
        const progress = (1 - Math.cos(Math.PI * t)) / 2;
        lastAutoScrollAt = window.performance.now();
        window.scrollTo({ top: startY + (endY - startY) * progress, behavior: 'instant' });
        if (t < 1) frame = window.requestAnimationFrame(animate);
        else { frame = undefined; schedule(intervalMs); }
      };
      frame = window.requestAnimationFrame(animate);
    };

    // Keyboard navigation, touch, click and wheel all immediately hand control to the guest.
    // Also detect dragging the browser scrollbar / anchor jumps without mouse-wheel events.
    // Ignore scroll events caused by our own RAF animation (and its last frame).
    const onScroll = () => {
      if (window.performance.now() - lastAutoScrollAt > 350) stopForGuest();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Returning to a background tab should start a fresh idle countdown, not jump instantly.
    const onVisibilityChange = () => {
      if (!document.hidden && !stopped) schedule(idleDelayMs);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin'] as const;
    events.forEach(event => window.addEventListener(event, stopForGuest, { capture: true, passive: true }));
    schedule(idleDelayMs);
    return () => {
      window.clearTimeout(timer);
      cancelMotion();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      events.forEach(event => window.removeEventListener(event, stopForGuest, true));
    };
  }, [enabled, idleDelayMs, intervalMs, stepViewport]);
}
