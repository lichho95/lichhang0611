import { json, clean, readPayload } from '../../server/common.js';

function checkAuth(request, payload, env) {
  // BẮT BUỘC đặt ADMIN_PIN qua Cloudflare Pages Secrets. Không có mật khẩu mặc định trong production.
  const expectedPin = (env.ADMIN_PIN || '').trim();
  if (!expectedPin || expectedPin.length < 6) return false;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    || request.headers.get('x-admin-pin')
    || (payload && typeof payload.pin === 'string' ? payload.pin.trim() : '');
  return token === expectedPin;
}

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, null, env)) {
    return json({ ok: false, error: 'Mã PIN quản trị không chính xác.' }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: 'Chưa liên kết Cloudflare D1 (binding DB).' }, 503);
  }

  try {
    const rsvpStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_rsvps,
        COALESCE(SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END), 0) as attending_responses,
        COALESCE(SUM(CASE WHEN attending = 1 THEN guest_count ELSE 0 END), 0) as total_attending_guests,
        COALESCE(SUM(CASE WHEN attending = 0 THEN 1 ELSE 0 END), 0) as declined_responses
      FROM rsvps
    `).first();

    const eventStats = await env.DB.prepare(`
      SELECT event_id, COUNT(*) as count, COALESCE(SUM(guest_count), 0) as guests
      FROM rsvps
      WHERE attending = 1
      GROUP BY event_id
    `).all();

    const wishStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_wishes,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as wishes_pending,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as wishes_approved,
        COALESCE(SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END), 0) as wishes_hidden
      FROM wishes
    `).first();

    const wishes = await env.DB.prepare(`
      SELECT id, guest_name, message, status, created_at 
      FROM wishes 
      ORDER BY created_at DESC, id DESC 
      LIMIT 500
    `).all();

    const rsvps = await env.DB.prepare(`
      SELECT id, guest_name, attending, guest_count, event_id, note, created_at 
      FROM rsvps 
      ORDER BY created_at DESC, id DESC 
      LIMIT 500
    `).all();

    return json({
      ok: true,
      stats: {
        total_rsvps: Number(rsvpStats?.total_rsvps || 0),
        attending_responses: Number(rsvpStats?.attending_responses || 0),
        total_attending_guests: Number(rsvpStats?.total_attending_guests || 0),
        declined_responses: Number(rsvpStats?.declined_responses || 0),
        events: eventStats?.results || [],
        total_wishes: Number(wishStats?.total_wishes || 0),
        wishes_pending: Number(wishStats?.wishes_pending || 0),
        wishes_approved: Number(wishStats?.wishes_approved || 0),
        wishes_hidden: Number(wishStats?.wishes_hidden || 0),
      },
      wishes: wishes?.results || [],
      rsvps: rsvps?.results || [],
    });
  } catch (err) {
    return json({ ok: false, error: 'Không thể truy vấn cơ sở dữ liệu: ' + (err?.message || 'Lỗi không xác định') }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const payload = await readPayload(request);
  if (!payload) return json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, 400);

  const action = clean(payload.action, 50);

  // Xử lý đăng nhập / kiểm tra PIN
  if (action === 'login') {
    if (checkAuth(request, payload, env)) {
      return json({ ok: true, message: 'Đăng nhập thành công.' });
    }
    return json({ ok: false, error: 'Mã PIN quản trị không chính xác.' }, 401);
  }

  // Tất cả các hành động khác bắt buộc phải đúng PIN
  if (!checkAuth(request, payload, env)) {
    return json({ ok: false, error: 'Mã PIN quản trị không chính xác hoặc phiên đã hết hạn.' }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: 'Chưa liên kết Cloudflare D1 (binding DB).' }, 503);
  }

  try {
    if (action === 'update_wish_status') {
      const id = Number(payload.id);
      const status = clean(payload.status, 20);
      if (!id || !['approved', 'pending', 'hidden'].includes(status)) {
        return json({ ok: false, error: 'Tham số không hợp lệ.' }, 400);
      }
      await env.DB.prepare('UPDATE wishes SET status = ? WHERE id = ?').bind(status, id).run();
      return json({ ok: true });
    }

    if (action === 'approve_all_wishes') {
      await env.DB.prepare("UPDATE wishes SET status = 'approved' WHERE status = 'pending'").run();
      return json({ ok: true });
    }

    if (action === 'delete_wish') {
      const id = Number(payload.id);
      if (!id) return json({ ok: false, error: 'ID lời chúc không hợp lệ.' }, 400);
      await env.DB.prepare('DELETE FROM wishes WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    if (action === 'delete_rsvp') {
      const id = Number(payload.id);
      if (!id) return json({ ok: false, error: 'ID RSVP không hợp lệ.' }, 400);
      await env.DB.prepare('DELETE FROM rsvps WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Hành động không được hỗ trợ.' }, 400);
  } catch (err) {
    return json({ ok: false, error: 'Lỗi thực thi cơ sở dữ liệu: ' + (err?.message || 'Lỗi không xác định') }, 500);
  }
}
