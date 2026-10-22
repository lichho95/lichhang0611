> **V9.2 — Việt hóa toàn bộ giao diện khách mời:** Opening, Hero, thiệp mời, các chapter, Gallery, lời chúc, RSVP, hộp quà, Footer và social metadata đều dùng câu chữ tiếng Việt. Giữ nguyên V9.1, admin, hai phiên bản thiệp và các API. Chi tiết: [`docs/V9_2_VIETNAMESE_COPY.md`](docs/V9_2_VIETNAMESE_COPY.md).

> **V9.1 update — 22/10/2026:** Fixed two-envelope choreography on shared links and added a visible, compact mobile header switch (Thiệp nhà trai ↔ Thiệp nhà gái). See `docs/V9_1_ENVELOPE_SELECTION_FIX.md`. Admin and D1 migrations from V9 are unchanged.

# V9 — Hai phiên bản thiệp, hai phong bì & Admin Side Filter

**V9 được phát triển trực tiếp từ file `the-living-ribbon-animation-v8-3-update.zip` của chủ dự án.** Không thay Gallery, timeline, ảnh hay cơ chế duyệt lời chúc.

- `/?side=groom`: thiệp nhà trai; `/?side=bride`: thiệp nhà gái.
- `/`: chọn trong hai phong bì — chạm một lần để chọn và bắt đầu mở.
- Nội dung riêng theo bên: `src/wedding.config.ts` → `invitations.groom` / `.bride`.
- Admin `/admin`: lọc Nhà trai / Nhà gái / Chưa phân loại, duyệt lời chúc theo bên và xuất CSV theo lọc.
- **Triển khai lên DB cũ: chạy migration** `migrations/001_add_invitation_side.sql` **trước** khi deploy V9.
- Xem hướng dẫn đầy đủ trong **`docs/V9_TWO_INVITATIONS_AND_ADMIN.md`**.

---

> **Phiên bản V8 (21/10/2026):** Gallery desktop collage Polaroid / mobile stacked photos, căn ngày 14, tinh chỉnh khoảng cách, RSVP hai tab đơn giản và popup animation. Xem [V8 change log](docs/V8_GALLERY_RSVP_SPACING_CHANGELOG.md). Giữ nguyên Admin Dashboard từ bản V7 của người dùng.

> **CẬP NHẬT V7:** Đây là bản xây dựng trực tiếp trên `the-living-ribbon-animation-v6-1-update.zip` do bạn cung cấp; giữ trang admin đã thêm. Xem `docs/V7_INVITATION_ADMIN_CHANGELOG.md` để biết cấu trúc thiệp cưới mới, animation Two Halves / One Heart, RSVP pill và modal viết lời chúc.

> **Cập nhật Animation V3 (21/10/2026):** xem `docs/ANIMATION_V3_CHANGELOG.md` để biết những nâng cấp ribbon, opening, story, gallery, calendar, gift và cách kiểm tra mobile/desktop.

# The Living Ribbon — Wedding Website

**Website thiệp cưới cá nhân, responsive, tương tác bằng React + TypeScript + Tailwind CSS 4 + Motion, có Cloudflare Pages Functions + D1 cho RSVP và lời chúc.**

> ⚠️ Project đi kèm **dữ liệu/ảnh minh hoạ lấy từ bản mockup**. Tên, ngày cưới và mọi nội dung cá nhân **đều là DEMO**, không phải thông tin thật. Trước khi chia sẻ, hãy chỉnh `src/wedding.config.ts` và đặt `isDemo: false`.

## 1. Chạy nhanh

Cần Node.js 20+ và npm; kết nối internet khi cài lần đầu.

```bash
npm install
npm run dev
```

Mở `http://localhost:5173` → nhấn **Mở thiệp cưới**. Test cá nhân hoá theo khách mời:

```
http://localhost:5173/?to=Nguyen%20Van%20A
```

Lệnh build production:

