// Cloudflare Pages Functions common helpers — all API endpoints are same-origin.
export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
export function clean(value, limit) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, limit) : '';
}
export async function readPayload(request) {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return null;
  if (Number(request.headers.get('content-length') || 0) > 8192) return null;
  try { const value = await request.json(); return value && typeof value === 'object' && !Array.isArray(value) ? value : null; }
  catch { return null; }
}
export async function verifyChallenge(request, env, payload) {
  // Khuyến nghị bật TURNSTILE_SECRET khi public. Nếu chưa có secret, anti-spam chỉ là honeypot.
  if (!env.TURNSTILE_SECRET) return true;
  const token = clean(payload.turnstile_token, 2048);
  if (!token) return false;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  try {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = await response.json();
    return Boolean(data.success);
  } catch { return false; }
}
