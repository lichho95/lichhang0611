# The Living Ribbon — Animation V3 (21/10/2026)

**Scope:** nâng cấp trực tiếp V2, giữ bố cục, dữ liệu, API, hình ảnh và thiết kế cho mobile/desktop. Thay ảnh vẫn thực hiện tại `src/wedding.config.ts`, hướng dẫn tại `docs/IMAGE_GUIDE.md`.

## Những thay đổi theo yêu cầu

1. **Thiệp mời lắc rõ nét hơn:** CSS `envelope-sway-v3` (4.2s) tăng quãng di chuyển dọc và góc quay nhưng giữ sự mềm mại. Tắt tự động với `prefers-reduced-motion`.
2. **Không bị ngừng khi mở Hero:** `Opening` phát tín hiệu `onReveal` ngay khi bắt đầu đoạn chuyển (1.25s), để Hero được render/rõ nét **bên dưới** khi lớp thiệp vẫn đang tan đi; lớp thiệp kết thúc ở 2.23s. Hero image được preload/decode từ lúc trang khởi tạo, bỏ transition alpha chậm và hiệu ứng blur tốn GPU ở tên cặp đôi.
3. **Dải lụa không còn sai hình học:** `src/components/JourneyTransition.tsx` có `viewBox` riêng desktop/mobile, không dùng `preserveAspectRatio="none"`, đường cong Bézier không giao nhau, biểu tượng motif thật cho tim/nhẫn/thư/nơ. Không dùng một path quá phức tạp để giả mọi biểu tượng.
4. **Highlight sớm hơn:** `useScroll` offset `['start 98%', 'start 54%']`, vẽ xong khi đoạn ribbon còn nằm trong viewport; thay đổi tương tự cho `src/components/Ribbon.tsx`.
5. **Vòng ngày cưới chính xác:** dùng `<motion.circle cx=44 cy=44 r=33>` bên trong riêng ô số (`.calendar-day-wrap` 88×88 desktop, 70×70 mobile, 62×62 màn nhỏ), không khoanh cả tiêu đề tháng/năm.
6. **Popup quà mượt:** bỏ timer chờ 1450ms; popup được mount ngay trong cùng lượt click rồi hiện lên sau 0.47s theo animation tháo nơ/nắp hộp. Đóng popup không bị áp dụng delay mở.
7. **Intro hai người:** tiêu đề được tiết lộ như nét mực (clip-path) và đường kẻ bên dưới được vẽ tuần tự.
8. **Story timeline:** từng ảnh di chuyển từ rìa vào, xoay nhẹ và "đặt xuống" bằng spring; sau đó dải băng dán và chốt ghim mới xuất hiện. Title có nét mực vẽ thêm để đồng nhất.
9. **Event cards:** hai thiệp buổi lễ có chuyển động như giấy được dựng/đặt lên, xoay 3D nhẹ, xuất hiện so le và đóng dấu góc.
10. **Gallery:** ảnh hội tụ vào ô lưới như từng tấm film được sắp xếp; có mã số film, đường viền bên trong, rèm giấy mở và entrance spring so le; tiêu đề có nét mực.
11. **Gift shake khi scroll:** chỉ rung một lần khi hộp quà vào vùng xem; người dùng được giảm chuyển động sẽ không thấy rung.
12. **Responsive:** viewport 360/390/430/768/1280 px kiểm tra HTML/CSS thông qua headless Chromium: không phát hiện tràn ngang. Chuyển động ngoài khung của Gallery/Event được giới hạn trong section.

## Điểm kiểm tra thủ công sau khi `npm install` thành công

1. `npm run build` và `npm run dev` trên máy có Internet/có sẵn dependencies.
2. Ở **iOS Safari & Android Chrome**: mở thiệp → Hero không có màn hình trắng, ảnh/text sẵn trước khi overlay biến mất, nhạc chỉ chạy sau chạm.
3. Scroll từng chapter trên mobile và desktop: ribbon xuất hiện sớm, không méo, không che tiêu đề.
4. Story: từng card tới nơi rồi tape/pin mới hiện. Gallery: kiểm tra hover/touch và lightbox còn hoạt động.
5. Ô lịch: vòng tròn ôm số, không chạm chữ tháng/năm cả với ngày 1 và ngày 31.
6. Hộp quà: lắc khi đi vào viewport; mở nơ/hộp → modal lên mượt; đóng/reopen hoạt động; trải nghiệm reduced-motion.
7. Form RSVP/Wishes/Cloudflare D1 cần kiểm thử end-to-end sau triển khai (không thay đổi API trong bản này).

## Ghi chú chất lượng

- Đã kiểm tra syntax/transpilation TSX bằng TypeScript, kiểm tra CSS parser, dùng Chromium headless kiểm tra **HTML/CSS layout đại diện**, gồm vùng Calendar, Journey, Gallery ở cả desktop và mobile.
- **Chưa xác nhận runtime React build và animation thời gian thực trong browser**: môi trường thực thi không tải được npm packages từ registry. Vì vậy chưa nên coi đây là một bản release production-verified.
- Các tính năng ảnh/nhạc/video/QR sử dụng cấu hình cũ, không thay thông tin cá nhân hoặc tài khoản của người dùng.
