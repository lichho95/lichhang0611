# V9.2 — Việt hóa câu chữ The Living Ribbon

> Base: `the-living-ribbon-animation-v9-1-opening-fix.zip` (không thay bằng code V9/V8 cũ).

## Nội dung đã cập nhật

| Khu vực | Câu chữ hiển thị |
| --- | --- |
| Phong bì một bên | **Trân trọng kính mời**; **Ngày vui của chúng mình** |
| Chọn hai phong bì | **Có một lời mời dành cho bạn…**; **Niềm vui của hai gia đình** |
| Hero | **Ngày hạnh phúc của**; **Từ hôm nay, mình có nhau** |
| Thiệp chính | **Hai trái tim · Một lời hẹn ước**; **Niềm vui của hai gia đình** |
| Lịch ngày cưới | **THÁNG HAI · 14 · CHỦ NHẬT · 2027** (lấy ngày thực theo `invitations[side].date`) |
| Card lễ cưới | **Nghi lễ**; **Tiệc mừng** |
| Chuyện chúng mình | **Từ những điều thật nhỏ**; **Ngày đầu gặp gỡ**; **Mãi bên nhau** |
| Gallery | **Khoảnh khắc còn mãi**; **Thương trong từng khung hình**; caption trên ảnh hoàn toàn bằng tiếng Việt |
| Lời chúc | **Từ những người thương**; **Những lá thư thương mến**; **Để lời thương thành kỷ niệm**; **Lá thư số…** |
| RSVP | **Mong nhận được hồi âm** (form và hai trạng thái giữ nguyên) |
| Quà mừng | **Thay lời cảm ơn**; **Một chút tấm lòng** |
| Footer | **Khởi đầu của một đời bên nhau**; **Được dệt nên từ yêu thương** |
| Social metadata | Thẻ tiêu đề/mô tả chia sẻ bằng tiếng Việt |

## File được chỉnh

- `src/App.tsx`: toàn bộ nhãn trang khách, captions, ghi chú Polaroid, lịch Việt hóa; ngày chú thích của Gallery lấy theo đúng thiệp nhà trai/nhà gái.
- `src/components/FragmentsHeading.tsx`: chữ ghép theo thứ tự ký tự vẫn giữ animation, chuyển thành **KHOẢNH KHẮC CÒN MÃI**.
- `src/components/JourneyTransition.tsx`: `CHAPTER` → `CHƯƠNG`.
- `src/components/MemoryCard.tsx`: dấu kỷ niệm **NGÀY ĐẦU GẶP GỠ**, **MÃI BÊN NHAU**.
- `src/components/TwoHalvesHeart.tsx`: **HAI NỬA · MỘT TRÁI TIM**.
- `src/wedding.config.ts`: quote và lời cảm ơn được Việt hóa.
- `src/styles.css`: bổ sung kiểu chữ an toàn cho dấu tiếng Việt, tránh cắt chữ trên mobile, điều chỉnh card/nhãn có độ dài mới.
- `index.html`: tiêu đề, mô tả khi chia sẻ link bằng tiếng Việt.

## Cách sửa nhanh câu chữ

Các chuỗi giao diện cố định: `src/App.tsx` và `src/components/`.

Các nội dung có tính cá nhân: `src/wedding.config.ts`. Để thay ngày tổ chức, dùng `invitations.groom.date` và `invitations.bride.date` (ngày giờ có offset `+07:00`). Ngày trên vòng lịch, thứ và tên tháng tự tính lại theo bên đang xem. Trong `invitations[side].dateText`, hãy cập nhật ngày hiển thị lớn tương ứng khi đổi ngày vì đây vẫn là chuỗi dữ liệu cấu hình sẵn.

Mã và khóa dữ liệu như `side`, `groom`, `bride`, `event_id`, API, CSS class và DB schema **không đổi**. Không cần migration DB V9.2. Hai phong bì, hiệu ứng Motion, hai thiệp, RSVP, lời chúc và Admin Dashboard vẫn nguyên cơ chế.

## Đã kiểm tra / Giới hạn

- Kiểm tra cú pháp: 22 file TS/TSX/JS, không lỗi parse.
- Kiểm tra CSS: không lỗi parse cấp stylesheet.
- Kiểm tra bố cục tham khảo bằng Chromium tại 320 / 360 / 390 / 430 / 768 / 1280px: không có tràn ngang; chữ lịch không đè vào vòng ngày; hai phong bì không bị cắt.
- Không xác nhận `npm run build` hay animation Motion trong bản React hoàn chỉnh vì môi trường thiếu cached dependency npm (`youch-core`). Cần chạy `npm ci && npm run build` trên máy có kết nối registry và kiểm tra Safari/Chrome mobile trước khi deploy.

**Lưu ý:** Để đồng nhất hình thumbnail khi chia sẻ, nếu `public/og-cover.jpg` có chữ tiếng Anh nằm *bên trong ảnh*, bạn cần thay bằng hình mới (thẻ metadata đã được Việt hóa). Không chỉnh sửa ảnh gốc trong lần cập nhật này.
