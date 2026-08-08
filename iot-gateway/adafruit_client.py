from __future__ import annotations

import json
import queue
import time
from typing import Any

from Adafruit_IO import MQTTClient

from config import GatewayConfig
from switch_protocol import normalize_switch_state


class AdafruitBridge:
    def __init__(self, config: GatewayConfig) -> None:
        self.config = config
        self.commands: queue.Queue[dict[str, Any]] = queue.Queue()
        self.connected = False
        self.client = MQTTClient(config.aio_username, config.aio_key)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self._device_by_command_feed = {
            feed: device for device, feed in config.device_command_feeds.items()
        }

    def _on_connect(self, client: MQTTClient) -> None:
        self.connected = True
        for feed in self.config.device_command_feeds.values():
            client.subscribe(feed)
        feeds = ', '.join(self.config.device_command_feeds.values())
        print(f'[adafruit] Connected; subscribed to: {feeds}')

    def _on_disconnect(self, _client: MQTTClient) -> None:
        self.connected = False
        print('[adafruit] Disconnected')

    def _on_message(self, _client: MQTTClient, feed_id: str, payload: str) -> None:
        feed_key = str(feed_id).split('/')[-1]
        device = self._device_by_command_feed.get(feed_key)
        if not device:
            return

        parsed: Any = payload
        try:
            parsed = json.loads(payload)
        except (json.JSONDecodeError, TypeError):
            pass

        state = normalize_switch_state(parsed)
        if not state:
            print(f'[adafruit] Invalid switch value on {feed_key}: {payload}')
            return

        command: dict[str, Any] = {
            'type': 'command',
            'device': device,
            'state': state,
            'source': 'adafruit-dashboard',
            'feed': feed_key,
        }
        if isinstance(parsed, dict):
            if parsed.get('request_id'):
                command['request_id'] = parsed['request_id']
            if parsed.get('source'):
                command['source'] = parsed['source']

        self.commands.put(command)
        print(f'[adafruit] Command queued: {device} -> {state} ({feed_key})')

    def connect(self, timeout_seconds: float = 15.0) -> None:
        self.client.connect()
        self.client.loop_background()
        deadline = time.monotonic() + timeout_seconds
        while not self.connected and time.monotonic() < deadline:
            time.sleep(0.05)
        if not self.connected:
            raise RuntimeError('Không kết nối được Adafruit IO trong thời gian cho phép')

    def _ensure_connected(self) -> None:
        if not self.connected:
            raise RuntimeError('Adafruit IO chưa kết nối')

    def publish_sensor(self, sensor_type: str, value: Any) -> None:
        feed = self.config.sensor_feeds.get(sensor_type)
        if not feed or value is None:
            return
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            print(f'[adafruit] Skip invalid {sensor_type}: {value}')
            return
        self._ensure_connected()
        self.client.publish(feed, numeric)

    def publish_device_status(self, device: str, state: Any) -> None:
        feed = self.config.device_status_feeds.get(device)
        normalized = normalize_switch_state(state)
        if not feed or not normalized:
            print(f'[adafruit] Skip invalid device status: {device}={state}')
            return
        self._ensure_connected()
        self.client.publish(feed, '1' if normalized == 'ON' else '0')

    def publish_json(self, feed: str, payload: dict[str, Any]) -> None:
        self._ensure_connected()
        self.client.publish(feed, json.dumps(payload, separators=(',', ':')))

    def next_command(self) -> dict[str, Any] | None:
        try:
            return self.commands.get_nowait()
        except queue.Empty:
            return None

    def disconnect(self) -> None:
        if not self.connected:
            return
        self.client.disconnect()
        self.connected = False
