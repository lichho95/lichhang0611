import { useEffect, useRef } from 'react';
import { wedding } from '../wedding.config';

type TurnstileAPI = {
  render: (element: HTMLElement, options: { sitekey: string; theme: string; callback: (token: string) => void; 'expired-callback': () => void }) => string;
  remove?: (id: string) => void;
};

/** Hiện captcha chỉ khi set wedding.turnstileSiteKey. Cần set TURNSTILE_SECRET cùng cặp trên Cloudflare. */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const sitekey = wedding.turnstileSiteKey as string;
  useEffect(() => {
    if (!sitekey || !element.current) return;
    let cancelled = false;
    let widgetId = '';
    let interval: number | undefined;
    const getAPI = () => (window as unknown as { turnstile?: TurnstileAPI }).turnstile;
    const renderIfReady = () => {
      const api = getAPI();
      if (!cancelled && api && element.current && !widgetId) {
        widgetId = api.render(element.current, {
          sitekey,
          theme: 'light',
          callback: onToken,
          'expired-callback': () => onToken(''),
        });
        if (interval) window.clearInterval(interval);
      }
    };
    const scriptId = 'cloudflare-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }
    renderIfReady();
    interval = window.setInterval(renderIfReady, 200);
    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      if (widgetId) getAPI()?.remove?.(widgetId);
    };
  }, [sitekey, onToken]);
  return sitekey ? <div className="turnstile-wrap" ref={element} aria-label="Xác minh chống spam" /> : null;
}
