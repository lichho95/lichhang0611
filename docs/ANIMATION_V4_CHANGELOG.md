# Animation V4 — The Art of Little Moments

## Phần thay đổi

V4 phát triển dựa trên toàn bộ mã nguồn V3, giữ nguyên routing, Cloudflare Pages/D1, các API, dữ liệu cưới, vị trí ảnh, gallery lightbox và khung responsive.

### 1. Ba cột mốc trong “Chuyện chúng mình”

`src/components/MemoryCard.tsx` được tạo để mỗi card có hoạt cảnh riêng, tránh 3 lần lặp fade/slide-up.

- **Ngày ta gặp nhau**: tấm ảnh trượt ra từ một *film sleeve*, chuyển động 3D nhẹ và dấu bưu điện `FIRST HELLO` hạ xuống ảnh.
- **Những điều bé nhỏ**: thẻ ảnh bay vào và 3 chi tiết ký ức nhỏ (`✧`, `♡`, `✦`) lần lượt hội tụ bằng springs, có cảm giác sắp xếp scrapbook bằng tay.
- **Một lời hẹn mãi mãi**: hai đường oval tượng trưng cặp nhẫn được vẽ theo `pathLength`; con dấu sáp `FOREVER` đáp xuống bức ảnh.

Tiêu đề mỗi cột mốc mở ra theo mặt nạ chữ; nội dung xuất hiện sau. Chỉ dùng opacity/transform cho phần lớn các chuyển động; chuyển động SVG giới hạn ở ornament nhỏ.

### 2. FRAGMENTS OF FOREVER & Gallery

`src/components/FragmentsHeading.tsx` thay phần kicker tĩnh bằng một dải chữ chuyển động: **từng ký tự ghép vào đúng chỗ**, sau đó một đường mực chạy bên dưới tiêu đề.

Gallery được đóng khung như **contact sheet / cuộn film**. 6 bức ảnh hạ xuống các ô lưới theo thứ tự, lớp sáng bên trên rút dần như khi ảnh được tráng, còn số ảnh và viền film định vị tác phẩm.

Không đổi các đường dẫn `wedding.gallery`, không đổi chức năng bấm mở Lightbox. Dùng `src/wedding.config.ts` để thay ảnh; giữ gợi ý 900×1200/1200×900 WebP như trước.

### 3. Tim rơi trong background

`src/components/HeartRain.tsx` tạo 8 trái tim mảnh trên desktop, 4 trên mobile. Chúng rơi theo tốc độ chậm (19–30 giây/lượt), từ chủ yếu hai mép viewport và có độ trong suốt thấp. Không bắt sự kiện chuột/chạm (`pointer-events: none`), không tạo ngẫu nhiên vị trí mỗi lần React render.

- Bật/tắt tại `src/wedding.config.ts`:

  ```ts
  effects: {
    heartRain: true, // false để tắt
  },
  ```

- Chỉnh số tim và tốc độ: mảng `HEARTS` trong `src/components/HeartRain.tsx` (thuộc tính `duration`, `size`, `x`).
- `prefers-reduced-motion`: tự tắt tim rơi, bỏ biến đổi không cần thiết cho người dùng có nhu cầu giảm chuyển động.

### 4. Kiểm tra & giới hạn

- Đã kiểm tra cú pháp TypeScript/TSX bằng TypeScript 5.8 parser; kiểm tra CSS bằng parser và kiểm tra **HTML/CSS đại diện ở trạng thái cuối animation** trên Chromium tại 360 / 390 / 430 / 768 / 1280px; kết quả không có overflow ngang.
- Các ảnh chụp responsive là của **bản dựng kiểm tra HTML/CSS đại diện**, không phải bản React chạy live.
- **Chưa xác nhận được `npm run build` hoặc motion playback của app thật trong container**, vì npm registry không truy cập được. Hãy chạy thử trên máy với `npm install && npm run dev`, kiểm tra trình duyệt mobile thật trước khi deploy.

## File mới

- `src/components/MemoryCard.tsx`
- `src/components/FragmentsHeading.tsx`
- `src/components/HeartRain.tsx`

## File chỉnh sửa

- `src/App.tsx`: tích hợp 3 component mới và Gallery choreography, bổ sung `useSpring` vốn thiếu ở import V3.
- `src/styles.css`: scene styling và responsive.
- `src/wedding.config.ts`: thêm công tắc `effects.heartRain`.

## Gợi ý thứ tự đánh giá

1. Scroll đến Story: ba ảnh lần lượt xuất hiện bằng ba hoạt cảnh khác nhau.
2. Scroll đến Gallery: từng ký tự **FRAGMENTS OF FOREVER** vào vị trí rồi ảnh tráng sáng theo thứ tự.
3. Kiểm tra tim rơi ở đầu và cuối trang, không chắn click/tap; đặt `heartRain: false` để so sánh.
4. Test lại tại 360px, 390px và 1280px sau khi đổi ảnh thật vì ảnh khác tỷ lệ có thể làm cảm giác crop thay đổi.
