# V6.1 — Khôi phục vòng ngày cưới và hiển thị ảnh sắc nét hơn

## Vì sao số 14 mất vòng tròn?

Cấu hình cũ vẽ `motion.circle` với `whileInView` gắn lên chính phần tử SVG. Điều này có thể không kích hoạt sau replay/tuỳ trình duyệt. V6.1 chuyển sang `WeddingDayCircle` dùng `useInView` trên phần tử `span` chứa riêng ngày. Có một vòng tròn nền mảnh (SVG tĩnh), còn vòng chính được Motion vẽ khi tile đi vào viewport. Kích thước tile 88×88 px desktop, 70×70 px mobile, 62×62 px ở màn nhỏ <=365 px; vòng không tràn sang tháng và năm.

- Component: `src/App.tsx` → `WeddingDayCircle`
- CSS: `src/styles.css` → `.calendar-day-wrap`, `.calendar-ribbon-*`

## Vì sao ảnh mờ?

Các file mẫu trong `public/images/` được cắt từ bản mockup thiết kế, nhiều chi tiết gốc đã mất và file WebP chỉ khoảng 17–43 KB. Những ảnh đó dùng để hiển thị demo bố cục, **không phải ảnh high-res**. CSS trước đây còn dùng các `filter` như `sepia`, `saturate`, `brightness` làm ảnh trông xỉn/thiếu chi tiết. V6.1 bỏ các filter đó khỏi ảnh Hero, Memory Portal, Couple, Story, Gallery; vẫn giữ overlay gradient tối nhẹ ở chân Hero mobile để chữ trắng dễ đọc.

**Lưu ý:** Bỏ filter không thể khôi phục các chi tiết đã mất của ảnh nguồn. Muốn ảnh thật sắc nét, thay chúng trong `src/wedding.config.ts` bằng ảnh gốc của bạn. Gợi ý kích thước:

| Vị trí | Gợi ý |
|---|---|
| Hero | 1200×1600 hoặc 1600×2000 WebP (chất lượng ~85–90) |
| Couple / Memory Portal | 1000×1400 WebP |
| Story | 900×1100 hoặc cao hơn, WebP |
| Gallery | 1200×1600 / 1600×1200 WebP |

Không cần ép ảnh nào cũng dưới 100 KB: ảnh cưới nhiều chi tiết cần được nén cân bằng giữa dung lượng và chất lượng. Đảm bảo ảnh gốc sắc nét khi xem ở 100% trước khi đưa lên website.
