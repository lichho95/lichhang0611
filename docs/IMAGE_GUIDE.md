# Image Guide — ảnh phù hợp cho từng section

Trong `src/wedding.config.ts`, mọi đường dẫn ảnh đều kèm **comment hướng dẫn tỷ lệ / kích thước pixel / dung lượng**. Bạn chỉ việc thay đường dẫn (ưu tiên ảnh ở `public/images/`).

| Vị trí | Tỷ lệ & kích thước | Đề xuất dung lượng | Gợi ý bố cục |
|---|---|---|---|
| **Hero photo** `image.hero` | **3:4, 1200×1600px** | ≤ 400 KB WebP | Cô dâu chú rể ở giữa; trên desktop crop dạng arch, mobile full bleed |
| **Ảnh đôi** `image.couple` | **5:7, 1000×1400px** | ≤ 350 KB WebP | Chân dung 2 người với khoảng trống phía trên |
| **Story (mỗi mốc)** `story[*].image` | **4:5, 900×1100px** | ≤ 250 KB WebP | Trọng tâm ở giữa; cảnh kỷ niệm cá nhân |
| **Gallery** `gallery[*].src` | **3:4 900×1200** hoặc **4:3 1200×900** | 100–300 KB WebP | Mix cận cảnh, toàn cảnh, chân dung; nên 6–12 ảnh |
| **QR ngân hàng** `bankAccounts[*].qrImage` | **1:1, 600×600px** | ≤ 100 KB PNG | Sắc nét, không nén mờ, có khoảng trắng quanh QR |
| **Ảnh chia sẻ** `og-cover.jpg` | **1.91:1, 1200×630px** | ≤ 300 KB JPG | Chừa vùng an toàn xung quanh; giữ text lớn, rõ |
| **Video pre-wedding** | **16:9 1920×1080px** | YouTube embed | Không lưu video lớn cùng Pages nếu có thể |

## Cách thay nhanh

Ví dụ ảnh Hero thật `public/images/anh-cuoi-hero.webp`:

```ts
// ẢNH HERO: 3:4, 1200×1600 px, WebP < 400 KB.
hero: '/images/anh-cuoi-hero.webp',
```

Ví dụ gallery:

```ts
// ẢNH GALLERY: ảnh dọc 900×1200 hoặc ảnh ngang 1200×900; < 300 KB/ảnh.
gallery: [
  { src: '/images/album-01.webp', alt: 'Cô dâu và chú rể bên nhau' },
  { src: '/images/album-02.webp', alt: 'Khoảnh khắc cầu hôn' },
]
```

Gợi ý: nén ảnh với Squoosh, Photoshop hoặc bất kỳ công cụ WebP. Tránh ảnh trên 1 MB/ảnh cho website mobile. Giữ bản gốc ở nơi lưu khác.

## Ảnh đi kèm project

Các tệp `*-preview.webp`, `story-*.webp` và `gallery-*.webp` đang được tạo bằng cách **cắt các vùng hình minh họa từ mockup website The Living Ribbon trong cuộc hội thoại**. Chúng nhằm làm cho website chạy thử được ngay cả khi không tải ảnh từ Internet. **Không phải ảnh cưới thực tế của bạn**; chất lượng chưa phù hợp để sử dụng chính thức. Hãy thay khi có ảnh thật.
