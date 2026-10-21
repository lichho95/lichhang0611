# The Living Ribbon V8.1 — Mobile Animation & RSVP Popup Fix

Bản này được sửa trực tiếp từ `the-living-ribbon-animation-v8.zip`. Không thay đổi thiết kế đã duyệt, dữ liệu cưới, backend, API hay Admin Dashboard.

## 1. Animation Thiệp mời · ngày chung đôi trên mobile

- File: `src/components/TwoHalvesHeart.tsx`
- Nguyên nhân: `whileInView` được gắn riêng cho từng SVG `<g>`, `<circle>`, `<path>` và `<p>`. Việc IntersectionObserver xác định bounding box của SVG con có thể thiếu ổn định trên trình duyệt mobile.
- Sửa: đặt `ref` ở phần tử HTML `.hearts-ceremony`, kích hoạt bằng một `useInView(ref, { once: true, amount: 0.15, margin: '0px 0px -8% 0px' })` chung; mọi nhân vật, nửa tim, dải lụa và caption cùng dựa vào trạng thái này.
- File: `src/App.tsx`: tiêu đề **Thiệp mời · ngày chung đôi** cũng có hiệu ứng entrance trên `<motion.h2>` (HTML) với `whileInView`, và có đường đi ngay tới trạng thái cuối khi OS bật Reduced Motion.
- Animation replay vẫn hoạt động vì App remount `<main key={animationCycle}>` mỗi lần phát lại.

## 2. Popup RSVP trên mobile

- File: `src/App.tsx`: thêm `variant="rsvp"` khi mở Modal và class `.modal-card-rsvp` riêng, tránh tác động vào popup lời chúc, quà và video.
- File: `src/styles.css`: giới hạn chiều rộng phần caption để luôn chừa một vùng riêng cho nút close; căn lề lại khi viewport hẹp.
- Vô hiệu hóa chỉ riêng `::before` và `::after` của `.rsvp-form` trong modal; viền góc trang trí cũ trước đây chạm nút **Gửi lời xác nhận**.
- Giữ nguyên hai tab `Mình sẽ đến` / `Rất tiếc, không thể` và field của V8.

## 3. Kiểm tra

- TypeScript / TSX: `transpileModule` (TypeScript 5, chỉ kiểm tra cú pháp) — đạt.
- CSS: `tinycss2` parse — không có lỗi cú pháp.
- Layout popup kiểm tra bằng Chromium HTML/CSS tại 320, 360, 390, 430, 768, 1280 px: không có tràn ngang; vùng caption không giao nút đóng; `rsvp-form::after` có content `none`.
- Ngưỡng IntersectionObserver của wrapper HTML kiểm tra trong Chromium tại 320, 360, 390, 430, 768, 1280 px: không kích hoạt trước khi cuộn; kích hoạt sau khi vào viewport.
- Đã so byte và xác nhận giữ nguyên: `src/components/AdminDashboard.tsx`, `functions/api/admin.js`, `functions/api/rsvp.js`, `functions/api/wishes.js`, `src/lib/api.ts`, `src/wedding.config.ts`.

**Giới hạn:** Môi trường hiện tại không có npm dependencies đầy đủ nên chưa chạy được React/Vite build hoặc hoạt cảnh Motion trong ứng dụng thật. Bạn nên thử trên Safari iOS/Chrome Android sau khi chạy `npm ci && npm run dev`.
