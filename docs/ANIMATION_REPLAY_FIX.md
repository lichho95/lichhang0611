# Animation replay / refresh fix (V5.1)

## Tại sao mất animation?

`Footer` trong `src/App.tsx` trước đây chỉ reset `opened` và `heroRevealed`; trong khi `main` vẫn được mount. Motion dùng `viewport={{once:true}}` và Story dùng `useInView({once:true})`, nên chúng không phát lại.

## Chỗ sửa

- `src/App.tsx`: thêm `animationCycle`, dùng `<main key={animationCycle}>`, và thay callback Replay thành `replayStory()` để tăng `animationCycle`.
- `src/main.tsx`: đặt `history.scrollRestoration = 'manual'` và đưa trang về đầu khi mới tải, chỉ khi `wedding.sections.opening === true`.

## Kết quả mong muốn

- Lần tải/refresh mới: phong bì hiển thị từ đầu; Story và Gallery chỉ chạy khi scroll đến.
- Bấm **Xem lại hiệu ứng mở thiệp**: toàn bộ section remount nên các animation có thể chạy lại.
- RSVP và lời chúc đã lưu ở D1/localStorage không bị xóa, nhưng nội dung form đang gõ dở sẽ reset vì main remount.
- Giữ `once:true` để tránh các card mất đi khi cuộn ngược; nếu muốn phát mỗi lần cuộn vào, cần dùng cơ chế khác.

## Test thủ công

1. Chạy `npm install` và `npm run dev`.
2. Mở thiệp, scroll Story / Gallery, rồi nhấn **Xem lại hiệu ứng mở thiệp** ở footer.
3. Mở thiệp lần nữa và scroll Story / Gallery: chim, ảnh và chữ phải chuyển động lại.
4. Từ cuối trang nhấn F5: trình duyệt phải trở về đầu câu chuyện.
5. Kiểm tra iPhone Safari/Android Chrome nếu có, vì hành vi browser scroll restoration khác nhau.
