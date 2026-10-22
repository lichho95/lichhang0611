-- Triển khai bằng: npx wrangler d1 execute wedding-db --remote --file=./schema.sql
CREATE TABLE IF NOT EXISTS wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'legacy' CHECK(side IN ('groom','bride','legacy')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','hidden')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_wishes_status_created_at ON wishes(status, created_at DESC);

CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  attending INTEGER NOT NULL CHECK(attending IN (0,1)),
  guest_count INTEGER NOT NULL CHECK(guest_count BETWEEN 0 AND 5),
  event_id TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'legacy' CHECK(side IN ('groom','bride','legacy')),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wishes_side_status ON wishes(side,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_side_date ON rsvps(side,created_at DESC);
