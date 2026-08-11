# Firmware YOLO:BIT – GREEN ARGRIC

Firmware này được cấu hình cho đúng bộ OhStem trong ảnh của nhóm.

## Chức năng

- Đọc DHT20 qua I2C (nhiệt độ, độ ẩm không khí).
- Đọc cảm biến ánh sáng ngoài ở P1.
- Đọc cảm biến độ ẩm đất ở P0 và hiệu chuẩn theo mốc khô/ướt.
- Đọc cảm biến khoảng cách ở P10/P13, quy đổi thành phần trăm mực nước.
- Điều khiển bơm nước và một tải dự phòng qua công tắc USB hai kênh P14/P15.
- Điều khiển quạt mini bằng cặp chân P16/P12.
- Điều khiển relay mini ở P2 cho LED/tải thử điện áp thấp.
- Giao tiếp với Python IoT Gateway qua USB Serial, mỗi gói là một dòng JSON.

## Nạp chương trình

Trong Python Editor dành cho Micro:bit/YOLO:BIT, tạo dự án và thêm đủ các file:

```text
main.py
config.py
dht20.py
sensors.py
actuators.py
protocol.py
```

Tải file HEX và chép vào ổ `MICROBIT`. Sau khi khởi động, bo hiển thị dấu chọn và gửi dữ liệu mỗi 5 giây.

## Sơ đồ cổng OhStem

| Thiết bị | Cổng trên mạch mở rộng |
|---|---|
| DHT20 | I2C1 hoặc I2C2 |
| LCD 16x2 (tùy chọn) | Cổng I2C còn lại |
| Cảm biến độ ẩm đất | P0 |
| Cảm biến ánh sáng | P1 |
| Relay mini/đèn thử | P2 |
| Cảm biến khoảng cách | P10/P13 |
| Công tắc USB kênh 1 – bơm nước | P14 |
| Công tắc USB kênh 2 – tải dự phòng | P15 |
| Quạt mini | P16/P12 |

Không cắm một thiết bị đồng thời vào hai cổng. I2C1 và I2C2 dùng chung bus P19/P20 nên DHT20 và LCD có thể hoạt động cùng lúc nếu địa chỉ không trùng.

## Hiệu chuẩn trước khi demo

1. Mở Serial, đọc giá trị thô của cảm biến đất khi để khô và khi cắm vào đất ẩm.
2. Ghi hai số vào `SOIL_DRY_RAW` và `SOIL_WET_RAW` trong `config.py`.
3. Đo khoảng cách từ cảm biến siêu âm đến mặt nước khi bình đầy và khi bình ở mức thấp nhất.
4. Ghi vào `TANK_FULL_DISTANCE_CM` và `TANK_EMPTY_DISTANCE_CM`.
5. Cảm biến ánh sáng chỉ cho số lux ước lượng. Muốn số tuyệt đối phải hiệu chuẩn bằng máy đo lux.

## An toàn

- Chỉ dùng tải USB/điện áp thấp đi kèm bộ kit; không đấu điện lưới 220 V.
- Không cấp bơm trực tiếp từ GPIO. Bơm phải đi qua công tắc USB hai kênh.
- Tắt nguồn trước khi đổi dây và giữ bo mạch cách xa nước.
- Lần đầu thử bơm chỉ chạy 1–2 giây, đặt đầu hút trong nước và đầu xả vào bình.
