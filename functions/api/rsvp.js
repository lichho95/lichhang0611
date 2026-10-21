import { json, clean, readPayload, verifyChallenge } from '../../server/common.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Chưa liên kết Cloudflare D1 (binding DB).' }, 503);
  const payload = await readPayload(request);
  if (!payload) return json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, 400);
  if (clean(payload.website, 100)) return json({ ok: true }); // bot honeypot
  const guest_name = clean(payload.guest_name, 70);
  const event_id = clean(payload.event_id, 60);
  const note = clean(payload.note, 500);
  const attending = payload.attending === true;
  const guest_count = attending ? Number(payload.guest_count) : 0;
  if (guest_name.length < 2 || !event_id || !Number.isInteger(guest_count) || guest_count < 0 || guest_count > 5 || (attending && guest_count < 1)) {
    return json({ ok: false, error: 'Vui lòng kiểm tra tên, sự kiện và số khách (1–5).' }, 400);
  }
  if (!(await verifyChallenge(request, env, payload))) return json({ ok: false, error: 'Vui lòng hoàn tất xác minh chống spam.' }, 403);
  try {
    await env.DB.prepare('INSERT INTO rsvps (guest_name, attending, guest_count, event_id, note) VALUES (?, ?, ?, ?, ?)')
      .bind(guest_name, attending ? 1 : 0, guest_count, event_id, note).run();
    return json({ ok: true }, 201);
  } catch { return json({ ok: false, error: 'Không thể lưu xác nhận. Vui lòng thử lại.' }, 500); }
}
