import { json, clean, readPayload, verifyChallenge } from '../../server/common.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'Chưa liên kết Cloudflare D1 (binding DB).' }, 503);
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, guest_name, message, created_at FROM wishes WHERE status = 'approved' ORDER BY created_at DESC, id DESC LIMIT 300"
    ).all();
    return json({ wishes: results || [] });
  } catch { return json({ error: 'Chưa khởi tạo bảng wishes. Xem schema.sql.' }, 503); }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Chưa liên kết Cloudflare D1 (binding DB).' }, 503);
  const payload = await readPayload(request);
  if (!payload) return json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, 400);
  if (clean(payload.website, 100)) return json({ ok: true, pending: true }); // bot honeypot
  const guest_name = clean(payload.guest_name, 70);
  const message = clean(payload.message, 500);
  if (guest_name.length < 2 || message.length < 5) return json({ ok: false, error: 'Tên cần ít nhất 2 ký tự và lời chúc ít nhất 5 ký tự.' }, 400);
  if (!(await verifyChallenge(request, env, payload))) return json({ ok: false, error: 'Vui lòng hoàn tất xác minh chống spam.' }, 403);
  // Mặc định duyệt thủ công. Set MODERATE_WISHES="false" nếu muốn tự công khai.
  const pending = env.MODERATE_WISHES !== 'false';
  try {
    await env.DB.prepare('INSERT INTO wishes (guest_name, message, status) VALUES (?, ?, ?)').bind(guest_name, message, pending ? 'pending' : 'approved').run();
    return json({ ok: true, pending }, 201);
  } catch { return json({ ok: false, error: 'Không thể lưu lời chúc. Vui lòng thử lại.' }, 500); }
}