```bash
npm run build
npm run preview
```

**Lưu ý chế độ local:** Vite dev không chạy Cloudflare Pages Functions. Lời chúc và RSVP sẽ lưu **thử trên localStorage của chính trình duyệt**, có thông báo rõ "chế độ xem thử". Không phải dữ liệu thật / không đồng bộ. Khi deploy và liên kết D1, API `/api/*` mới lưu vào Cloudflare.

## Phiên bản animation v2 — The Living Ribbon

Bản v2 thay các hiệu ứng fade thuần tuý bằng chuyển động có kịch bản: **bật dấu sáp → lật nắp phong bì → lá thư trồi lên → nét lụa được vẽ → camera chuyển sang Hero**. Phần vào story dùng Memory Portal với khung ảnh mở rộng theo scroll. Giữa các chapter có **6 cảnh nối bằng SVG ribbon được vẽ theo tiến độ cuộn**, đồng thời gallery được mở như lớp giấy, ngày cưới có vòng lụa, và hộp quà được tháo nơ trước khi hiện QR. Có nút **Xem lại hiệu ứng mở thiệp** ở cuối trang để kiểm tra. Chi tiết: `docs/ANIMATION_GUIDE.md`.

**Lưu ý:** để nghe nhạc tự động theo đúng giới hạn autoplay của trình duyệt, cấu hình `musicUrl`, sau đó nhấn **Mở thiệp cưới**. Playback được bắt đầu trong thao tác chạm, không phải sau khi animation kết thúc.

## 2. Những tính năng đã có

- Mở thiệp theo 4 giai đoạn (dấu sáp, phong bì, lá thư, dải lụa/camera), cá nhân hoá `?to=` theo khách mời.
- Hero cinematic, hiệu ứng scroll nhẹ, responsive mobile/desktop.
- Thông tin cô dâu chú rể, gia đình hai bên, story timeline.
- 6 chuyển cảnh dạng chapter scroll-linked nối bằng dải lụa SVG với motif riêng, cùng Memory Portal phóng to khung ảnh (có hỗ trợ giảm chuyển động).
- Countdown real-time, sự kiện, chỉ đường, thêm lịch Google Calendar.
- Album masonry, full-screen lightbox, swipe trên mobile, phím trái/phải và Escape.
- Video YouTube tùy chọn mở modal fullscreen (nếu thiết lập video).
- Lời chúc **The Ribbon of Wishes**: lá thư, chuyển lời chúc, mở rộng thư, form gửi lời chúc.
- RSVP tham dự / vắng mặt, số người, chọn sự kiện, lời nhắn.
- Hộp quà CSS tháo nơ/nhấc nắp trước khi mở modal ngân hàng, QR và sao chép STK.
- Nhạc nền có nút Play/Pause sau khi mở thiệp (bật khi cấu hình tệp mp3).
- Giao diện ẩn/hiện section bằng config; social preview/OG; chia sẻ thiệp cưới.
- Pages Functions + Cloudflare D1 + chuẩn bị xác minh Turnstile; honeypot server-side.

## 3. Thay nội dung cưới của bạn

Mở **`src/wedding.config.ts`**. Các nhóm cần thay:

| Cấu hình | Nội dung |
|---|---|
| `couple` | Tên, monogram, tên đầy đủ và bố mẹ hai bên |
| `date`, `dateText` | Ngày cưới ISO có timezone và text hiển thị |
| `image` | Ảnh hero và ảnh đôi |
| `story` | Timeline tình yêu, ảnh + lời kể |
| `events` | Các sự kiện, thời gian, địa điểm, Google Maps URL |
| `gallery` | Danh sách ảnh gallery; có thể thêm/bớt |
| `bankAccounts` | Tài khoản ngân hàng, QR thật, kiểm tra trước khi dùng |
| `musicUrl` | Ví dụ `/audio/music.mp3` (đặt file trong `public/audio/`) |
| `videoEmbedUrl` | URL embed YouTube theo hướng dẫn trong config |
| `sections` | Bật/tắt từng mục |
| `turnstileSiteKey` | Public key của Turnstile (nếu bật xác minh) |
| `isDemo` | `false` khi sẵn sàng xuất bản |

