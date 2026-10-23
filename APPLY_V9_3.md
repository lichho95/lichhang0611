# Cách cập nhật V9.3 (không mất ảnh và dữ liệu)

1. Sao lưu project đang chạy.
2. Giải nén toàn bộ ZIP V9.3 vào **thư mục gốc** project hiện có, cho phép ghi đè các file trùng tên trong `src/`.
3. **Không xóa** thư mục `public/`: V9.3 không chứa ảnh/nhạc cá nhân của bạn vì file ZIP nguồn gửi lên đã lược bỏ chúng.
4. Giữ nguyên `package-lock.json` có sẵn, `.env`, cấu hình Cloudflare và Secrets (nếu có).
5. Chạy `npm run build` và `npm run dev` để kiểm tra.
6. Nếu ảnh Hero bị crop, chỉnh `src/wedding.config.ts` → `image.heroPositionMobile` và `image.heroPositionDesktop`.

Không cần migration Cloudflare D1. Admin/API được bảo toàn.

Chi tiết: `docs/V9_3_HERO_OPENING_GALLERY.md`.
