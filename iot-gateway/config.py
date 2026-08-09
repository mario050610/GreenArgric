from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return default


@dataclass(frozen=True)
class GatewayConfig:
    mqtt_provider: str
    mqtt_broker: str
    mqtt_username: str | None
    mqtt_password: str | None
    mqtt_base_topic: str
    aio_username: str
    aio_key: str
    serial_port: str | None
    serial_baud: int
    serial_timeout: float
    area_id: int
    publish_interval_seconds: float
    sensor_feeds: dict[str, str]
    device_command_feeds: dict[str, str]
    device_status_feeds: dict[str, str]
    gateway_status_feed: str

    @classmethod
    def from_env(cls) -> 'GatewayConfig':
        provider = os.getenv('MQTT_PROVIDER', 'local').strip().lower()
        if provider not in {'local', 'adafruit'}:
            raise ValueError('MQTT_PROVIDER phải là local hoặc adafruit')

        username = os.getenv('AIO_USERNAME', '').strip()
        key = os.getenv('AIO_KEY', '').strip()
        if provider == 'adafruit' and (not username or not key):
            raise ValueError('Thiếu AIO_USERNAME hoặc AIO_KEY trong iot-gateway/.env')

        return cls(
            mqtt_provider=provider,
            mqtt_broker=os.getenv('MQTT_BROKER', 'mqtt://127.0.0.1:1883').strip(),
            mqtt_username=os.getenv('MQTT_USERNAME', '').strip() or None,
            mqtt_password=os.getenv('MQTT_PASSWORD', '').strip() or None,
            mqtt_base_topic=os.getenv('MQTT_BASE_TOPIC', 'greenargric').strip().strip('/'),
            aio_username=username,
            aio_key=key,
            serial_port=os.getenv('SERIAL_PORT', '').strip() or None,
            serial_baud=int(os.getenv('SERIAL_BAUD', '115200')),
            serial_timeout=_float('SERIAL_TIMEOUT', 0.2),
            area_id=int(os.getenv('AREA_ID', '1')),
            publish_interval_seconds=_float('PUBLISH_INTERVAL_SECONDS', 20.0),
            sensor_feeds={
                'temperature': os.getenv('FEED_TEMPERATURE', 'ga-temperature'),
                'humidity': os.getenv('FEED_HUMIDITY', 'ga-humidity'),
                'light': os.getenv('FEED_LIGHT', 'ga-light'),
                'water_level': os.getenv('FEED_WATER_LEVEL', 'ga-water-level'),
                'ph': os.getenv('FEED_PH', 'ga-ph'),
                'ec': os.getenv('FEED_EC', 'ga-ec'),
            },
            device_command_feeds={
                'pump': os.getenv('FEED_PUMP_COMMAND', 'ga-pump-control'),
                'grow_light': os.getenv('FEED_LIGHT_COMMAND', 'ga-light-control'),
                'fan': os.getenv('FEED_FAN_COMMAND', 'ga-fan-control'),
                'dosing_pump': os.getenv('FEED_DOSING_PUMP_COMMAND', 'ga-dosing-pump-control'),
            },
            device_status_feeds={
                'pump': os.getenv('FEED_PUMP_STATUS', 'ga-pump-status'),
                'grow_light': os.getenv('FEED_LIGHT_STATUS', 'ga-light-status'),
                'fan': os.getenv('FEED_FAN_STATUS', 'ga-fan-status'),
                'dosing_pump': os.getenv('FEED_DOSING_PUMP_STATUS', 'ga-dosing-pump-status'),
            },
            gateway_status_feed=os.getenv('FEED_GATEWAY_STATUS', 'ga-gateway-status'),
        )