**Tỷ lệ & kích thước ảnh khuyến nghị:** `docs/IMAGE_GUIDE.md`. Tất cả các dòng chứa ảnh trong `wedding.config.ts` đều có comment đi kèm kích thước phù hợp. Các ảnh hiện tại nằm trong `public/images/`, là ảnh *preview* được cắt từ **mockup thiết kế đã tạo** và cần thay bằng ảnh cưới gốc.

Nhớ cập nhật `index.html`:
- `<title>` và `og:title`, `og:description`.
- Thay `public/og-cover.svg` bằng ảnh cưới tỷ lệ 1200×630.
- `og:image` nên là **URL tuyệt đối** sau khi có `*.pages.dev`, ví dụ `https://ten-thiep.pages.dev/og-cover.jpg` để Zalo/Facebook nhận diện tốt.
- Đổi tên hiển thị ở `calendar-ornament` nếu ngày/tháng khác — xem lưu ý bên dưới.

## 4. Deploy miễn phí trên Cloudflare Pages

1. Tạo GitHub repo và push project này lên.
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Chọn repo, đặt `Build command`: `npm run build`; `Build output directory`: `dist`. Framework preset Vite/React (nếu có).
4. Deploy, bạn sẽ có subdomain như `ten-thiep.pages.dev` (phụ thuộc tên còn trống).
5. Nếu chưa cần RSVP/lời chúc server, UI vẫn chạy; endpoint sẽ trả lỗi 503 có thông báo cho người dùng. Để lưu dữ liệu thật, làm bước 5.

## 5. Kích hoạt D1 database thật

Chạy:

```bash
npx wrangler login
npx wrangler d1 create wedding-db
npx wrangler d1 execute wedding-db --remote --file=./schema.sql
```

Cloudflare Dashboard → **Workers & Pages** → project thiệp cưới → **Settings → Bindings → Add → D1 database**:
- Variable name: **`DB`** (phải khớp chính xác).
- D1 database: `wedding-db`.
- **Redeploy** project sau khi thêm binding.

Không cần `wrangler.jsonc` để triển khai theo cách trên. Có `wrangler.example.jsonc` làm tài liệu cho người thích quản lý binding bằng cấu hình — phải thay Database ID trước khi dùng.

### Lời chúc & RSVP: Trang Quản trị Mini (Admin Portal)

Website tích hợp sẵn **Trang Quản trị Mini bí mật** để cô dâu & chú rể xem số lượng đăng ký và duyệt lời chúc ngay trên điện thoại hoặc máy tính:

- **Cách truy cập**:
  - Truy cập URL: `http://localhost:5173/admin` (hoặc thêm query `?admin=1`).
  - Hoặc kéo xuống chân trang (Footer) và bấm vào nút **"Quản trị thiệp"** (kế bên "Xem lại hiệu ứng mở thiệp").
- **Mã PIN**:
  - Ở localhost (`npm run dev`), dùng bất kỳ PIN demo từ 4 ký tự. **Không có PIN mặc định trong production.**
  - Trên Cloudflare Pages: Vào **Settings → Variables and Secrets** → thêm biến **`ADMIN_PIN`** với mật mã bí mật **tối thiểu 6 ký tự**, nên dùng ngẫu nhiên 12 ký tự trở lên.
