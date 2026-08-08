# Bàn giao phần code cho 4 thành viên

Tài liệu này mô tả phần code đã hoàn thiện. Các bước cần tài khoản Adafruit IO, bo mạch, relay, ảnh và video thật vẫn phải được nhóm thực hiện trên thiết bị thực tế.

## Bạn 1 - Adafruit IO và Python IoT Gateway

- Cấu hình từ `iot-gateway/.env.example`; không ghi khóa AIO vào mã nguồn.
- Publish sáu feed cảm biến, subscribe bốn feed điều khiển và publish bốn feed trạng thái.
- Chấp nhận payload `1/0`, `ON/OFF`, boolean hoặc JSON có `state`.
- Hỗ trợ `--simulate`, tự dò cổng Micro:bit, JSON từng dòng và đóng MQTT/Serial sạch khi dừng.

Kiểm tra:

```cmd
cd /d D:\DADN\iot-gateway
python tests\test_switch_protocol.py
python -m compileall -q .
copy .env.example .env
python main.py --simulate
```

Lệnh cuối cần điền `AIO_USERNAME` và `AIO_KEY` thật.

## Bạn 2 - Firmware Micro:bit/YOLO:BIT

- Đọc DHT20, nhiệt độ dự phòng, ánh sáng, mực nước và độ ẩm giá thể tùy chọn.
- Điều khiển bơm, đèn, quạt và bơm dinh dưỡng với relay active-high/active-low.
- Bộ đệm UART xử lý được JSON bị chia thành nhiều gói và giữ lại nhiều dòng chưa đọc.
- Lỗi đọc DHT20 không làm dừng vòng điều khiển.

Kiểm tra cú pháp trên máy tính:

```cmd
cd /d D:\DADN
python -m compileall -q microbit
python microbit\tests\test_protocol.py
```

Sau đó phải cập nhật pin và `RELAY_ACTIVE_LOW` trong `microbit/config.py` theo mô hình thật.

## Bạn 3 - Backend, MQTT và Database

- Nhận dữ liệu cảm biến MQTT, kiểm tra số, lưu reading và đánh giá ngưỡng.
- Tạo cảnh báo, sinh lệnh tự động, publish đúng feed điều khiển và nhận feed trạng thái.
- `DATA_MODE=memory` dùng cho demo không cần SQL Server.
- `DATA_MODE=mssql` nạp dữ liệu từ SQL Server và ghi reading, alert, command, trạng thái thiết bị.
- `/integration/status` trả trạng thái Backend, MQTT, Gateway và cấu hình Adafruit.

Kiểm tra:

```cmd
cd /d D:\DADN\backend
copy .env.example .env
npm ci
npm run check
npm start
```

## Bạn 4 - Frontend và kiểm thử tích hợp

- Các trang đọc dữ liệu qua Backend; Frontend không kết nối trực tiếp Adafruit IO.
- Trang Thiết bị phân biệt lệnh đã gửi MQTT với cập nhật demo và hiển thị lần phản hồi cuối.
- Trang Tích hợp tự làm mới mỗi 10 giây, hiển thị Backend, MQTT, Gateway, Adafruit và lỗi kết nối.
- Trang Tích hợp dùng được cho Admin, Owner và Technician.

Kiểm tra:

```cmd
cd /d D:\DADN\frontend
copy .env.example .env
npm ci
npm run build
npm run dev
```

## Luồng nghiệm thu mô phỏng

1. Chạy Backend với `DATA_MODE=memory`, `MQTT_ENABLED=false` và đăng nhập ba tài khoản demo.
2. Kiểm tra Dashboard, Môi trường, Thiết bị, Cảnh báo, Lịch sử, Ngưỡng và quyền theo vai trò.
3. Mở Tích hợp: Backend phải online; MQTT/Gateway phải báo offline thay vì hiển thị online giả.
4. Bật MQTT local bằng Docker Compose, chạy simulator và xác nhận dữ liệu/cảnh báo/lệnh hai chiều.
5. Chuyển sang Adafruit bằng AIO Username/Key thật, chạy Gateway `--simulate`, sau đó thay bằng Micro:bit thật.

### Build bằng Docker Engine trong WSL

Nếu npm trên Windows bị proxy/timeout, có thể build trong container với `node_modules` nằm trên Docker volume Linux:

```cmd
wsl bash -lc "docker run --rm -v /mnt/d/DADN/frontend:/app -v green_argric_frontend_modules:/app/node_modules -w /app node:20-alpine sh -lc 'npm ci --no-audit --no-fund --progress=false && npm run build'"
wsl bash -lc "docker run --rm -v /mnt/d/DADN/backend:/app -v green_argric_backend_modules:/app/node_modules -w /app node:20-alpine sh -lc 'npm ci --no-audit --no-fund --progress=false && npm run check'"
```

Các lệnh này vẫn cần truy cập npm registry ở lần chạy đầu. Không chép `node_modules` Linux sang Windows.

### MQTT local không cần Adafruit hoặc Micro:bit

```cmd
cd /d D:\DADN
wsl bash -lc "cd /mnt/d/DADN && docker compose --profile local-mqtt up -d mosquitto"
```

Backend dùng cấu hình:

```env
DATA_MODE=memory
MQTT_ENABLED=true
MQTT_PROVIDER=local
MQTT_BROKER=mqtt://host.docker.internal:1883
```

Luồng local này dùng để chứng minh code cảm biến, cảnh báo và điều khiển hai chiều. Nó không thay thế ảnh/video thiết bị thật trong báo cáo.

## Phần còn phụ thuộc bên ngoài

- Tạo feed và Dashboard trong tài khoản Adafruit IO của nhóm.
- Xác nhận cổng COM, pin/khe cắm, nguồn và mức kích relay trên mô hình thật.
- Chụp ảnh, quay video và điền minh chứng phần 12.
