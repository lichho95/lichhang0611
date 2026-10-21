import { wedding } from '../wedding.config';

export type Wish = { id: number; guest_name: string; message: string; created_at: string };
export type Result = { ok: boolean; demo?: boolean; pending?: boolean; error?: string };
const WISH_KEY = 'living-ribbon-demo-wishes';
const RSVP_KEY = 'living-ribbon-demo-rsvp';

function safeRead<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}
function safeWrite<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: current preview only */ }
}

async function parseError(res: Response) {
  try { const json = await res.json() as { error?: string }; return json.error || 'Không thể gửi yêu cầu.'; }
  catch { return 'Kết nối không thành công.'; }
}

/**
 * Ở chế độ vite dev server (5173), API chỉ minh họa bằng localStorage.
 * Trên Cloudflare Pages, endpoint /api/* dùng Functions + D1 thật.
 */
export async function loadWishes(): Promise<{ wishes: Wish[]; demo: boolean }> {
  if (import.meta.env.DEV) {
    return { wishes: [...safeRead<Wish[]>(WISH_KEY, []), ...wedding.demoWishes], demo: true };
  }
  try {
    const res = await fetch('/api/wishes', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('No API');
    const json = await res.json() as { wishes: Wish[] };
    return { wishes: json.wishes, demo: false };
  } catch {
    return { wishes: safeRead<Wish[]>(WISH_KEY, []).concat([...wedding.demoWishes]), demo: true };
  }
}

export async function sendWish(payload: { guest_name: string; message: string; website?: string; turnstile_token?: string }): Promise<Result> {
  if (import.meta.env.DEV) {
    const stored = safeRead<Wish[]>(WISH_KEY, []);
    safeWrite(WISH_KEY, [{ id: Date.now(), guest_name: payload.guest_name, message: payload.message, created_at: new Date().toISOString() }, ...stored]);
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch('/api/wishes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return (await res.json()) as Result;
  } catch { return { ok: false, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' }; }
}

export async function sendRSVP(payload: { guest_name: string; attending: boolean; guest_count: number; event_id: string; note: string; website?: string; turnstile_token?: string }): Promise<Result> {
  if (import.meta.env.DEV) {
    safeWrite(RSVP_KEY, [payload, ...safeRead<typeof payload[]>(RSVP_KEY, [])]);
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return (await res.json()) as Result;
  } catch { return { ok: false, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' }; }
}
