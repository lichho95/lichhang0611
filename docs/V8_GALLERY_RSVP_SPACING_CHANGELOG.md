# The Living Ribbon — V8 polish

V8 tiếp tục trực tiếp từ **V7 đã có Admin Dashboard**, không thay thế hoặc xóa chức năng duyệt/ẩn/xóa lời chúc, xuất dữ liệu CSV hay Cloudflare D1 API.

## Những thay đổi giao diện

1. **Thiệp mời / ngày cưới:** căn tuyệt đối tâm số `14` trong vòng SVG, tách hoàn toàn vòng khỏi February và `2027 Sunday`; nâng font hai nhãn và cân chiều rộng ở 320–1280 px.
2. **Story:** rút khoảng cách giữa nhãn `EVERY LOVE STORY IS BEAUTIFUL`, tiêu đề `Chuyện chúng mình` và caption; giảm khoảng trống dư trong các section.
3. **Gallery:** đổi tên thành **Những khung hình yêu**, sửa phần mô tả. Trên desktop, bố cục sáu ảnh chồng lên nhau như collage Polaroid; trên mobile hiển thị một ảnh trước mặt và hai lớp ảnh phía sau, có thể vuốt sang ảnh khác, bấm để phóng to và bấm **Xem toàn bộ album ảnh** để vào lightbox.
4. **RSVP modal:** hai tab `Mình sẽ đến` và `Rất tiếc, không thể`; mỗi tab chỉ hiển thị Tên và Lời nhắn/Lời chúc. Honeypot/Turnstile vẫn chạy ngầm nếu được bật.
5. **Popup:** nhất quán backdrop blur nhẹ và motion spring cho RSVP, gửi lời chúc, hộp quà và video; lightbox có chuyển cảnh ảnh mềm hơn. Có hỗ trợ Reduced Motion.
6. **Admin RSVP:** từ V8, không còn chọn sự kiện trong form. Các phản hồi mới lưu `event_id = "wedding"`, có nhãn **Toàn bộ lễ cưới** trên Admin; dữ liệu và bộ lọc lễ/tiệc từ những bản cũ vẫn giữ được.

## Ảnh cần thay

Thay đường dẫn trong `src/wedding.config.ts`, không sửa JSX. Gallery khuyến nghị WebP **1200×1600 px (3:4)**, chất lượng 80–90, hoặc ảnh ngang **1600×1200 px (4:3)**. Để xem ảnh khung Polaroid đẹp nhất, tránh cắt sát mặt vào viền ảnh vì CSS dùng `object-fit: cover`.

Các ảnh demo trong project hiện tại được cắt từ mockup và có độ phân giải thấp. V8 không thêm blur; ảnh thật cần thay để có độ nét tốt.

## Kiểm thử

- TypeScript/TSX: đã parse bằng TypeScript transpiler toàn bộ file chỉnh sửa.
- Layout HTML/CSS đại diện (không phải app React đang chạy): đã mở bằng Chromium ở các viewport 320, 360, 390, 430, 768, 1280 px, không tràn ngang. Tâm số 14 trùng tâm vòng trong phép đo Bounding Client Rect ở cả 6 kích thước.
- Chưa chạy được `npm run build` / kiểm thử animation Motion tương tác trên ứng dụng thật vì môi trường chưa cài được dependencies qua npm registry. Cần chạy lại sau khi `npm ci` trên máy phát triển.

## Test nhanh

```bash
npm ci
npm run dev
npm run build
```

Kiểm tra trên Chrome Android và Safari iOS: Gallery vuốt để đổi ảnh, chạm mở lightbox, RSVP hai tab có thể gửi, Admin hiển thị RSVP dưới nhãn `Toàn bộ lễ cưới`, Popup mở/đóng không giật, và vòng tròn 14 không bị lệch.