- **Tính năng nổi bật**:
  - 👥 **Thống kê đăng ký RSVP**: Đếm tổng số khách tham dự, số người vắng mặt, số suất cỗ theo từng sự kiện (Lễ cưới, Tiệc cưới...).
  - 📥 **Xuất Excel / CSV**: Tải danh sách khách mời (có hỗ trợ UTF-8 tiếng Việt không lỗi font) hoặc bấm **"Sao chép gửi Zalo"** để gửi nhanh cho gia đình/nhà hàng.
  - 💌 **Duyệt lời chúc 1-chạm**: Phân loại theo tab (Chờ duyệt / Đã duyệt / Đã ẩn), có nút **"Duyệt tất cả"** để duyệt hàng loạt chỉ trong 1 giây.

Nếu muốn duyệt bằng terminal như trước, bạn vẫn có thể chạy lệnh:

```bash
npx wrangler d1 execute wedding-db --remote --command="SELECT id, guest_name, message, status FROM wishes ORDER BY id DESC LIMIT 30"
npx wrangler d1 execute wedding-db --remote --command="UPDATE wishes SET status='approved' WHERE id=1"
```

Xem RSVP qua terminal:

```bash
npx wrangler d1 execute wedding-db --remote --command="SELECT guest_name, attending, guest_count, event_id, note, created_at FROM rsvps ORDER BY id DESC"
```

**Quyền riêng tư:** D1 chỉ truy cập qua server Function, KHÔNG đặt URL DB trong frontend. Mọi thao tác quản trị đều xác thực qua `ADMIN_PIN`.

## 6. Bảo vệ form khỏi spam — Turnstile (nên bật trước khi public)

1. Cloudflare Dashboard → **Turnstile** → tạo widget cho `*.pages.dev` (hoặc domain thật) → lấy **Site key** và **Secret key**.
2. Điền `turnstileSiteKey` (site key công khai) vào `src/wedding.config.ts`.
3. Ở Cloudflare Pages → Settings → Variables and Secrets, tạo `TURNSTILE_SECRET` dạng secret (KHÔNG thêm vào source code).
4. Redeploy sau khi cập nhật cấu hình.

Nếu chỉ cấu hình secret mà không điền site key, API sẽ từ chối mọi yêu cầu form. Hai giá trị phải được cấu hình cùng nhau. Khi chưa bật Turnstile, các form chỉ có honeypot và validation nên dễ bị spam nếu gửi link rộng rãi.

## 7. Cấu trúc thư mục

```text
src/
  App.tsx                   # Các section và tương tác UI
  styles.css                # Design system, responsive, hiệu ứng CSS
  wedding.config.ts         # 🔥 SỬA Ở ĐÂY để cá nhân hoá
  lib/
    api.ts                  # API D1 / localStorage demo & Admin API
    utils.ts                # Count down, link calendar, tên khách
  components/
    AdminDashboard.tsx      # 🔐 Trang quản trị mini (duyệt lời chúc, thống kê RSVP)
    Ribbon.tsx              # Vẽ dải lụa SVG theo scroll
    TurnstileWidget.tsx     # Xác minh anti-spam (tuỳ chọn)
server/
  common.js                 # Validate + Turnstile phía máy chủ
functions/api/
  admin.js                  # GET/POST /api/admin (xác thực PIN & thao tác D1)
  wishes.js                 # GET /api/wishes, POST /api/wishes
  rsvp.js                   # POST /api/rsvp
public/images/              # Ảnh minh hoạ: thay bằng ảnh thật
public/og-cover.svg         # Cover preview link
schema.sql                  # DB D1
wrangler.example.jsonc      # Ví dụ cấu hình Cloudflare
```

## 8. Lưu ý trước khi chia sẻ rộng rãi

