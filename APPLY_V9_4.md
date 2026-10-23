# The Living Ribbon — V9.4

Bản vá **source-only** cập nhật từ V9.3: Opening một lần duy nhất, Hero mobile/tablet theo mockup, Gallery tránh hiển thị ảnh sai thứ tự.

## Cập nhật nhanh

Giải nén vào project đang chạy; nên sao lưu `src/App.tsx` và `src/styles.css` trước. **Không xóa `public/`** vì ZIP không bao gồm ảnh, nhạc/video cá nhân và không bao gồm `node_modules`.

Các file chính đã sửa:
- `src/App.tsx`
- `src/styles.css`

Admin, Cloudflare D1, API và file cấu hình riêng của bạn vẫn giữ nguyên.

Chi tiết kiểm tra: `docs/V9_4_OPENING_HERO_GALLERY_FIX.md`.

**Hạn chế xác minh:** bản này đã được kiểm tra syntax/API và bố cục tĩnh trên Chromium, nhưng chưa build/chạy được React Motion thực tế do npm install gặp timeout. Cần kiểm tra trên Safari/Chrome của điện thoại trước khi phát thiệp.
