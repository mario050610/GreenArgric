# Kết nối bộ OhStem YOLO:BIT với GREEN ARGRIC

## Luồng tích hợp

```text
DHT20 + ánh sáng + độ ẩm đất + khoảng cách
  → YOLO:BIT → USB Serial → Python Gateway → MQTT → Backend → Website

Website → Backend → MQTT → Python Gateway → YOLO:BIT
  → relay / công tắc USB / quạt → phản hồi trạng thái về Website
```

## Cắm dây theo thứ tự

1. Rút cáp USB, lắp YOLO:BIT đúng chiều vào mạch mở rộng.
2. Cắm DHT20 vào I2C1 và LCD 16x2 (nếu cần) vào I2C2.
3. Cắm cảm biến ánh sáng vào P0 và cảm biến độ ẩm đất vào P1.
4. Cắm relay mini vào P2. Chỉ dùng LED/tải điện áp thấp để thử.
5. Cắm quạt mini vào cụm P10/P13.
6. Cắm cảm biến khoảng cách vào cụm P14/P15, hướng hai mắt cảm biến thẳng xuống mặt nước.
6. Cắm công tắc USB hai kênh vào P3/P6. USB_OUTPUT1 dùng P3; USB_OUTPUT2 dùng P6.
8. Kiểm tra lại toàn bộ dây, sau đó mới nối cáp USB với laptop.

## Cổng được dùng

| Cổng | Module | Dữ liệu/lệnh |
|---|---|---|
| I2C1 | DHT20 | temperature, humidity |
| I2C2 | LCD 16x2 tùy chọn | hiển thị tại mô hình |
| P0 | Ánh sáng | light (lux ước lượng) |
| P1 | Độ ẩm đất | soil_moisture (%) |
| P2 | Relay mini | grow_light ON/OFF |
| P10/P13 | Quạt mini | fan ON/OFF |
| P14/P15 | Khoảng cách | distance_cm, water_level (%) |
| P3 | USB_OUTPUT1 | pump ON/OFF |
| P6 | USB_OUTPUT2 | dosing_pump ON/OFF |

## Kiểm tra nhanh

1. Nạp firmware trong thư mục `microbit`.
2. Trong WSL chạy `bash ../scripts/check-device-wsl.sh` từ thư mục `iot-gateway`.
3. Chạy Gateway và quan sát gói JSON có nhiệt độ, độ ẩm, ánh sáng, độ ẩm đất và mực nước.
4. Trên Website bật lần lượt đèn thử, quạt và bơm; sau mỗi lần phải quan sát tải thật và trạng thái phản hồi.
5. Tắt toàn bộ thiết bị sau khi kiểm tra.

## Phạm vi dữ liệu thật

DHT20, ánh sáng, độ ẩm đất và mực nước là dữ liệu thật từ bộ kit. pH và EC vẫn là dữ liệu mô phỏng vì bộ trong ảnh không có đầu dò tương ứng.

## An toàn

- Không dùng tải 220 V với relay trong buổi demo.
- Không chạy bơm khô và không để nước chảy gần bo mạch/laptop.
- Không rút cắm module khi đang cấp nguồn.
- Nếu một module không nhận, tắt nguồn rồi kiểm tra đúng tên cổng trước khi đổi code.
