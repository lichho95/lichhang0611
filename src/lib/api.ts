import { wedding } from '../wedding.config';
import type { InvitationSide, StoredSide, SideFilter } from './invitation-side';

export type Wish = { id: number; guest_name: string; message: string; created_at: string; side?: StoredSide; status?: 'pending' | 'approved' | 'hidden' };
export type Result = { ok: boolean; demo?: boolean; pending?: boolean; error?: string };
export const WISH_KEY = 'living-ribbon-demo-wishes';
export const RSVP_KEY = 'living-ribbon-demo-rsvp';

export type AdminStats = {
  total_rsvps: number;
  attending_responses: number;
  total_attending_guests: number;
  declined_responses: number;
  events: Array<{ event_id: string; count: number; guests: number }>;
  total_wishes: number;
  wishes_pending: number;
  wishes_approved: number;
  wishes_hidden: number;
};

export type AdminWish = {
  id: number;
  guest_name: string;
  message: string;
  status: 'pending' | 'approved' | 'hidden';
  side: StoredSide;
  created_at: string;
};

export type AdminRSVP = {
  id: number;
  guest_name: string;
  attending: number | boolean;
  guest_count: number;
  event_id: string;
  side: StoredSide;
  note: string;
  created_at: string;
};

export type AdminDataResponse = {
  ok: boolean;
  stats: AdminStats;
  wishes: AdminWish[];
  rsvps: AdminRSVP[];
  demo?: boolean;
  error?: string;
};

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
    const stored = safeRead<Wish[]>(WISH_KEY, []);
    const approvedStored = stored.filter(w => !w.status || w.status === 'approved');
    return { wishes: [...approvedStored, ...wedding.demoWishes], demo: true };
  }
  try {
    const res = await fetch('/api/wishes', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('No API');
    const json = await res.json() as { wishes: Wish[] };
    return { wishes: json.wishes, demo: false };
  } catch {
    const stored = safeRead<Wish[]>(WISH_KEY, []);
    const approvedStored = stored.filter(w => !w.status || w.status === 'approved');
    return { wishes: approvedStored.concat([...wedding.demoWishes]), demo: true };
  }
}

