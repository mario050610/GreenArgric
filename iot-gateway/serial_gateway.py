from __future__ import annotations

import json
import time
from typing import Any

import serial
from serial.tools import list_ports


class MicrobitSerial:
    def __init__(self, port: str | None, baud: int, timeout: float) -> None:
        self.requested_port = port
        self.baud = baud
        self.timeout = timeout
        self.connection: serial.Serial | None = None

    @staticmethod
    def discover_port() -> str | None:
        ports = list(list_ports.comports())
        preferred = []
        fallback = []
        for port in ports:
            text = ' '.join([
                str(port.device or ''),
                str(port.description or ''),
                str(port.manufacturer or ''),
                str(port.product or ''),
            ]).lower()
            if 'micro:bit' in text or 'microbit' in text or 'mbed' in text or 'daplink' in text:
                preferred.append(port.device)
            elif getattr(port, 'vid', None) == 0x0D28:
                preferred.append(port.device)
            else:
                fallback.append(port.device)
        return preferred[0] if preferred else (fallback[0] if len(fallback) == 1 else None)

    @property
    def port(self) -> str | None:
        return self.connection.port if self.connection else self.requested_port

    @property
    def connected(self) -> bool:
        return bool(self.connection and self.connection.is_open)

    def connect(self) -> None:
        port = self.requested_port or self.discover_port()
        if not port:
            raise RuntimeError('Không tự tìm thấy Micro:bit. Hãy đặt SERIAL_PORT trong .env')
        self.connection = serial.Serial(port=port, baudrate=self.baud, timeout=self.timeout)
        time.sleep(2.0)
        self.connection.reset_input_buffer()
        print(f'[serial] Connected to YOLO:BIT at {port} ({self.baud} baud)')

    def close(self) -> None:
        if self.connection:
            self.connection.close()

    def read_json(self) -> dict[str, Any] | None:
        if not self.connection:
            return None
        raw = self.connection.readline()
        if not raw:
            return None
        text = raw.decode('utf-8', errors='replace').strip()
        if not text:
            return None
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            print(f'[serial] Ignored non-JSON line: {text}')
            return None
        if not isinstance(data, dict):
            print(f'[serial] Ignored JSON that is not an object: {text}')
            return None
        return data

    def write_json(self, payload: dict[str, Any]) -> None:
        if not self.connection:
            raise RuntimeError('Serial chưa kết nối')
        encoded = (json.dumps(payload, separators=(',', ':')) + '\n').encode('utf-8')
        self.connection.write(encoded)
        self.connection.flush()
