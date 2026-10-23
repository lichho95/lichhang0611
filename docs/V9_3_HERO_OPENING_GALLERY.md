# The Living Ribbon — V9.3 (Hero + Opening + Gallery)

Bản cập nhật được chỉnh trực tiếp từ `the-living-ribbon-animation-v9-2-vietnamese-update(1).zip` của bạn. **Đây là mã nguồn cập nhật (source-only), không phải bản chạy độc lập.** Source bạn tải lên đã chủ động lược bỏ `public/`, `package-lock.json` và một số tài sản khác. Hãy giải nén/copy các file V9.3 vào **project đang có ảnh thật và dependencies**, ghi đè những file mã nguồn tương ứng. Không xóa `public/`, `.env`, `package-lock.json`, hoặc cấu hình Cloudflare/Secrets bạn đang dùng.

## 1. Hero mobile + tablet — theo mockup

- Ở chiều rộng **≤920px**, ảnh cưới hiển thị trọn trong vùng ảnh riêng ở trên, tên hai người, ngày cưới và tagline nằm trên khối giấy kem **phía dưới ảnh**, không còn chữ lớn đè mặt người.
- Desktop >920px giữ bố cục Hero cũ, không thay đổi các section còn lại.
- Cấu hình mới `src/wedding.config.ts` → `image.heroPositionMobile` / `image.heroPositionDesktop` để đổi `object-position` sau khi thay ảnh mà không sửa CSS. Ảnh gốc gợi ý **1200×1600px trở lên, tỷ lệ 3:4**, đủ nét. Không nén ảnh gốc xuống ảnh preview.
- Trên mobile có ticker nhỏ "Ngày hạnh phúc của" ở đầu ảnh; tiêu đề chính chỉ xuất hiện trong panel giấy kem.

## 2. Opening — sửa phong bì biến mất đột ngột và Hero nháy

- Một cú chạm → `focus` (phong bì được chọn tiến tới tâm) → `unseal` (mở dấu sáp, nắp, lá thư trên **phong bì đã chọn**) → `handoff` (crossfade từ chính phong bì đó sang phong bì chi tiết) → `unfold` (nội dung “Trân trọng kính mời” xuất hiện dần) → `journey` (vẽ lụa, chuẩn bị Hero) → `enter` (phủ Opening tan từ từ).
- Tâm chuyển động đo từ **phong bì** chứ không phải card có label, phù hợp mobile/tablet.
- Loại bỏ keyframe tự làm cả màn hình Opening mờ đi trước khi React kết thúc; chỉ `AnimatePresence` điều khiển chuyển cảnh cuối.
- Giữ `overflow:hidden` của body đến **khi lớp Opening thoát xong**, tránh dịch khung hình do thay đổi scrollbar; header/nhạc/tim rơi xuất hiện sau khi kết thúc chuyển cảnh.
- Link nhà trai/nhà gái vẫn vào đúng bản thiệp và giữ một phong bì như cũ.

## 3. Những khung hình yêu — sửa nhảy ảnh và thêm motion

- Chồng ảnh phía sau lấy **ảnh trước đó**, không lấy ảnh kế tiếp; ví dụ từ ảnh 1 sang ảnh 2, không còn lộ ảnh 3 trước.
- Mobile: khi cuộn đến chồng ảnh, cả bộ ảnh nâng nhẹ, nghiêng và hạ xuống bằng spring; sau đó các nút next/prev và vuốt vẫn hoạt động.
- Desktop: vẫn giữ bố cục collage và animation từng ảnh đang có.
- Lightbox, video, RSVP, lời chúc, Cloudflare D1, lọc admin theo nhà trai/nhà gái không thay đổi.

## Kiểm tra và triển khai

```bash
npm install        # Nếu bạn đã có package-lock.json chuẩn trong project thì dùng npm ci
npm run build
npm run dev
node --test tests/api-side.test.mjs
```

Kiểm tra đường dẫn `/`, `/?side=groom`, `/?side=bride` và Replay; tại Gallery thử next/prev liên tục, vuốt trái/phải rồi mở Lightbox. Với ảnh mới, kiểm tra `object-position` trên iPhone và tablet thực tế.

**Đã kiểm tra tại môi trường tạo bản vá:** 4 bài test API đạt; TSX syntax transpilation đạt; CSS parse đạt; hình học Hero kiểm tra bằng Chromium đại diện tại 320, 360, 390, 430, 768, 920, 1024 và 1280px không tràn ngang, tên nằm dưới ảnh từ 320–920px. Không thể chạy build Vite hoặc Motion app thật do npm registry không truy cập được từ môi trường này. Cần chạy trên project có `node_modules` để xác thực timing chuyển cảnh thực tế.