export async function sendWish(payload: { guest_name: string; message: string; side: InvitationSide; website?: string; turnstile_token?: string }): Promise<Result> {
  if (import.meta.env.DEV) {
    const stored = safeRead<Wish[]>(WISH_KEY, []);
    safeWrite(WISH_KEY, [{
      id: Date.now(),
      guest_name: payload.guest_name,
      message: payload.message,
      side: payload.side,
      status: 'pending',
      created_at: new Date().toISOString()
    }, ...stored]);
    return { ok: true, demo: true, pending: true };
  }
  try {
    const res = await fetch('/api/wishes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return (await res.json()) as Result;
  } catch { return { ok: false, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' }; }
}

export async function sendRSVP(payload: { guest_name: string; side: InvitationSide; attending: boolean; guest_count: number; event_id: string; note: string; website?: string; turnstile_token?: string }): Promise<Result> {
  if (import.meta.env.DEV) {
    const rsvpItem: AdminRSVP = {
      id: Date.now(),
      guest_name: payload.guest_name,
      attending: payload.attending ? 1 : 0,
      guest_count: payload.guest_count,
      event_id: payload.event_id,
      side: payload.side,
      note: payload.note || '',
      created_at: new Date().toISOString()
    };
    safeWrite(RSVP_KEY, [rsvpItem, ...safeRead<AdminRSVP[]>(RSVP_KEY, [])]);
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return (await res.json()) as Result;
  } catch { return { ok: false, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' }; }
}

// ==================== CÁC HÀM QUẢN TRỊ (ADMIN API) ====================

const DEMO_SEED_RSVPS: AdminRSVP[] = [
  { id: 101, guest_name: 'Trần Văn Hoàng & Bạn', attending: 1, guest_count: 2, event_id: 'wedding', side: 'legacy', note: 'Chúc hai bạn trăm năm hạnh phúc!', created_at: '2026-10-18T14:20:00Z' },
  { id: 102, guest_name: 'Nguyễn Thị Mai', attending: 1, guest_count: 1, event_id: 'wedding', side: 'legacy', note: 'Sẽ có mặt chung vui đúng giờ nhé.', created_at: '2026-10-19T09:15:00Z' },
  { id: 103, guest_name: 'Lê Quang Huy', attending: 0, guest_count: 0, event_id: 'wedding', side: 'legacy', note: 'Hôm đó mình có lịch công tác, gửi lời chúc mừng 2 bạn từ xa nhé!', created_at: '2026-10-20T11:00:00Z' },
];

function getLocalAdminData(): { wishes: AdminWish[]; rsvps: AdminRSVP[]; stats: AdminStats } {
  let wishes = safeRead<AdminWish[]>(WISH_KEY, []);
  if (wishes.length === 0) {
    wishes = [
      { id: 1, guest_name: 'Người bạn thân', message: 'Chúc hai bạn luôn chọn nhau, từ những ngày rực rỡ cho đến những ngày thật bình yên.', status: 'approved', side: 'legacy', created_at: '2026-10-01T09:30:00Z' },
      { id: 2, guest_name: 'Một người thương', message: 'Mong mỗi sớm mai thức dậy, hai bạn đều có lý do để mỉm cười cùng nhau. Trăm năm hạnh phúc nhé!', status: 'approved', side: 'legacy', created_at: '2026-10-02T10:30:00Z' },
      { id: 3, guest_name: 'Đồng nghiệp công ty', message: 'Chúc mừng hạnh phúc hai bạn! Đợi uống rượu mừng nha.', status: 'pending', side: 'legacy', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 4, guest_name: 'Bạn thời đại học', message: 'Hẹn gặp hai bạn ở tiệc cưới thật vui nha!', status: 'pending', side: 'legacy', created_at: new Date().toISOString() },
    ];
    safeWrite(WISH_KEY, wishes);
  }

  let rsvps = safeRead<AdminRSVP[]>(RSVP_KEY, []);
  if (rsvps.length === 0) {
    rsvps = DEMO_SEED_RSVPS;
    safeWrite(RSVP_KEY, rsvps);
  }

  const attendingRsvps = rsvps.filter(r => r.attending === 1 || r.attending === true);
  const totalAttendingGuests = attendingRsvps.reduce((sum, r) => sum + (Number(r.guest_count) || 1), 0);
  const declinedResponses = rsvps.length - attendingRsvps.length;

  const eventMap = new Map<string, { count: number; guests: number }>();
  for (const r of attendingRsvps) {
    const cur = eventMap.get(r.event_id) || { count: 0, guests: 0 };
    cur.count += 1;
    cur.guests += Number(r.guest_count) || 1;
    eventMap.set(r.event_id, cur);
  }

  const events = Array.from(eventMap.entries()).map(([event_id, val]) => ({
    event_id,
    count: val.count,
    guests: val.guests
  }));

  const wishesPending = wishes.filter(w => w.status === 'pending').length;
  const wishesApproved = wishes.filter(w => w.status === 'approved').length;
  const wishesHidden = wishes.filter(w => w.status === 'hidden').length;

  const stats: AdminStats = {
    total_rsvps: rsvps.length,
    attending_responses: attendingRsvps.length,
    total_attending_guests: totalAttendingGuests,
    declined_responses: declinedResponses,
    events,
    total_wishes: wishes.length,
    wishes_pending: wishesPending,
    wishes_approved: wishesApproved,
    wishes_hidden: wishesHidden,
  };

  return { wishes, rsvps, stats };
}

export async function adminLogin(pin: string): Promise<{ ok: boolean; error?: string }> {
  const cleanPin = pin.trim();
  if (!cleanPin) return { ok: false, error: 'Vui lòng nhập mã PIN.' };

  if (import.meta.env.DEV) {
    // Trong môi trường dev: chấp nhận bất kỳ mã PIN nào từ 4 số trở lên (mặc định: 123456)
    if (cleanPin.length < 4) return { ok: false, error: 'Mã PIN cần ít nhất 4 ký tự.' };
    return { ok: true };
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', pin: cleanPin })
    });
    if (!res.ok) {
      const err = await parseError(res);
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch {
    // Không bao giờ báo đăng nhập thành công giả trên bản đã deploy.
    return { ok: false, error: 'Không thể kết nối API quản trị. Hãy kiểm tra Pages Functions.' };
  }
}

export async function fetchAdminData(pin: string): Promise<AdminDataResponse> {
  if (import.meta.env.DEV) {
    const local = getLocalAdminData();
    return { ok: true, stats: local.stats, wishes: local.wishes, rsvps: local.rsvps, demo: true };
  }

  try {
    const res = await fetch('/api/admin', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${pin.trim()}`
      }
    });

    if (!res.ok) {
      const err = await parseError(res);
      const local = getLocalAdminData();
      return { ok: false, stats: local.stats, wishes: [], rsvps: [], error: err };
    }

    const data = await res.json() as AdminDataResponse;
    return { ...data, demo: false };
  } catch {
    const local = getLocalAdminData();
    return { ok: false, stats: local.stats, wishes: [], rsvps: [], error: 'Mất kết nối tới trang quản trị.' };
  }
}

export async function updateWishStatus(pin: string, id: number, status: 'approved' | 'pending' | 'hidden'): Promise<Result> {
  if (import.meta.env.DEV) {
    const wishes = safeRead<AdminWish[]>(WISH_KEY, []);
    const updated = wishes.map(w => w.id === id ? { ...w, status } : w);
    safeWrite(WISH_KEY, updated);
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin.trim()}` },
      body: JSON.stringify({ action: 'update_wish_status', id, status })
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể kết nối API. Lời chúc chưa được cập nhật.' };
  }
}

export async function approveAllWishes(pin: string, side: SideFilter = 'all'): Promise<Result> {
  if (import.meta.env.DEV) {
    const wishes = safeRead<AdminWish[]>(WISH_KEY, []);
    const updated = wishes.map(w => w.status === 'pending' && (side === 'all' || (w.side || 'legacy') === side) ? { ...w, status: 'approved' as const } : w);
    safeWrite(WISH_KEY, updated);
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin.trim()}` },
      body: JSON.stringify({ action: 'approve_all_wishes', side })
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể kết nối API. Chưa duyệt lời chúc.' };
  }
}

export async function deleteWish(pin: string, id: number): Promise<Result> {
  if (import.meta.env.DEV) {
    const wishes = safeRead<AdminWish[]>(WISH_KEY, []);
    safeWrite(WISH_KEY, wishes.filter(w => w.id !== id));
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin.trim()}` },
      body: JSON.stringify({ action: 'delete_wish', id })
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể kết nối API. Chưa xoá lời chúc.' };
  }
}

export async function deleteRSVP(pin: string, id: number): Promise<Result> {
  if (import.meta.env.DEV) {
    const rsvps = safeRead<AdminRSVP[]>(RSVP_KEY, []);
    safeWrite(RSVP_KEY, rsvps.filter(r => r.id !== id));
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin.trim()}` },
      body: JSON.stringify({ action: 'delete_rsvp', id })
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể kết nối API. Chưa xoá RSVP.' };
  }
}
