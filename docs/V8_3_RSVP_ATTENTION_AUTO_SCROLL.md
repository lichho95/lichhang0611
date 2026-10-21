# The Living Ribbon — V8.3: Floating RSVP + gentle automatic scroll

> V8.3 được tạo trực tiếp từ bản V8.2 (`the-living-ribbon-animation-v8-2-mobile-input-fix.zip`). Không thay API, schema D1 hoặc Admin Dashboard.

## 1. Nút “Xác nhận tham dự”

- Chỉ xuất hiện khi khách đã cuộn qua thiệp mời (giữ logic V8.2).
- Nút lắc góc nhỏ khoảng 2°, theo một chu kỳ **8,5 giây**; chỉ lắc ngắn rồi đứng yên.
- Hào quang viền champagne / burgundy nhạt đồng bộ với nhịp lắc; không phải hiệu ứng nhấp nháy liên tục.
- Motion chịu trách nhiệm cho hiệu ứng **xuất hiện** ở wrapper `.floating-rsvp-dock`; CSS animation chịu trách nhiệm cho **lắc** bên trong `.floating-rsvp`. Không dùng hai animation `transform` trên cùng một phần tử.
- Khi khách đã gửi xác nhận, nút đổi trạng thái và ngừng lắc/phát sáng.
- Tôn trọng `prefers-reduced-motion: reduce`.

File chỉnh hiệu ứng: `src/styles.css`, tìm `V8.3 — RSVP subtle attention`.

## 2. Tự cuộn để khám phá website

- **Không tự mở phong bì**. Chỉ bắt đầu đếm thời gian SAU khi khách nhấn “Mở thiệp cưới” và hoàn thành chuyển cảnh.
- Khách không tương tác trong **10 giây**: tự cuộn khoảng **63% chiều cao màn hình**, bằng đường cong mềm dài **1,8 giây**.
- Nếu khách vẫn không tương tác, chờ thêm **9 giây** và nhẹ nhàng chuyển tiếp.
- Khi khách **chạm, click, vuốt, cuộn bằng wheel, bấm phím, focus vào ô nhập hoặc kéo thanh cuộn**: ngừng tự cuộn trong toàn bộ lượt xem đó. Tự kích hoạt lại khi khách chọn “Xem lại hiệu ứng mở thiệp” và mở lại phong bì.
- Không cuộn nếu popup đang mở, album/lightbox đang mở, menu mobile đang mở, ở màn hình Admin, tab trình duyệt bị ẩn, đang focus input/textarea hoặc thiết bị bật Reduced Motion.
- Khi đến cuối trang, tự dừng; không cuộn ngược lại đầu trang.

File: `src/components/useGentleAutoScroll.ts`.

### Đổi cấu hình nhanh: `src/wedding.config.ts`

```ts
  effects: {
    heartRain: true,
    doveMessengers: true,
    rsvpAttention: true,            // false = không lắc/sáng, vẫn có nút RSVP
    autoStoryScroll: true,          // false = cuộn thủ công như V8.2
    autoScrollIdleMs: 10000,        // 10 giây sau khi mở thiệp
    autoScrollIntervalMs: 9000,    // nghỉ 9 giây giữa các lần cuộn
    autoScrollStepViewport: 0.63, // mỗi bước = 63% chiều cao màn hình
  },
```

Ví dụ muốn khách có nhiều thời gian đọc nội dung hơn, tăng `autoScrollIdleMs` và `autoScrollIntervalMs` lên 15000.

## 3. Kiểm tra khi chạy trên điện thoại

1. Mở trang nhưng chưa mở phong bì: không tự cuộn.
2. Mở thiệp và không thao tác: sau 10 giây, bắt đầu cuộn chậm.
3. Chạm màn hình hoặc cuộn bằng tay: tự cuộn dừng; khách tự do đọc và vuốt.
4. Mở form RSVP/lời chúc hoặc album: không có tự cuộn ở nền.
5. Cuộn qua phần thiệp mời: nút RSVP xuất hiện và có nhịp lắc + hào quang nhẹ; bấm để mở popup như V8.2.
6. Gửi RSVP: nút chuyển trạng thái “Đã xác nhận” và không còn lắc.
7. Bật giảm chuyển động trong hệ điều hành: hiệu ứng lắc và tự cuộn đều tắt.
8. Bấm “Xem lại hiệu ứng mở thiệp”: auto-scroll được khởi động lại từ đầu sau khi mở thiệp.

## 4. Ghi chú kiểm thử

- Đã kiểm tra cú pháp TS/TSX, CSS bằng TypeScript transpiler và CSS parser.
- Bản build React hoàn chỉnh chỉ có thể chạy nếu cài đủ các gói npm: `npm ci && npm run build`.
- Cần thử thực tế trên iOS Safari và Android Chrome để tinh chỉnh nhịp cuộn nếu muốn.
