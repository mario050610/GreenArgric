from yolobit import pin0, pin1

from config import (
    LIGHT_MAX_LUX,
    USE_DHT20,
    USE_EXTERNAL_LIGHT,
    USE_MOTION_SENSOR,
)

try:
    from dht20 import DHT20
except ImportError:
    DHT20 = None


def clamp(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, value))


def analog_to_percent(raw):
    return round(clamp(float(raw) * 100 / 4095), 1)


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

        values = {'temperature': temp_value, 'humidity': humidity_value}

        if USE_EXTERNAL_LIGHT:
            values['light'] = round(pin0.read_analog() * LIGHT_MAX_LUX / 4095, 1)

        if USE_MOTION_SENSOR:
            values['motion'] = 1 if pin1.read_digital() else 0

        return values
