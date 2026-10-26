/**
 * TOÀN BỘ THÔNG TIN CÁ NHÂN HOÁ TẠI ĐÂY.
 * Các tên/ngày/ảnh bên dưới CHỈ LÀ DỮ LIỆU DEMO — hãy thay trước khi công khai.
 * Xem docs/IMAGE_GUIDE.md để biết kích thước, vị trí cắt, cách thay ảnh.
 */
export const wedding = {
  isDemo: false,
  couple: {
    groom: 'Lịch',
    bride: 'Hằng',
    initials: 'L & H',
    groomFullName: 'Hồ Trọng Lịch',
    brideFullName: 'Cao Thị Mỹ Hằng',
    groomParents: ['Ông Hồ Phước Lành', 'Bà Mai Thị Hằng'],
    brideParents: ['Ông Cao Chánh Thành', 'Bà Lê Thị Nga'],
  },
  inviteLabel: 'Trân trọng kính mời',
  greeting: 'Một lời mời nhỏ, dành cho một ngày thật đặc biệt.',
  intro: 'Giữa muôn vàn cuộc gặp gỡ, chúng mình đã tìm thấy nhau. Và hôm nay, hạnh phúc ấy sẽ trọn vẹn hơn khi có bạn chung vui.',
  quote: 'Hạnh phúc là khi ta yêu thương và được yêu thương.',
  thanks: 'Cảm ơn bạn đã dành thời gian ghé thăm câu chuyện của chúng mình. Sự hiện diện và những lời chúc tốt đẹp của bạn sẽ luôn là một phần ký ức đáng trân trọng trong ngày vui này.',
  // MP3 128–192 kbps, 1–3 phút, dung lượng lý tưởng < 4 MB. Để '' sẽ ẩn nút nhạc.
  musicUrl: '/music/le-duong.mp3',
  // Cloudflare Turnstile public site key (KHÔNG phải secret); để trống khi chưa bật.
  turnstileSiteKey: '',
  // Đường dẫn video YouTube EMBED dạng https://www.youtube-nocookie.com/embed/VIDEO_ID — để '' nếu không dùng.
  videoEmbedUrl: '',
  image: {
    // LƯU Ý: Ảnh DEMO hiện có được cắt từ mockup và không đủ nét để dùng chính thức.
    // Thay bằng ảnh gốc sắc nét trước khi gửi thiệp; CSS không còn cố tình làm mờ ảnh.
    // ẢNH HERO: chân dung 1200×1600 px (3:4) hoặc lớn hơn, ưu tiên WebP < 400 KB.
    hero: '/images/hero-preview.jpeg',
    // VỊ TRÍ ẢNH HERO: chỉnh trọng tâm sau khi thay ảnh thật, không cần sửa CSS.
    // Mobile & tablet 320–920px: "center 28%" giữ khuôn mặt trong vùng ảnh chính.
    // Desktop: "center 36%". Có thể thử "center top" nếu ảnh rất cao.
    heroPositionMobile: 'center 28%',
    heroPositionDesktop: 'center 36%',
    // ẢNH CẶP ĐÔI: dọc 1000×1400 px (5:7), WebP < 350 KB.
    couple: '/images/couple-preview.jpeg',
  },
  story: [
    {
      id: 'first-meet',
      date: 'Mùa thu 2021',
      title: 'Ngày ta gặp nhau',
      text: 'Chỉ là một cuộc gặp tình cờ, nhưng lại mở đầu cho một câu chuyện dài.',
      // ẢNH TIMELINE 01: 900×1100 px (4:5), < 250 KB.
      image: '/images/story-1.jpg',
    },
    {
      id: 'little-things',
      date: 'Mùa hè 2023',
      title: 'Những điều bé nhỏ',
      text: 'Tình yêu lớn lên từ những buổi chiều giản dị và những lời hỏi han.',
      // ẢNH TIMELINE 02: 900×1100 px (4:5), < 250 KB.
      image: '/images/story-2.jpg',
    },
    {
      id: 'forever',
      date: 'Mùa xuân 2024',
      title: 'Một lời hẹn mãi mãi',
      text: 'Từ hai người xa lạ, chúng mình chọn cùng nhau bước tiếp mọi ngày.',
      // ẢNH TIMELINE 03: 900×1100 px (4:5), < 250 KB.
      image: '/images/story-3.jpg',
    },
  ],
  /**
   * HAI PHIÊN BẢN THIỆP — nội dung chung (ảnh, nhạc, story, gallery, hiệu ứng)
   * giữ ở các trường phía trên. Chỉ ngày, lời mời và các sự kiện khác nhau.
   * LINK RIÊNG: ?side=groom (nhà trai), ?side=bride (nhà gái).
   * Các ngày nhà gái hiện sao chép ngày DEMO nhà trai để website có thể xem thử;
   * BẮT BUỘC thay bằng lịch thực tế trước khi phát thiệp.
   */
  invitations: {
    groom: {
      label: 'Nhà trai',
      leftLabel: 'NHÀ TRAI',
      rightLabel: 'NHÀ GÁI',
      ceremonyName: 'Lễ thành hôn',
      formalText: 'Trân trọng báo tin lễ thành hôn của hai con',
      date: '2026-11-07T09:00:00+07:00',
      dateText: '07 . 11 . 2026',
      leftParents: ['Ông Hồ Phước Lành', 'Bà Mai Thị Hằng'],
      rightParents: ['Ông Cao Chánh Thành', 'Bà Lê Thị Nga'],
      leftName: 'Hồ Trọng Lịch',
      rightName: 'Cao Thị Mỹ Hằng',
      events: [
        { id: 'ceremony', label: 'Lễ thành hôn', time: '09:00 · Thứ bảy, 07/11/2026', venue: 'Nhà riêng chú rể', address: 'TDP Phong Hải 1, Phường Phong Quảng, TP Huế', mapUrl: '' },
        { id: 'reception', label: 'Tiệc cưới nhà trai', time: '10:30 · Thứ bảy, 07/11/2026', venue: 'Nhà văn hóa TDP Phong Hải 1 (Hải Thế cũ)', address: 'TDP Phong Hải 1, Phường Phong Quảng, TP Huế', mapUrl: 'https://maps.app.goo.gl/yJtvKyAqCQx6ijii6' },
      ],
      bankAccount: {
        owner: 'Hồ Trọng Lịch',
        bank: 'Vietcombank',
        accountNumber: '1026082726',
        // QR VIETQR: PNG hoặc WebP vuông 600×600 px, rõ, quét thử trước khi công khai.
        qrImage: '/images/qrcode-groom.jpg',
        role: 'Chú rể',
      },
    },
    bride: {
      label: 'Nhà gái',
      leftLabel: 'NHÀ GÁI',
      rightLabel: 'NHÀ TRAI',
      ceremonyName: 'Lễ vu quy',
      formalText: 'Trân trọng báo tin lễ vu quy của hai con',
      // THAY NGÀY THỰC TẾ của nhà gái. Giá trị dưới đây chỉ là DEMO.
      date: '2026-11-06T08:30:00+07:00',
      dateText: '06 . 11 . 2026',
      leftParents: ['Ông Cao Chánh Thành', 'Bà Lê Thị Nga'],
      rightParents: ['Ông Hồ Phước Lành', 'Bà Mai Thị Hằng'],
      leftName: 'Cao Thị Mỹ Hằng',
      rightName: 'Hồ Trọng Lịch',
      events: [
        { id: 'ceremony', label: 'Lễ vu quy', time: '08:30 · Thứ sáu, 06/11/2026', venue: 'Nhà riêng cô dâu', address: 'TDP Điền Hải 3, Phường Phong Quảng, TP Huế', mapUrl: '' },
        { id: 'reception', label: 'Tiệc cưới nhà gái', time: '10:00 · Thứ sáu, 06/11/2026', venue: 'Nhà văn hóa TDP Điền Hải 3 (Thế Chí Đông 6 cũ)', address: 'TDP Điền Hải 3, Phường Phong Quảng, TP Huế', mapUrl: 'https://maps.app.goo.gl/ixt1C8TXQGFbKSYN9' },
      ],
      bankAccount: {
        owner: 'Cao Thị Mỹ Hằng',
        bank: 'Vietcombank',
        accountNumber: '1022812315',
        // QR VIETQR: PNG hoặc WebP vuông 600×600 px, rõ, quét thử trước khi công khai.
        qrImage: '/images/qrcode-bride.jpg',
        role: 'Cô dâu',
      },
    },
  },
  // ẢNH GALLERY: 900×1200 px (3:4) hoặc 1200×900 px (4:3), WebP ~100–300 KB/tấm.
  // Có thể thêm/bớt ảnh; tỷ lệ gốc sẽ được giao diện sắp xếp linh hoạt.
  gallery: [
    { src: '/images/gallery-1.jpeg', alt: 'Một khoảnh khắc bên nhau' },
    { src: '/images/gallery-2.jpeg', alt: 'Nụ cười thật dịu dàng' },
    { src: '/images/gallery-3.jpg', alt: 'Khoảnh khắc đáng nhớ' },
    { src: '/images/gallery-5.jpg', alt: 'Cùng nhau bước tiếp' },
    { src: '/images/gallery-4.jpg', alt: 'Mình đi cùng nhau nhé' },
    { src: '/images/gallery-6.jpg', alt: 'Ngày chung đôi' },
  ],
  // Để trống cho đến khi có STK THẬT. Không tự tạo QR từ số tài khoản chưa xác nhận.
  bankAccounts: [] as Array<{
    owner: string;
    bank: string;
    accountNumber: string;
    // QR VIETQR: PNG hoặc WebP vuông 600×600 px, rõ, quét thử trước khi công khai.
    qrImage: string;
    role: 'Chú rể' | 'Cô dâu';
  }>,
  // Lời chúc DEMO CHỈ xuất hiện khi chưa kết nối D1; không phải lời chúc thật.
  demoWishes: [
    { id: 1, guest_name: 'Người bạn thân', message: 'Chúc hai bạn luôn chọn nhau, từ những ngày rực rỡ cho đến những ngày thật bình yên.', side: 'groom', created_at: '2026-10-01T09:30:00Z' },
    { id: 2, guest_name: 'Một người thương', message: 'Mong mỗi sớm mai thức dậy, hai bạn đều có lý do để mỉm cười cùng nhau. Trăm năm hạnh phúc nhé!', side: 'bride', created_at: '2026-10-02T10:30:00Z' },
    { id: 3, guest_name: 'Bạn của hai người', message: 'Tình yêu đẹp nhất là khi hai người luôn là nhà của nhau. Chúc một hành trình thật dài và dịu dàng!', side: 'groom', created_at: '2026-10-03T11:30:00Z' },
  ],
  // HIỆU ỨNG NỀN: tim rơi nhẹ ở mép màn hình; tắt bằng false nếu muốn giao diện tĩnh.
  effects: {
    heartRain: true,
    // LOVE MESSENGERS: chim bồ câu Fine Art mang và gắn card ký ức khi scroll; đổi thành false để tắt.
    doveMessengers: true,
    // Floating RSVP: lắc rất nhẹ theo nhịp + hào quang champagne, dừng sau khi xác nhận.
    rsvpAttention: true,
    // Tự cuộn nhẹ chỉ SAU khi mở thiệp và nếu khách chưa từng tự tương tác.
    // Không tự mở phong bì, không chạy khi mở popup / Admin / Reduced Motion.
    autoStoryScroll: true,
    autoScrollIdleMs: 10000,       // Chờ 10 giây không thao tác trước lần cuộn đầu tiên.
    autoScrollIntervalMs: 9000,   // Các lần cuộn tiếp theo cách nhau 9 giây.
    autoScrollStepViewport: 0.63, // Mỗi lần di chuyển 63% chiều cao viewport.

  },
  sections: {
    opening: true,
    couple: true,
    story: true,
    countdown: true,
    events: true,
    gallery: true,
    wishes: true,
    rsvp: true,
    gift: true,
  },
} as const;
