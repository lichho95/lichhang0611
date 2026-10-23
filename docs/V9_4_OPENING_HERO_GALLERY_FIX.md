# V9.4 — Sửa Opening, Hero mobile/tablet, Gallery

Nguồn nâng cấp: V9.3 (được tạo từ bản source V9.2 Vietnamese Update người dùng gửi). Giữ nguyên config hai bên, Admin Dashboard, API, schema và migration.

## 1. Opening: chỉ mở đúng MỘT lần

Trước đây `Opening` cho phong bì nhỏ mở ở `unseal`, chuyển sang phong bì lớn, rồi tiếp tục mở lại; thêm một `AnimatePresence` cho màn hình chọn khiến hai phiên bản có thể cùng hiện trong thời điểm chuyển cảnh. V9.4 đổi trình tự khi truy cập link chung:

| Thời điểm kể từ cú chạm | Trạng thái | Hành động |
|---|---|---|
| 0ms | focus | Phong bì được chọn chuyển tới trung tâm, phong bì còn lại mờ đi |
| 780ms | handoff | Phong bì nhỏ (vẫn đóng) hòa sang phong bì lớn (vẫn đóng) |
| 1510ms | unseal | Chỉ phong bì lớn được tháo dấu sáp |
| 1950ms | unfold | Nắp phong bì lớn mở, lá thư trượt lên |
| 2850ms | journey | Dải lụa xuất hiện, Hero bắt đầu reveal bên dưới |
| 4090ms | enter | Opening thoát mờ qua một animation duy nhất |

- Bỏ câu **Trân trọng kính mời** trong phần giấy của hai phong bì chọn; câu này vẫn ở lá thư khi phong bì lớn được mở.
- Bỏ heading `opening-copy` thứ hai với link chung để không có cảnh chữ hiện đột ngột.
- Loại bỏ animation mở nắp/dấu sáp khỏi phong bì nhỏ và bỏ animation `journey` CSS dư; chỉ dùng Motion exit trên toàn màn hình.
- `Header` và `demo-ribbon` mount khi `opened`, ngay dưới lớp Opening đang fade; tránh việc hiện đột ngột sau khi overlay thoát xong.
- Link riêng `?side=groom` / `?side=bride` vẫn hiển thị một phong bì lớn với nút mở như cũ.
- Giữ `side` đã chọn khi xem lại, các form/API/Admin không đổi.

## 2. Hero mobile/tablet

- Giữ layout 2 tầng đã duyệt: ảnh phía trên, khối tên/ngày/tagline trên nền kem phía dưới (<= 920px).
- Nhãn **NGÀY HẠNH PHÚC CỦA** được chuyển lên vùng phía trên; con dấu **MỘT ĐỜI BÊN NHAU** ở bên phải, nhỏ hơn và lệch khỏi vùng giữa khuôn mặt.
- Không can thiệp Hero desktop.
- Ảnh vẫn lấy từ `wedding.image.hero`; có thể chỉnh `heroPositionMobile` và `heroPositionDesktop` ở `src/wedding.config.ts` nếu ảnh có bố cục khác.
- Ảnh trong ZIP không đi kèm vì người dùng loại bỏ `public/` khỏi source gửi lên. Không xóa `public/` hiện có.

## 3. Gallery không lóe ảnh sai thứ tự

- Bỏ `AnimatePresence mode="wait"` cho ảnh Polaroid mobile và lightbox: khi chuyển trạng thái, chỉ có **một ảnh chính** trong DOM, không còn bản ảnh cũ chờ exit.
- Hai layer phía sau là **giấy trang trí**, không đưa trước các ảnh khác vào vị trí có thể lộ ra.
- Preload hai ảnh liền kề để giảm khoảng trống khi chuyển.
- Next, Previous vẫn cập nhật index đúng; điều hướng và swipe vẫn giữ.
- Animation scroll nhẹ của chồng ảnh và các tile desktop từ V9.3 vẫn được giữ.

## 4. Kiểm tra đã thực hiện

- Cú pháp `App.tsx`, `wedding.config.ts` qua TypeScript parser.
- Bốn bài `npm run test:api`: đạt (side Nhà trai/Nhà gái, moderation, admin filter).
- Bố cục HTML/CSS đại diện trong Chromium ở 320, 375, 390, 430, 768, 920, 1024, 1280 px: không phát hiện tràn ngang; các phần text trong panel mobile/tablet ở ngoài ảnh.
- Kiểm tra quy tắc mã nguồn về các trạng thái Opening, loại bỏ ảnh dưới sai lượt và CSS.

**Chưa được xác thực:** build Vite/React hoàn chỉnh và tính đúng đắn của Motion khi chạy trên Safari iOS/Chrome Android thật. Phiên này không cài được npm dependencies qua mạng. Các kiểm tra source/static không thay thế kiểm thử tương tác trên máy thật.

## 5. Áp dụng

**Cách an toàn nhất:** copy các file `src/App.tsx`, `src/styles.css` từ ZIP vào project V9.3 hiện tại; giữ nguyên `public/`, `node_modules/`, `.env*`, `wrangler.toml`/D1 bindings và toàn bộ file cá nhân của bạn. Không cần migration database.

```bash
npm install
npm run build
npm run dev
```

Kiểm thử trực tiếp:
1. Link chung `/`: chọn Nhà trai → phong bì chuyển vào giữa (không mở) → hòa vào phong bì lớn → mở **một lần** → Hero, không chớp Header. Thử lại với Nhà gái.
2. Link riêng `/?side=groom` và `/?side=bride`: mở một phong bì.
3. Mobile 320/390/430, tablet 768/920, desktop 1024/1280: tên không che người, nhãn không che mặt (tùy trọng tâm ảnh thật), không tràn ngang.
4. Album mobile: nhấn Next chậm rồi liên tiếp, kiểm tra ảnh 1→2→3; nhấn Previous, vuốt, chạm mở Lightbox và thử các mũi tên trong Lightbox.
5. Truy cập `/admin`, lọc `side`, kiểm tra RSVP/lời chúc như trước.
