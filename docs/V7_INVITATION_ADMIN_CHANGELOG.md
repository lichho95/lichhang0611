# V7 — Wedding Invitation · Two Halves, One Heart

## Nguồn cập nhật

**Toàn bộ thay đổi dựa trên ZIP được người dùng gửi:** `the-living-ribbon-animation-v6-1-update.zip`. Không thay bằng source V6.1 cũ.

## Cấu trúc trang sau cập nhật

1. Opening envelope → Hero (giữ các animation hiện có)
2. **Thiệp mời ngày chung đôi** (gộp `TWO SOULS · ONE STORY` và phần `Ngày mình chung đôi`)
   - Gia đình nhà trai và nhà gái; họ tên cô dâu/chú rể
   - **Two Halves, One Heart**: nhân vật SVG silhouette chuyển động đồng thời từ hai phía, ghép hai nửa tim; dải lụa SVG vẽ theo sau
   - Countdown, ngày cưới và vòng SVG chỉ bao số ngày 14
   - Lễ thành hôn và Tiệc cưới xuất hiện từ hai bên với delay 0 trên desktop; trên mobile từng card trigger khi cuộn tới
   - Lời mời cá nhân hóa nếu URL cung cấp guest name (logic tên khách giữ nguyên)
3. Chuyện chúng mình: giữ đầy đủ hiệu ứng chim bồ câu mang ảnh
4. **Những ký ức của mình**: gộp Gallery vào section duy nhất; vẫn giữ tiêu đề phụ `FRAGMENTS OF FOREVER`; có nút “Xem toàn bộ album ảnh” mở lightbox
5. Những lời yêu thương: giữ Ribbon of Wishes, chuyển **form** sang modal, để lại nút viết lời chúc
6. Hộp quà và cảm ơn (giữ nguyên)

**Bỏ:** `CHAPTER ONE`/Memory Portal, phần Couple riêng, section RSVP chiếm toàn bộ trang và section Gallery trùng tên cũ.

## RSVP không gián đoạn

- Sau khi người xem CUỘN QUA phần thiệp mời, nút pill cố định mới xuất hiện ở góc dưới bên phải.
- Không bao giờ tự bật modal; chỉ mở khi khách nhấn pill hoặc nút trên menu.
- Sau khi gửi thành công, pill chuyển `Đã xác nhận`. Trong bản demo localhost dữ liệu chỉ được lưu ở localStorage.
- Popup và form giữ `sendRSVP()`/Cloudflare D1, validation/honeypot/Turnstile và phần chọn sự kiện.

## Admin — bảo toàn công việc người dùng

Giữ trang `AdminDashboard.tsx`, thống kê, duyệt/ẩn/xóa lời chúc, danh sách RSVP, export CSV, các API quản trị và schema D1 có cột `status`.

**Cải thiện an toàn quan trọng:** bỏ PIN mặc định 123456 trong Pages Function; buộc khai báo `ADMIN_PIN` tối thiểu 6 ký tự trong **Cloudflare Secrets**. Không chấp nhận `?pin=...` trên query URL; không giả báo thao tác đã lưu trên D1 khi mạng thất bại. Dev server vẫn có admin demo local.

Nếu bản đã deploy trước đó dựa vào PIN 123456, cần thiết lập secret mới rồi redeploy trước khi dùng admin thật.

## Những file cần tùy chỉnh

- `src/wedding.config.ts`: tên hai gia đình, tên cô dâu/chú rể, ngày, địa điểm, ảnh, nhạc, QR; **giữ nguyên comment kích thước ảnh và file ảnh hiện có từ ZIP người dùng.**
- `src/components/TwoHalvesHeart.tsx`: sửa silhouette SVG, thời gian, đường ghép hai nửa trái tim. Không phải bổ sung ảnh asset.
- `src/styles.css`: nhóm quy tắc `V7 — Modern Traditional Wedding Invitation` ở cuối file (responsive tại 680 px).
- `src/App.tsx`: `WeddingInvitation`, `RSVPForm`, `WishesSection`, `App` (Floating RSVP) và `Modal`.
- `src/components/FragmentsHeading.tsx`: tên Gallery mới.
- `functions/api/admin.js`: policy PIN production.

## Chạy dự án

```bash
npm ci
npm run dev
npm run build
```

Để lưu dữ liệu trên Cloudflare, liên kết D1 với binding `DB`, chạy `schema.sql`, và đặt secret `ADMIN_PIN`; xem README.

## Kiểm thử và giới hạn

- Đã kiểm tra cú pháp TS/TSX bằng TypeScript transpiler; cú pháp JS Function bằng Node.
- Đã kiểm tra layout CSS/HTML đại diện bằng Chromium ở 360, 390, 430, 768, 1280 px: không tràn ngang và vòng 14 không chạm tháng/năm.
- Vì npm registry không khả dụng trong môi trường này, **chưa xác nhận `npm run build` hay kiểm thử Motion trực tiếp trong app React**.
- Kiểm tra tiếp trên iOS Safari / Chrome Android: scroll qua thiệp → pill xuất hiện → mở RSVP; gửi lời chúc → chờ duyệt trong admin; replay → animation chạy lại.
