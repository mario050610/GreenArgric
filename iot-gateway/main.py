from __future__ import annotations

import argparse
import random
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Any

from adafruit_client import AdafruitBridge
from config import GatewayConfig
from serial_gateway import MicrobitSerial

RUNNING = True


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def stop_handler(_signum: int, _frame: Any) -> None:
    global RUNNING
    RUNNING = False


def simulated_packet() -> dict[str, Any]:
    return {
        'type': 'sensor',
        'area_id': 1,
        'values': {
            'temperature': round(28 + random.uniform(-1.2, 1.2), 2),
            'humidity': round(72 + random.uniform(-4, 4), 2),
            'light': round(680 + random.uniform(-80, 80), 2),
            'water_level': round(72 + random.uniform(-5, 5), 2),
            'ph': round(6.3 + random.uniform(-0.2, 0.2), 2),
            'ec': round(1.9 + random.uniform(-0.15, 0.15), 2),
        },
    }


def publish_sensor_packet(adafruit: AdafruitBridge, packet: dict[str, Any]) -> None:
    values = packet.get('values')
    if not isinstance(values, dict):
        sensor_type = packet.get('sensor') or packet.get('sensor_type')
        if not sensor_type:
            return
        values = {str(sensor_type): packet.get('value')}
    for sensor_type, value in values.items():
        adafruit.publish_sensor(str(sensor_type), value)
    print('[gateway] Published sensor values:', values)


def process_command(adafruit: AdafruitBridge, serial_link: MicrobitSerial | None) -> None:
    command = adafruit.next_command()
    while command:
        if serial_link:
            serial_link.write_json(command)
            print('[gateway] Command sent to Micro:bit:', command)
        elif adafruit.connected:
            adafruit.publish_device_status(str(command.get('device')), command.get('state'))
            print('[gateway] Simulated device status:', command)
        command = adafruit.next_command()


def process_serial_packet(
    adafruit: AdafruitBridge,
    serial_link: MicrobitSerial,
) -> dict[str, Any] | None:
    packet = serial_link.read_json()
    if not packet:
        return None
    packet_type = packet.get('type')
    if packet_type == 'sensor':
        return packet
    if packet_type == 'status' and adafruit.connected:
        adafruit.publish_device_status(str(packet.get('device')), packet.get('state'))
        print('[gateway] Device status published:', packet)
    elif packet_type == 'heartbeat' and adafruit.connected:
        packet.setdefault('timestamp', iso_now())
        adafruit.publish_json(adafruit.config.gateway_status_feed, packet)
    return None


def run(simulate: bool) -> int:
    config = GatewayConfig.from_env()
    adafruit = AdafruitBridge(config)
    serial_link = None if simulate else MicrobitSerial(
        port=config.serial_port,
        baud=config.serial_baud,
        timeout=config.serial_timeout,
    )
    adafruit.connect()
    if serial_link:
        serial_link.connect()

    try:
        adafruit.publish_json(config.gateway_status_feed, {
            'status': 'online',
            'mode': 'simulate' if simulate else 'microbit',
            'serial': serial_link.port if serial_link else None,
            'timestamp': iso_now(),
        })
        last_sensor_publish = 0.0
        pending_sensor_packet = None
        while RUNNING:
            process_command(adafruit, serial_link)
            if serial_link:
                pending_sensor_packet = process_serial_packet(adafruit, serial_link) or pending_sensor_packet
            elif time.monotonic() - last_sensor_publish >= config.publish_interval_seconds:
                pending_sensor_packet = simulated_packet()

            if (pending_sensor_packet and adafruit.connected
                    and time.monotonic() - last_sensor_publish >= config.publish_interval_seconds):
                publish_sensor_packet(adafruit, pending_sensor_packet)
                pending_sensor_packet = None
                last_sensor_publish = time.monotonic()
            time.sleep(0.05)
    finally:
        if adafruit.connected:
            adafruit.publish_json(config.gateway_status_feed, {
                'status': 'offline',
                'timestamp': iso_now(),
            })
            adafruit.disconnect()
        if serial_link:
            serial_link.close()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description='GREEN ARGRIC Python IoT Gateway')
    parser.add_argument('--simulate', action='store_true', help='Publish simulated data without a Micro:bit')
    args = parser.parse_args()
    signal.signal(signal.SIGINT, stop_handler)
    signal.signal(signal.SIGTERM, stop_handler)
    try:
        return run(args.simulate)
    except (ValueError, RuntimeError) as error:
        print(f'[gateway] {error}', file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        return 0


if __name__ == '__main__':
    raise SystemExit(main())
