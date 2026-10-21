# Animation V5 — Love Messengers / Đôi bồ câu đưa ký ức

## Tổng quan

Section **Chuyện chúng mình** đã được nâng cấp với chim bồ câu Fine Art minh họa bằng SVG (không cần PNG/GIF/video hoặc thư viện mới). Các thay đổi chỉ nằm ở component `MemoryCard`, component mới `DoveCourier`, CSS cuối file và một tùy chọn config. Gallery, RSVP, quà cưới, ảnh Hero và bố cục các section khác được giữ nguyên từ V4.

## Ba hoạt cảnh

1. **Ngày ta gặp nhau:** chim bay từ bên trái, mang thumbnail của ảnh đầu tiên bằng một sợi lụa đỏ; card Polaroid hạ xuống vị trí hiện có, băng dán và dấu `FIRST HELLO` xuất hiện; chim bay sang phải và biến mất.
2. **Những điều bé nhỏ:** chim bay từ bên phải, mang ảnh thứ hai; ảnh được đặt xuống, băng dính và các dấu ký ức hội tụ, sau đó chim bay ra phía trái.
3. **Một lời hẹn mãi mãi:** hai chim từ hai phía cùng bay đến; chim bên trái mang ảnh cuối, chim bên phải đi theo mang ý nghĩa lời hẹn; ảnh gắn vào timeline, hai vòng nhẫn được vẽ và con dấu `FOREVER` xuất hiện; chim rời đi.

Từng card chỉ chạy **một lần** khi bản thân card xuất hiện trong viewport, không chạy đồng loạt toàn bộ khi phần Story vừa bắt đầu. Trên desktop các card có thể cùng bắt đầu nếu cùng được nhìn thấy; trên mobile chúng lần lượt được gửi tới khi bạn scroll.

## Điều chỉnh

- `src/components/DoveCourier.tsx`: đường bay ở biến `journey`; duration 3.55 giây (chim chính), 3.8 giây (chim phụ). Thay đổi `x`/`y` để điều chỉnh quỹ đạo. `delay` giúp lệch nhịp giữa hai chim ở card cuối.
- `src/components/MemoryCard.tsx`: thời điểm ảnh hạ xuống `photoDelay = 0.48` giây; thời điểm băng dính và các chi tiết khác được cộng thêm thời gian tương ứng.
- `src/styles.css`: `.dove-courier` cho kích thước và vị trí chim; `.dove-carried-print` cho tấm ảnh thu nhỏ treo trên chân chim.
- `src/wedding.config.ts`: `effects.doveMessengers = false` để tắt chim nhưng vẫn giữ chuyển động ảnh.

## Ảnh và kích thước

**Không phải thêm file chim:** chim là SVG inline, tự co giãn theo breakpoint.

Ảnh gắn với mỗi chú chim chính là ảnh bạn thay trong `wedding.story[n].image`:

- 900 × 1100 px (gần tỷ lệ 4:5), WebP, tối ưu dưới 250 KB.
- Cùng ảnh xuất hiện ở Polaroid chính và phiên bản thumbnail nhỏ bay cùng chim; chỉ thay **một đường dẫn** ở `wedding.config.ts`.
- Chừa khoảng an toàn cho gương mặt vì giao diện cắt ảnh bằng `object-fit: cover`.

## Responsive và hiệu năng

- Mobile dưới 681px: chim thu nhỏ, mỗi ảnh kích hoạt khi card đang trong tầm nhìn.
- Desktop: hai hướng trái/phải rộng hơn, card vẫn sử dụng lưới 3 cột cũ.
- Chim tự unmount sau khi bay xong để dừng vòng lặp vỗ cánh.
- Layer chim `pointer-events:none` nên không cản thao tác cuộn/chạm.
- `prefers-reduced-motion:reduce`: bỏ hoạt cảnh chim, hiển thị card và chi tiết không cần hiệu ứng.
- Không thêm thư viện, ảnh động, animation video hay request mạng.

## Kiểm thử

Chạy `npm install && npm run dev` và cuộn chậm từ đầu section Story để xem đủ ba cảnh. Kiểm tra ít nhất Android Chrome và Safari iOS. Ở môi trường đóng gói hiện tại npm registry không truy cập được nên đã xác nhận cú pháp/kiểm tra hình học tĩnh, **chưa xác nhận chuyển động Motion trong bản React build thực tế**.
