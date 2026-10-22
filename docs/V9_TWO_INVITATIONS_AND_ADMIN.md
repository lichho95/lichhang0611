# V9 — Hai phong bì · Nhà trai / Nhà gái · Admin filter

## Trải nghiệm

- Link chung `https://YOUR-PROJECT.pages.dev/`: **hai phong bì**. Chạm "Thiệp nhà trai" hoặc "Thiệp nhà gái" là **chọn và bắt đầu mở thiệp cùng một thao tác**; hoạt cảnh mở, nhạc nền và Hero hiện tại được giữ nguyên. URL tự cập nhật `?side=...` để có thể chia sẻ.
- Link nhà trai `https://YOUR-PROJECT.pages.dev/?side=groom`: **một phong bì** giống V8.3; chạm "Mở thiệp cưới".
- Link nhà gái `https://YOUR-PROJECT.pages.dev/?side=bride`: tương tự, với thông tin nhà gái.
- Trong menu có **Đổi thiệp** (hoặc dropdown desktop). Không tải lại trang, không reset Gallery/Story ảnh, có reset lượt animation trong `<main>`; khi đổi bên thì reset trạng thái RSVP vừa gửi ở phiên xem cũ.
- `?name=...` hoặc các query khác vẫn được giữ khi website thêm `side` vào URL.
- Nút "Xem lại hiệu ứng mở thiệp" **giữ nguyên `side` đã chọn**, không trở lại màn hai phong bì.

## Sửa thông tin hai bên ở đâu?

`src/wedding.config.ts`:

- `wedding.couple` — **chung**: tên cô dâu chú rể, tên bố mẹ hai bên.
- `wedding.invitations.groom`: ngày/giờ nhà trai, `date` cho đếm ngược, `dateText` hiện trên Hero/thiệp/Footer, `events[0]` = Lễ thành hôn, `events[1]` = Tiệc cưới nhà trai.
- `wedding.invitations.bride`: giống trên nhưng `events[0]` = Lễ vu quy, `events[1]` = Tiệc cưới nhà gái.
- `wedding.image`, `wedding.story`, `wedding.gallery`, `wedding.musicUrl`, `wedding.effects`, `wedding.bankAccounts` dùng **chung**, không nhân đôi cấu hình ảnh hoặc animations.

**QUAN TRỌNG:** Ngày cho nhà gái hiện là **demo**, trùng ngày nhà trai vì chưa nhận được ngày chính xác. Phải thay `date`, `dateText`, `time`, `venue`, `address`, `mapUrl` đúng trước khi gửi khách; `date` ở dạng ISO có timezone `+07:00`, ví dụ `2027-02-14T17:00:00+07:00`. Cập nhật **cả `dateText`** khi đổi ngày. Các tên, số tài khoản/ảnh demo cũng cần kiểm tra.

## D1 mới / cũ

**Database mới, chưa có bảng**: chạy `schema.sql` mới:

```bash
npx wrangler d1 execute wedding-db --remote --file=./schema.sql
```

**Database đã dùng từ V8.3 (đã có RSVP/lời chúc)**: sao lưu DB trước, **không xóa bảng** và **không chạy `schema.sql` để mong tự thêm cột**. Chạy migration **đúng một lần**:

```bash
npx wrangler d1 execute wedding-db --remote --file=./migrations/001_add_invitation_side.sql
```

`wedding-db` là tên DB ví dụ: thay bằng tên thật trong Cloudflare. Chạy migration **trước khi deploy Functions V9**, vì API V9 truy vấn cột `side`. Bản ghi cũ được lưu với `side='legacy'` (Admin hiển thị "Chưa phân loại"), không bị tự chuyển thành nhà trai hoặc nhà gái. Không chạy lại migration nếu DB đã có cột `side`.

## API / Admin

- POST `/api/rsvp` gửi `{guest_name, attending, guest_count, event_id:'wedding', note, side: 'groom' | 'bride'}`.
- POST `/api/wishes` gửi `{guest_name, message, side: 'groom' | 'bride'}`.
- Server kiểm tra `side` hợp lệ, ghi vào `rsvps.side` và `wishes.side`. Dùng API D1 hiện có, giữ nguyên duyệt/ẩn/xóa và xác minh Turnstile.
- GET `/api/wishes` hiển thị **chung** lời chúc đã duyệt cả hai bên, không phân biệt.
- GET `/api/admin` trả về thêm `side` cho từng bản ghi.
- Bộ lọc ở đầu trang admin: **Tất cả / Nhà trai / Nhà gái / Chưa phân loại** áp dụng cùng lúc cho RSVP và lời chúc. Duyệt tất cả trong một bộ lọc chỉ duyệt lời chúc tương ứng của bộ lọc đó; xuất CSV và sao chép danh sách cũng theo bên đang chọn và ghi rõ nguồn của mỗi RSVP.
- Giữ secret `ADMIN_PIN` (tối thiểu 6 ký tự) trong Cloudflare và tránh gửi hoặc commit PIN vào source.

## Chạy thử và kiểm tra

```bash
npm ci
npm run dev
```

Dùng ba URL: `/`, `/?side=groom`, `/?side=bride`. Kiểm tra lịch, Hero, thiệp, Countdown, mỗi popup, menu đổi thiệp và replay. Trên dev API localStorage vẫn chạy bản minh họa để kiểm tra lọc nguồn.

```bash
npm run test:api
npm run build
```

Các ảnh, sizes, comments vẫn giữ theo `docs/IMAGE_GUIDE.md`. Tất cả popup và animation khác dùng lại source của bản update người dùng tải lên.
