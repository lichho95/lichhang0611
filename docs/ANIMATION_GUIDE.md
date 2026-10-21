# The Living Ribbon — Animation Guide (v2)

Trang này ghi lại chuyển động **đã code** để bạn kiểm tra sau khi chạy `npm run dev`. Đây là thiết kế cinematic bằng CSS/React Motion/SVG, không dùng video pre-render, WebGL hoặc Three.js.

## 1. Khi chạm mở thiệp (tap choreography)

- **0–650ms:** dấu sáp nổi lên và dần rời khỏi phong bì. SVG silk trail bắt đầu được vẽ sau 460ms.
- **650–1700ms:** nắp phong bì gập ra sau qua CSS 3D, tờ thiệp trượt ra khỏi phong bì.
- **1700–2850ms:** camera tiến gần, trang giấy mờ dần, Hero được lộ ra từ phía dưới.
- **Sau 2850ms:** tên hai người và ngày cưới lần lượt hiện lên cùng vệt lụa ngang.
- Với **Reduce motion** của thiết bị, chuyển ngay vào Hero, không bắt người xem chờ hiệu ứng.
- File điều khiển: `src/App.tsx` (component `Opening`), CSS selector `opening-phase-*` trong `src/styles.css`.

Để xem lại toàn bộ lần mở, nhấn **Xem lại hiệu ứng mở thiệp** ở cuối website.

## 2. Các chapter khi scroll

| Mốc | Chuyển động / điều khiển | Source |
|---|---|---|
| Hero → Couple | Ảnh chân dung ở Memory Portal phóng từ khung arch lên gần toàn màn hình, khung thay đổi bo góc, có sợi lụa ngang | `MemoryPortal()` + `.memory-portal-*` |
| Couple → Story | Nét lụa tự vẽ, đan thành hình trái tim; ảnh ký ức lật lớp giấy che | `<JourneyTransition motif="heart"/>` |
| Story → Details | Nét lụa quấn hai vòng nhẫn; đường lụa khoanh ngày cưới | motif `rings` + `.calendar-ribbon-ring` |
| Details → Gallery | Một nét uốn liên tục; ảnh gallery lần lượt được kéo lớp giấy che ra | motif `loop` + `.gallery-curtain` |
| Gallery → Wishes | Đường lụa biến thành đường gấp lá thư, lá thư mở rộng khi chạm | motif `letter` + `.letter-ribbon-fold` |
| Wishes → RSVP | Đường lụa tiếp tục nối đến phần xác nhận tham dự | motif `loop` |
| RSVP → Gift | Đường lụa tạo hình nơ; chạm vào hộp → nơ và dải buộc bung ra, nắp nhấc lên → modal mừng cưới | motif `bow` + `.gift-object-unwrapping` |

**Quan trọng:** Ribbon được chia thành các đoạn SVG nối chủ đề giữa các section, không phải một path SVG duy nhất trải suốt trang; đó là chủ đích để tương thích các breakpoint và dễ tối ưu mobile. Mức tiến triển của nét vẽ phụ thuộc trực tiếp vào scroll, nên kéo ngược sẽ vẽ ngược.

## 3. Cách tùy chỉnh

- **Thời gian mở thiệp:** ba mốc `650`, `1700`, `2850` trong component `Opening()` ở `src/App.tsx`. Nếu thay, phải đồng bộ thời lượng CSS `.opening-phase-journey`.
- **Hình dải lụa:** `src/components/JourneyTransition.tsx` trong object `paths` (`heart`, `loop`, `rings`, `letter`, `bow`). Thay `d` SVG nếu muốn tùy biến đường vẽ.
- **Tốc độ theo scroll:** `useSpring(scrollYProgress, {stiffness,damping,mass})` tại `JourneyTransition` và `MemoryPortal`.
- **Màu sắc / chất liệu:** ở `src/styles.css` trong block `THE LIVING RIBBON · MOTION DIRECTOR v2` và các biến `:root`.
- **Ảnh phù hợp:** không có ảnh animation riêng; Hero và Memory Portal dùng `image.hero` (3:4) và `image.couple` (5:7) trong `wedding.config.ts`. Xem `docs/IMAGE_GUIDE.md`.

## 4. Kịch bản kiểm thử (ưu tiên điện thoại)

1. Tải trang từ đầu: nhìn thấy phong bì/niêm phong, **không** tự chuyển cảnh.
2. Bấm *Mở thiệp cưới*: phải thấy dấu sáp bay ra, nắp phong bì gập, tờ thiệp đi lên, nét lụa vẽ và Hero hiện ra. Nút được vô hiệu hóa trong lúc mở để tránh click nhiều lần.
3. Vuốt chậm qua phần Memory Portal: ảnh phóng theo scroll; vuốt ngược: khung ảnh trở về kích thước cũ.
4. Cuộn qua các chapter: dải lụa tự vẽ, heading Chapter 02–07 xuất hiện cùng cảnh.
5. Xem Story/Gallery: ảnh lộ qua lớp giấy che, không chỉ fade-in.
6. Vào phần lời chúc: chuyển thư trước/sau, chạm để bung/mở thư. Nhấn viết lời chúc: form mở xuống.
7. Ở hộp quà: chạm để tháo nơ, nhấc nắp rồi mới hiển thị modal; đóng và bấm lại được.
8. Bấm *Xem lại hiệu ứng mở thiệp* ở cuối trang, kiểm tra lượt 2.
9. Bật **Reduce Motion** trong OS, tải lại: site phải hoạt động và các chuyển động không cần thiết được giảm/bỏ.
10. Kiểm tra trên Safari iOS, Chrome Android và một trình duyệt desktop. Nén ảnh trước khi public.

> Môi trường tạo project không tải được npm dependencies, do đó v2 đã qua kiểm tra cú pháp TSX/JSX và parse CSS, **chưa xác nhận được full Vite build hoặc chạy E2E trên trình duyệt React**. Sau khi cài dependencies trên máy, chạy `npm run build` và kiểm thử theo checklist ở trên.