- Website đã tích hợp **Trang Quản trị Mini** (`/admin` hoặc `?admin=1`), đăng nhập bằng mã PIN bí mật.
- Tên, ngày, sự kiện và hình ảnh trong project là **dữ liệu demo**; hãy thay toàn bộ trước khi public.
- **Mốc lịch nhỏ** trong `EventsSection` được sinh tự động theo `wedding.date` với múi giờ Việt Nam.
- Video chỉ hiện nếu có URL embed thật; âm nhạc chỉ hiện nút khi `musicUrl` có tệp thật; QR không giả lập số tài khoản.
- Sau khi deploy, thử nghiệm trên iPhone Safari, Android Chrome; kiểm tra ảnh, âm thanh, lightbox, RSVP, Turnstile, gửi lời chúc, quyền riêng tư.
- Website sử dụng Google Fonts nên cần kết nối mạng để tải font. CSS đã có font dự phòng.
- D1 có giới hạn Free theo thời điểm triển khai; kiểm tra bảng giá/giới hạn chính thức trên Cloudflare.

## Animation V4 — The Art of Little Moments

Ba ảnh trong "Chuyện chúng mình" được kể như **film sleeve → memories in orbit → sealed promise**. Tựa **FRAGMENTS OF FOREVER** được ghép từng ký tự; ảnh Gallery lần lượt hạ vào khung contact sheet rồi "tráng sáng". Tim rơi nhẹ có thể bật/tắt tại `wedding.effects.heartRain` trong `src/wedding.config.ts`.

Xem `docs/ANIMATION_V4_CHANGELOG.md` để biết cơ chế, tùy chỉnh và phạm vi kiểm tra.

## Animation V5 — Love Messengers

- Hai chú bồ câu Fine Art SVG bay từ hai hướng ngược nhau, mang theo ảnh Polaroid và gắn vào từng cột mốc của **Chuyện chúng mình**.
- Ở cột mốc thứ ba, hai chú chim cùng bay đến và bay ra sau khi ảnh được đặt xuống.
- Không cần asset mới. Thay ảnh trong `src/wedding.config.ts` (ảnh story WebP **900 × 1100 px**, <250 KB).
- Tắt chim bằng `effects.doveMessengers: false` (tim rơi có tùy chọn riêng `effects.heartRain`).
- Xem `docs/DOVE_ANIMATION_V5.md` để chỉnh quỹ đạo và thời gian.


### Bản sửa V6.1
Khôi phục vòng khoanh ngày cưới và bỏ bộ lọc làm ảnh demo bị tối/xỉn. Chi tiết: `docs/IMAGE_CLARITY_AND_CALENDAR_V6_1.md`.

### Cập nhật V8.1 — lỗi animation mobile và modal RSVP

Bản vá từ V8: hoạt cảnh **Thiệp mời · ngày chung đôi** dùng một HTML observer chung để kích hoạt SVG ổn định trên mobile; phần popup **Xác nhận tham dự** đã chừa chỗ cho nút đóng và bỏ viền góc cũ giao nút gửi. Toàn bộ Admin Dashboard, D1, các API và cấu hình ảnh giữ nguyên. Chi tiết: [`docs/V8_1_MOBILE_FIX_CHANGELOG.md`](docs/V8_1_MOBILE_FIX_CHANGELOG.md).


## V8.2 · Mobile focus & opening typography

Xem `docs/V8_2_MOBILE_FOCUS_OPENING_FIX.md` để biết chi tiết sửa iOS Safari tự zoom khi nhấn input/textarea trong modal và chữ “You're Invited” bị cắt nét cuối trên mobile.

### V8.3 — RSVP attention & tự cuộn nhẹ

- Floating RSVP có nhịp lắc ngắn và hào quang mềm, tự dừng khi đã xác nhận.
- Khi khách mở thiệp nhưng không thao tác trong 10 giây, website gợi xem nội dung tiếp theo bằng các bước cuộn nhẹ; dừng khi có tương tác, khi mở popup, album hoặc admin. Hỗ trợ Reduced Motion.
- Có thể tắt hoặc thay đổi nhịp bằng `rsvpAttention`, `autoStoryScroll`, `autoScrollIdleMs`, `autoScrollIntervalMs`, `autoScrollStepViewport` trong `src/wedding.config.ts`.
- Xem chi tiết `docs/V8_3_RSVP_ATTENTION_AUTO_SCROLL.md`.
