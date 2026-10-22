import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost as sendRsvp } from '../functions/api/rsvp.js';
import { onRequestPost as sendWish } from '../functions/api/wishes.js';
import { onRequestPost as adminPost } from '../functions/api/admin.js';
function makeEnv() {
  const calls = [];
  return { calls, DB: { prepare(sql) { const entry = { sql, args: [] }; return {
    bind(...args) { entry.args = args; return this; },
    async run() { calls.push(entry); return { success: true }; },
    async first() { return {}; },
    async all() { return { results: [] }; }
  }; } }, ADMIN_PIN: 'secure-test-pin' };
}
function req(body, authorization) { return new Request('https://example.pages.dev/api/test', { method:'POST', headers: { 'Content-Type':'application/json', ...(authorization ? {Authorization:`Bearer ${authorization}`} : {}) }, body: JSON.stringify(body) }); }
test('RSVP stores groom & bride side in D1 without asking guest', async () => {
  const env = makeEnv();
  for(const side of ['groom','bride']) {
    const response = await sendRsvp({ request:req({ guest_name:'Nguyễn Văn A', attending:true, guest_count:1, note:'Hẹn gặp!', event_id:'wedding', side }), env });
    assert.equal(response.status,201);
  }
  assert.deepEqual(env.calls.map(c => c.args.at(-1)), ['groom','bride']);
});
test('Reject missing/invalid side', async () => {
  const env = makeEnv();
  for(const side of [undefined,'legacy','unknown']) {
    const response = await sendRsvp({ request:req({guest_name:'Nguyễn Văn A',attending:true,guest_count:1,event_id:'wedding',side}), env });
    assert.equal(response.status,400);
  }
  assert.equal(env.calls.length,0);
});
test('Wish has moderation and side', async()=>{
  const env=makeEnv();
  const response=await sendWish({request:req({guest_name:'Mai Anh',message:'Chúc mừng hạnh phúc hai bạn',side:'bride'}),env});
  assert.equal(response.status,201);
  assert.deepEqual(env.calls[0].args,['Mai Anh','Chúc mừng hạnh phúc hai bạn','pending','bride']);
});
test('Admin bulk approval honors side filter',async()=>{
  const env=makeEnv();
  const response=await adminPost({request:req({action:'approve_all_wishes',side:'bride'},env.ADMIN_PIN),env});
  assert.equal(response.status,200);
  assert.match(env.calls[0].sql, /side\s*=\s*\?/);
  assert.deepEqual(env.calls[0].args,['bride']);
});
