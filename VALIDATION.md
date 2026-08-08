# Kết quả kiểm tra bản mã nguồn

## Bổ sung ngày 2026-08-09 - validation cuối

- `python microbit/tests/test_protocol.py`: PASS.
- `python iot-gateway/tests/test_switch_protocol.py`: PASS.
- `python -m compileall -q iot-gateway microbit`: PASS.
- Kiểm tra cú pháp 22 file JavaScript Backend/simulator: PASS.
- Frontend TypeScript + Vite production build: PASS (`2217 modules transformed`).
- Build có cảnh báo bundle JavaScript khoảng 738 kB lớn hơn ngưỡng khuyến nghị 500 kB; đây là cảnh báo tối ưu hiệu năng, không làm build thất bại.
- Backend memory smoke test: PASS, gồm 8 tài khoản, tạo tài khoản/thiết bị, đổi mật khẩu, nhắn tin, xóa hội thoại, dữ liệu vai trò và AI mock có nguồn.
- MQTT local integration: PASS cho luồng cảm biến → Mosquitto → Backend → lệnh thiết bị → trạng thái phản hồi.
- SQL Server 2022 integration: PASS; schema/seed thành công, backend ghi reading, khởi động lại và đọc lại đúng dữ liệu đã lưu.
- `frontend/package-lock.json` đã được đồng bộ lại với `package.json`; `npm install --package-lock-only` PASS.
- Có suite chạy lại tại `scripts/validate-software-wsl.sh` và checklist nghiệm thu tại `docs/ACCEPTANCE-CHECKLIST.md`.

Các kết quả trên là bằng chứng phần mềm/mô phỏng. Adafruit IO và Micro:bit/relay thật vẫn chưa được đánh dấu PASS vì môi trường không có AIO credentials và phần cứng của nhóm; không tạo ảnh/video giả thay thế.

## Bổ sung ngày 2026-08-09

- Frontend mở rộng lần 2: PASS (`2217 modules transformed`) với trang Tin nhắn & AI, Báo cáo, Trợ giúp và 16 thiết bị trong lịch công việc/bảo trì.
- Nhắn tin hai chiều Chủ vườn -> Quản trị viên/Kỹ thuật viên qua Backend memory: PASS; hội thoại được tách theo người gửi/nhận.
- AI credential guard: PASS (`503 AI_NOT_CONFIGURED` khi chưa có `OPENAI_API_KEY`). Chưa gọi live OpenAI vì môi trường kiểm tra không có khóa API.
- Frontend TypeScript + Vite production build trong WSL: PASS (`2217 modules transformed`).
- Backend memory smoke test: PASS cho đúng 8 tài khoản gốc, quản trị viên tạo tài khoản, thêm thiết bị, cập nhật mật khẩu và đăng nhập lại bằng mật khẩu mới.
- Các nút xuất CSV và PDF tạo file tải xuống thật; chuông thông báo và hộp trò chuyện cơ bản hoạt động phía giao diện.
- Các khối nội dung dashboard giới hạn `max-w-2xl` đến `max-w-7xl` đã được mở rộng theo chiều ngang phần nội dung.
- `node --check` và `git diff --check`: PASS.

## Bổ sung ngày 2026-08-08

- Frontend TypeScript + Vite production build trong WSL: PASS (`1610 modules transformed`).
- Admin tạo tài khoản mới qua `POST /user`: PASS trên Backend memory tạm; mật khẩu được băm bcrypt và phân quyền đúng.
- Giao diện đã đồng bộ theo `Web Dashboard Design.zip`: Login, sidebar/header, card/table và trang Quản lý người dùng.
- `python microbit/tests/test_protocol.py`: PASS, gồm JSON UART bị chia gói và nhiều dòng trong bộ đệm.
- `python iot-gateway/tests/test_switch_protocol.py`: PASS.
- `python -m compileall -q iot-gateway microbit`: PASS.
- Kiểm tra cú pháp toàn bộ JavaScript Backend và simulator bằng `node --check`: PASS.
- Mosquitto local trong WSL Docker Engine: publish/subscribe nhận đúng `local-mqtt-ok`.
- `git diff --check`: PASS; không phát hiện secret thật trong source.

Kiểm tra Frontend build và Backend runtime chưa hoàn tất trong phiên này: npm trên Windows bị proxy về registry nội bộ rồi timeout; npm 10.8.2/10.9.8 trong container tải package dở và báo `Exit handler never called`, khiến `tsc`, Vite và Express chưa được cài đầy đủ. Đây là giới hạn tải dependency, không được ghi nhận là build pass.

Adafruit IO và thiết bị thật vẫn cần AIO Username/Key cùng Micro:bit/relay của nhóm. Luồng MQTT local đã được kiểm chứng để chạy code khi chưa có các tài nguyên này, nhưng không thay thế minh chứng phần cứng thật.

Ngày kiểm tra: 2026-07-20

## Đã kiểm tra trong môi trường tạo mã nguồn

- Kiểm tra cú pháp JavaScript Backend và simulator.
- `frontend: npm run build` thành công.
- Backend khởi động ở `DATA_MODE=memory` và `MQTT_ENABLED=false`.
- `GET /health` và đăng nhập tài khoản Admin hoạt động.
- `GET /integration/status` trả về bản đồ feed điều khiển/trạng thái.
- Điều khiển thiết bị ở chế độ demo hoạt động khi MQTT chưa bật.
- Python IoT Gateway compile thành công.
- Bộ phân tích lệnh chấp nhận `1/0`, `ON/OFF`, boolean và JSON có `state`.
- Gateway subscribe 4 feed điều khiển riêng và publish 4 feed trạng thái riêng.
- Backend publish `1/0` vào feed điều khiển phù hợp theo thiết bị.
- Firmware Micro:bit compile cú pháp Python thành công.

## Chưa thể xác nhận trong môi trường tạo mã nguồn

- Kết nối thật đến tài khoản Adafruit IO vì không có AIO Username/Key của nhóm.
- Tên cổng COM thực tế của Micro:bit/YOLO:BIT.
- Đúng chân/khe cắm DHT20, cảm biến mực nước, relay trên bộ thiết bị của nhóm.
- Relay kích mức cao hay thấp.
- Luồng thiết bị thật bật quạt/bơm vì không có phần cứng trong môi trường kiểm tra.

Nhóm cần hoàn thành `docs/ADAFRUIT-SETUP.md` và `docs/MICROBIT-WIRING.md`, sau đó cập nhật lại file này bằng kết quả thiết bị thật trước nghiệm thu.
