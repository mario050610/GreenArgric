#!/usr/bin/env bash
set -euo pipefail

echo 'GREEN ARGRIC - kiểm tra thiết bị thật trong WSL'
echo

if compgen -G '/dev/ttyACM*' >/dev/null; then
  echo '[OK] Tìm thấy cổng Micro:bit:'
  ls -l /dev/ttyACM*
elif compgen -G '/dev/ttyUSB*' >/dev/null; then
  echo '[OK] Tìm thấy cổng Serial USB:'
  ls -l /dev/ttyUSB*
else
  echo '[CHƯA THẤY] Không có /dev/ttyACM* hoặc /dev/ttyUSB*.'
  echo 'Hãy gắn Micro:bit vào WSL bằng usbipd trên Windows rồi chạy lại.'
  exit 1
fi

python3 - <<'PY'
try:
    import serial
    import paho.mqtt.client
    print('[OK] Đã có pyserial và paho-mqtt.')
except ImportError as error:
    print('[THIẾU] Python dependency:', error)
    print('Chạy: cd /mnt/d/DADN/iot-gateway && python3 -m pip install -r requirements.txt')
    raise SystemExit(1)
PY

echo
echo 'Thiết bị và thư viện đã sẵn sàng. Chạy Gateway bằng:'
echo '  cd /mnt/d/DADN/iot-gateway'
echo '  python3 main.py'
