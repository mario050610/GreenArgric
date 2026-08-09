from __future__ import annotations

import json
import queue
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

try:
    import paho.mqtt.client as mqtt
except ImportError:  # Cho phép kiểm tra cấu hình trước khi cài dependency.
    mqtt = None

from config import GatewayConfig
from switch_protocol import normalize_switch_state

DEVICE_CODES = {
    'pump': 'PUMP-CIRC-A',
    'grow_light': 'LED-A',
    'fan': 'FAN-A',
    'dosing_pump': 'DOSING-A',
}
DEVICE_ALIASES = {
    'PUMP-CIRC-A': 'pump', 'PUMP-A': 'pump',
    'LED-A': 'grow_light', 'FAN-A': 'fan', 'DOSING-A': 'dosing_pump',
}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sensor_topic(base: str, area_id: int, sensor_type: str) -> str:
    return f'{base}/area/{area_id}/sensor/{sensor_type}/data'


def command_subscription(base: str) -> str:
    return f'{base}/area/+/device/+/set'


class LocalMqttBridge:
    def __init__(self, config: GatewayConfig) -> None:
        if mqtt is None:
            raise RuntimeError(
                'Thiếu paho-mqtt. Hãy chạy: python3 -m pip install -r requirements.txt'
            )
        self.config = config
        self.connected = False
        self.commands: queue.Queue[dict[str, Any]] = queue.Queue()
        self.client = mqtt.Client(client_id='green-argric-python-gateway')
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

    def _on_connect(self, client, _userdata, _flags, reason_code, *_args) -> None:
        if int(reason_code) != 0:
            print(f'[mqtt-local] Kết nối thất bại, mã lỗi: {reason_code}')
            return
        self.connected = True
        topic = command_subscription(self.config.mqtt_base_topic)
        client.subscribe(topic, qos=1)
        print(f'[mqtt-local] Đã kết nối; đang nghe: {topic}')

    def _on_disconnect(self, _client, _userdata, *_args) -> None:
        self.connected = False
        print('[mqtt-local] Đã ngắt kết nối')

    def _on_message(self, _client, _userdata, message) -> None:
        parts = message.topic.split('/')
        if len(parts) < 6:
            return
        device_code = parts[-2]
        device = DEVICE_ALIASES.get(device_code, device_code)
        try:
            parsed = json.loads(message.payload.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            parsed = message.payload.decode('utf-8', errors='replace')
        state = normalize_switch_state(parsed)
        if not state:
            print(f'[mqtt-local] Bỏ qua lệnh không hợp lệ: {message.topic}')
            return
        command = {
            'type': 'command', 'device': device, 'device_code': device_code,
            'state': state, 'source': 'green-argric-backend',
        }
        if isinstance(parsed, dict) and parsed.get('request_id'):
            command['request_id'] = parsed['request_id']
        self.commands.put(command)
        print(f'[mqtt-local] Đã nhận lệnh: {device_code} -> {state}')

    def connect(self) -> None:
        parsed = urlparse(self.config.mqtt_broker)
        if self.config.mqtt_username:
            self.client.username_pw_set(self.config.mqtt_username, self.config.mqtt_password)
        self.client.connect(parsed.hostname or '127.0.0.1', parsed.port or 1883, keepalive=60)
        self.client.loop_start()

    def publish_sensor(self, sensor_type: str, value: Any, area_id: int | None = None) -> None:
        if value is None:
            return
        topic = sensor_topic(self.config.mqtt_base_topic, area_id or self.config.area_id, sensor_type)
        payload = {'value': float(value), 'timestamp': iso_now(), 'source': 'microbit-gateway'}
        self.client.publish(topic, json.dumps(payload, separators=(',', ':')), qos=1)

    def publish_device_status(self, device: str, state: Any, packet: dict[str, Any] | None = None) -> None:
        normalized = normalize_switch_state(state)
        if not normalized:
            return
        packet = packet or {}
        device_code = str(packet.get('device_code') or DEVICE_CODES.get(device, device))
        area_id = int(packet.get('area_id') or self.config.area_id)
        topic = f'{self.config.mqtt_base_topic}/area/{area_id}/device/{device_code}/status'
        payload = {
            'state': normalized, 'request_id': packet.get('request_id'),
            'ok': packet.get('ok', True), 'timestamp': iso_now(),
            'source': 'microbit-gateway',
        }
        self.client.publish(topic, json.dumps(payload, separators=(',', ':')), qos=1)

    def publish_json(self, _feed: str, payload: dict[str, Any]) -> None:
        topic = f'{self.config.mqtt_base_topic}/gateway/status'
        self.client.publish(topic, json.dumps(payload, separators=(',', ':')), qos=1, retain=True)

    def next_command(self) -> dict[str, Any] | None:
        try:
            return self.commands.get_nowait()
        except queue.Empty:
            return None

    def disconnect(self) -> None:
        if self.connected:
            self.client.disconnect()
        self.client.loop_stop()
        self.connected = False
