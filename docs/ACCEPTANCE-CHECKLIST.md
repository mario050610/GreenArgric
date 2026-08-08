# Checklist nghiệm thu GREEN ARGRIC

## 1. Phần mềm có thể kiểm chứng tự động

Chạy trong WSL tại thư mục repository:

```bash
cd /mnt/d/DADN
bash scripts/validate-software-wsl.sh
```

Điều kiện trước khi chạy:

- `~/green-argric-run/backend/node_modules` và `~/green-argric-run/frontend/node_modules` đã được cài.
- Container `green-argric-mosquitto` đang chạy.
- Container `green-argric-sqlserver` đang chạy.

Suite kiểm tra:

- Giao thức UART Micro:bit và chuyển đổi lệnh relay.
- Biên dịch Python gateway/firmware.
- Frontend TypeScript và Vite production build.
- Backend memory: đăng nhập, 8 tài khoản, tạo tài khoản/thiết bị, đổi mật khẩu, tin nhắn, xóa hội thoại và AI mock.
- MQTT local hai chiều: cảm biến → backend → lệnh thiết bị → trạng thái phản hồi.
- SQL Server: tạo schema/seed, ghi reading, khởi động lại backend và đọc lại dữ liệu.

## 2. Bằng chứng Adafruit IO thật

- [ ] Điền `AIO_USERNAME` và `AIO_KEY` trong `backend/.env` và `iot-gateway/.env`.
- [ ] Tạo đủ feed cảm biến, feed lệnh, feed trạng thái và gateway status theo `docs/ADAFRUIT-SETUP.md`.
- [ ] Chụp Dashboard có dữ liệu cảm biến thật kèm thời gian.
- [ ] Bật/tắt từng Toggle và chụp feed lệnh `1/0` cùng feed trạng thái phản hồi.
- [ ] Chụp trang Tích hợp trên web hiển thị MQTT/Adafruit/Gateway đã kết nối.

## 3. Bằng chứng Micro:bit/YOLO:BIT và relay thật

- [ ] Ghi rõ model bo mạch, cổng serial và tốc độ `115200`.
- [ ] Đối chiếu rồi cập nhật chân DHT20, ánh sáng, mực nước và từng relay trong `microbit/config.py`.
- [ ] Xác nhận `RELAY_ACTIVE_LOW` đúng với module relay thực tế.
- [ ] Chụp sơ đồ dây và ảnh toàn bộ mô hình; không dùng ảnh mô phỏng thay cho phần cứng.
- [ ] Quay video dữ liệu cảm biến đi lên web và lệnh web làm relay/LED/quạt/bơm thay đổi.

## 4. Vị trí minh chứng

- Admin: `docs/section-12/admin/images/`
- Chủ vườn: `docs/section-12/owner/images/`
- Kỹ thuật viên: `docs/section-12/technician/images/`
- IoT/phần cứng: `docs/section-12/iot/images/`

Không đánh dấu các mục phần cứng/Adafruit là PASS nếu chưa có thiết bị, tài khoản và ảnh/video thật.
