# V8.2 · Sửa iOS Safari input zoom và chữ mở thiệp

Bản vá dựa trên source V8.1, giữ nguyên toàn bộ React components, API và Admin Dashboard.

## 1. Khi focus input/textarea, iPhone tự phóng to

**Nguyên nhân:** cả RSVP lẫn form lời chúc đang kế thừa `font-size: 13px` trong CSS. iOS Safari có thể tự động zoom vào input nếu cỡ chữ nhỏ hơn 16px.

**Thay đổi:** Trong `src/styles.css`, tại cuối file, các `input`, `textarea`, `select` thuộc `.modal-card` có `font-size: 16px` trên viewport rộng tối đa 850px. Không vô hiệu hóa pinch zoom hay chỉnh viewport meta; vẫn hỗ trợ phóng to thủ công để đọc nội dung.

## 2. Chữ “You're Invited” bị cắt mép phải

**Nguyên nhân:** cỡ chữ cố định 54px trong media query mobile, không đủ khoảng trống cho nét cuối của font chữ viết tay trên máy nhỏ.

**Thay đổi:** mở rộng vùng an toàn của `.opening-copy`; dùng kích thước chữ co giãn `clamp(39px, 11vw, 54px)`, tăng line-height và padding để chữ `d` được vẽ trọn vẹn. Đồng thời điều chỉnh chữ viết tay nhỏ trên lá thư mở.

## Kiểm tra cần thực hiện trên máy thật

1. iPhone Safari: vào RSVP và gửi lời chúc; chạm vào trường **Tên**, **Lời nhắn/Lời chúc**; trang không tự zoom khi focus.
2. Mở màn hình thiệp ở iPhone SE (320/375px), iPhone 390/430px; nét cuối chữ **Invited** không bị cắt.
3. Thử bàn phím và đóng popup; các nội dung, nút bấm vẫn trong vùng nhìn.

Nếu iPhone trước đó đã tự zoom, tải lại trang ở độ phóng mặc định để kiểm tra thay đổi. Không cần chỉnh API/D1.
