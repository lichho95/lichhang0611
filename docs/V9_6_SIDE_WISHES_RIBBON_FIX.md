# The Living Ribbon V9.6 — Wishes theo bên mời & Opening ribbon

**Nguồn:** cập nhật trực tiếp từ `the-living-ribbon-animation-v9-5-update.zip` do chủ project gửi. Source-only: không có `public/`.

## 1) Chỉ hiển thị lời chúc theo bên thiệp

- `functions/api/wishes.js`: API GET `/api/wishes?side=groom|bride` bắt buộc có `side`, kiểm tra input và lấy **chỉ** những lời chúc có `status='approved' AND side=?` ở D1. Không hiển thị dữ liệu không có side/legacy trên trang công khai.
- `src/lib/api.ts`: `loadWishes(side)` truyền query param lên API và lọc thêm trên client để tương thích nếu frontend được deploy trước backend. Ở môi trường Vite demo hoặc khi mất kết nối API, chỉ dữ liệu demo/localStorage trùng side mới được hiển thị.
- `src/App.tsx`: `WishesSection` tải lại đúng bên mỗi khi đổi thiệp; hủy hiệu lực response cũ khi một request từ bên trước trả về muộn; reset index/letter. Component có `key={activeSide}` để tránh hiển thị thoáng qua dữ liệu bên trước.
- `src/wedding.config.ts`: Gắn `side` cho ba **lời chúc demo** đã có (2 nhà trai, 1 nhà gái). Không sửa ngày cưới, tên, ảnh, số tài khoản hay nội dung ngoài ba trường side.
- Admin vẫn lọc theo bên/legacy như cũ, không xóa dữ liệu cũ.

### Thử nghiệm hành vi
1. Gửi lời chúc từ `/?side=groom` và `/?side=bride`.
2. Admin `/admin`: duyệt từng lời chúc (nếu `MODERATE_WISHES` đang bật); lọc nguồn bên mời để kiểm tra.
3. Mở thiệp nhà trai: chỉ thấy lời chúc đã duyệt từ nhà trai. Mở thiệp nhà gái: chỉ thấy lời chúc đã duyệt từ nhà gái.
4. Dữ liệu chưa phân loại (`legacy`) chỉ còn thấy trong Admin, không tự nhận là thuộc nhà trai hoặc nhà gái.

**Lưu ý deploy:** cập nhật đồng thời frontend và `functions/api/wishes.js` lên Cloudflare Pages để phía server lọc chính xác. Database đã có cột `side` từ V9, không cần migration mới.

## 2) Dải lụa xuất hiện trước phong bì khi tiến vào Hero

- `src/styles.css`: lúc bắt đầu giai đoạn `opening-phase-journey`, SVG `.opening-silk-trail` được chuyển lên lớp `z-index: 12`, cao hơn `.opening-content` và phong bì; ở các giai đoạn trước vẫn ở sau phong bì.
- Dùng `vector-effect: non-scaling-stroke` để nét SVG không bị phình/thu bất thường trên viewport khác nhau.
- Không đổi thời gian mở phong bì, không thay chuỗi animation đã chốt.

## Kiểm tra
- `node --test tests/*.test.mjs` — 8 bài test đạt (gồm 4 test mới cho GET wishes).
- 18 file TS/TSX đã kiểm tra cú pháp; CSS parser không báo lỗi.
- `npm ci --offline` không thành công do thiếu tarball npm trong cache, nên chưa thể chạy build Vite hoặc kiểm tra animation React thực tế. Vẫn cần kiểm thử trên iOS Safari và Android Chrome.

## Cách áp dụng
Giải nén ZIP mới vào thư mục project hiện tại và ghi đè source. Giữ nguyên toàn bộ `public/` để bảo toàn ảnh cưới, QR và nhạc. Không cần xóa dữ liệu D1. Nếu deploy thành hai bước, **deploy Cloudflare Functions cùng với frontend**, tránh giữ API cũ.
