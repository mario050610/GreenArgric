from microbit import pin0, pin1, pin10, pin13, sleep, temperature

from config import (
    LIGHT_MAX_LUX,
    SOIL_DRY_RAW,
    SOIL_WET_RAW,
    TANK_EMPTY_DISTANCE_CM,
    TANK_FULL_DISTANCE_CM,
    USE_DHT20,
    USE_DISTANCE_WATER_LEVEL,
    USE_EXTERNAL_LIGHT,
    USE_SOIL_MOISTURE,
)

try:
    from machine import time_pulse_us
except ImportError:
    time_pulse_us = None

try:
    from dht20 import DHT20
except ImportError:
    DHT20 = None


def clamp(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, value))


def analog_to_percent(raw):
    return round(clamp(float(raw) * 100 / 1023), 1)


def calibrated_percent(raw, wet_raw, dry_raw):
    if wet_raw == dry_raw:
        return 0
    return round(clamp((float(dry_raw) - raw) * 100 / (dry_raw - wet_raw)), 1)


def distance_to_water_level(distance_cm, full_cm, empty_cm):
    if distance_cm is None or empty_cm <= full_cm:
        return None
    return round(clamp((empty_cm - distance_cm) * 100 / (empty_cm - full_cm)), 1)


def read_distance_cm():
    if time_pulse_us is None:
        return None
    try:
        pin10.write_digital(0)
        sleep(2)
        pin10.write_digital(1)
        sleep(1)
        pin10.write_digital(0)
        pulse = time_pulse_us(pin13, 1, 30000)
        if pulse <= 0:
            return None
        return round(pulse / 58.0, 1)
    except (OSError, ValueError):
        return None


class SensorManager:
    def __init__(self):
        self.dht20 = DHT20() if USE_DHT20 and DHT20 else None

    def read_all(self):
        temp_value = None
        humidity_value = None
        if self.dht20:
            try:
                temp_value, humidity_value = self.dht20.read()
            except (OSError, ValueError):
                pass

        # Nhiệt độ tích hợp chỉ là phương án dự phòng khi DHT20 chưa nhận.
        if temp_value is None:
            temp_value = temperature()

        values = {'temperature': temp_value, 'humidity': humidity_value}

        if USE_EXTERNAL_LIGHT:
            values['light'] = round(pin1.read_analog() * LIGHT_MAX_LUX / 1023, 1)

        if USE_SOIL_MOISTURE:
            values['soil_moisture'] = calibrated_percent(
                pin0.read_analog(), SOIL_WET_RAW, SOIL_DRY_RAW,
            )

        if USE_DISTANCE_WATER_LEVEL:
            distance = read_distance_cm()
            if distance is not None:
                values['distance_cm'] = distance
                values['water_level'] = distance_to_water_level(
                    distance, TANK_FULL_DISTANCE_CM, TANK_EMPTY_DISTANCE_CM,
                )

        return values
