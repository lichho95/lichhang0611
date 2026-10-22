-- Chạy MỘT LẦN trên D1 CŨ sau khi sao lưu; KHÔNG chạy trên DB mới đã dùng schema.sql V9.
-- Dữ liệu đã tồn tại không được tự gán nhà trai / nhà gái; dùng 'legacy'.
ALTER TABLE wishes ADD COLUMN side TEXT NOT NULL DEFAULT 'legacy' CHECK(side IN ('groom','bride','legacy'));
ALTER TABLE rsvps ADD COLUMN side TEXT NOT NULL DEFAULT 'legacy' CHECK(side IN ('groom','bride','legacy'));
CREATE INDEX IF NOT EXISTS idx_wishes_side_status ON wishes(side,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_side_date ON rsvps(side,created_at DESC);
