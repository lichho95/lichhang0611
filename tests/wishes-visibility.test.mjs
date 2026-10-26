import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as getPublicWishes, onRequestPost as postWish } from '../functions/api/wishes.js';

function testEnv() {
  const records = [
    { id: 1, guest_name: 'A', message: 'Chúc mừng nhà trai', status: 'approved', side: 'groom', created_at: '2026-10-23' },
    { id: 2, guest_name: 'B', message: 'Chúc mừng nhà gái', status: 'approved', side: 'bride', created_at: '2026-10-24' },
    { id: 3, guest_name: 'C', message: 'Chưa duyệt', status: 'pending', side: 'bride', created_at: '2026-10-25' },
    { id: 4, guest_name: 'D', message: 'Chưa phân loại', status: 'approved', side: 'legacy', created_at: '2026-10-25' },
  ];
  const calls = [];
  return {
    calls,
    DB: { prepare(sql) {
      const query = { sql, args: [] }; calls.push(query);
      return {
        bind(...args) { query.args = args; return this; },
        async all() {
          assert.match(query.sql, /status\s*=\s*'approved'\s+AND\s+side\s*=\s*\?/);
          return { results: records.filter(r => r.status === 'approved' && r.side === query.args[0]) };
        },
        async run() { return { success: true }; }
      };
    } }
  };
}

test('Public wishes on groom invite only display groom-approved records', async () => {
  const env = testEnv();
  const response = await getPublicWishes({ request: new Request('https://example.pages.dev/api/wishes?side=groom'), env });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.wishes.map(w => w.side), ['groom']);
  assert.deepEqual(env.calls[0].args, ['groom']);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('Public wishes on bride invite only display bride-approved records', async () => {
  const env = testEnv();
  const response = await getPublicWishes({ request: new Request('https://example.pages.dev/api/wishes?side=bride'), env });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.wishes.map(w => w.side), ['bride']);
  assert.deepEqual(env.calls[0].args, ['bride']);
});

test('Public wishes require a valid side; no unfiltered fallback', async () => {
  for (const param of ['', '?side=all', '?side=legacy', '?side=other']) {
    const env = testEnv();
    const response = await getPublicWishes({ request: new Request(`https://example.pages.dev/api/wishes${param}`), env });
    assert.equal(response.status, 400);
    assert.equal(env.calls.length, 0);
  }
});

test('Post still stores selected side without affecting the approval workflow', async () => {
  const env = testEnv();
  const response = await postWish({
    request: new Request('https://example.pages.dev/api/wishes', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ guest_name: 'Người bạn', message: 'Chúc hai bạn mãi hạnh phúc', side: 'bride' })
    }), env
  });
  assert.equal(response.status, 201);
  assert.deepEqual(env.calls[0].args, ['Người bạn', 'Chúc hai bạn mãi hạnh phúc', 'pending', 'bride']);
});
