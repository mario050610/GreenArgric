# GREEN ARGRIC – Micro:bit, Adafruit IO và ứng dụng Web

Bộ mã nguồn hiện thực **Hệ thống giám sát và điều chỉnh môi trường vườn thủy canh thông minh** theo kế hoạch môn học:

```text
Cảm biến/relay
      ↕
Micro:bit
      ↕ USB Serial
Python IoT Gateway
      ↕ MQTT Internet
Adafruit IO Server + Dashboard
      ↕ MQTT
Backend Node.js ↔ Database
      ↕ REST API
Frontend React
```

## Cấu trúc repository

```text
green-argric-implementation/
├── frontend/       React, TypeScript, Vite
├── backend/        Node.js, Express, MQTT Adafruit, SQL Server
├── iot-gateway/    Python Gateway nối Serial và Adafruit IO
├── microbit/       Firmware MicroPython cho Micro:bit
├── simulator/      MQTT local dự phòng
├── infra/          Mosquitto local dự phòng
├── docs/           Adafruit, nối dây, phân công và phần 12
└── docker-compose.yml
```

## Thứ tự triển khai đúng kế hoạch môn học

### Giai đoạn 1 – Adafruit Server/Dashboard

1. Tạo tài khoản Adafruit IO.
2. Tạo các feed trong `docs/ADAFRUIT-SETUP.md`.
3. Tạo dashboard.
4. Chạy Gateway giả lập:

```powershell
cd iot-gateway
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py --simulate
```

### Giai đoạn 2 – IoT Gateway bằng Python

Xác nhận hai chiều:

```text
Gateway → feed cảm biến
các feed `*-control` → Gateway → các feed `*-status`
```

### Giai đoạn 3 – Micro:bit và cảm biến

Nạp các file trong `microbit/`, cắm USB và chạy:

```powershell
python main.py
```

### Giai đoạn 4 – Backend và Frontend

Backend:

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

Trong `backend/.env`:

```env
MQTT_ENABLED=true
MQTT_PROVIDER=adafruit
AIO_USERNAME=your_username
AIO_KEY=your_aio_key
```

Frontend:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Truy cập `http://localhost:5173`.

## Tài khoản demo Web

Mật khẩu chung: `demo123`

| Vai trò | Email |
|---|---|
| Quản trị viên | `admin@greenargric.edu.vn` |
| Chủ vườn | `owner@greenargric.edu.vn` |
| Kỹ thuật viên | `tech@greenargric.edu.vn` |

## Chế độ phát triển không cần thiết bị

- `DATA_MODE=memory`: chạy API/UI không cần SQL Server.
- `python iot-gateway/main.py --simulate`: kiểm thử Adafruit không cần Micro:bit.
- `MQTT_PROVIDER=local`: dùng Mosquitto và Node simulator dự phòng.

## Tài liệu quan trọng

- `docs/ADAFRUIT-SETUP.md`: tạo feed/dashboard và kiểm thử server trước.
- `docs/MICROBIT-WIRING.md`: nối Micro:bit, cảm biến và relay.
- `docs/WORK-DIVISION-4-DEVELOPERS.md`: chia code cho bốn thành viên.
- `docs/CODE-HANDOFF-4-MEMBERS.md`: trạng thái code, lệnh kiểm tra và phần còn cần thiết bị thật.
- `backend/spec-iot.md`: đặc tả feed cảm biến, feed điều khiển 1/0 và giao thức Serial.
- `docs/section-12/`: mẫu minh chứng báo cáo.

## Bảo mật

Không commit `.env`, AIO Key, mật khẩu Wi-Fi hoặc thông tin cá nhân. Chỉ commit các file `.env.example`.
