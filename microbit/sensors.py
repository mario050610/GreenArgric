from microbit import display, pin1, pin2, temperature

from config import USE_DHT20, USE_SOIL_MOISTURE

try:
    from dht20 import DHT20
except ImportError:
    DHT20 = None


def percent_from_analog(raw):
    value = int(raw * 100 / 1023)
    return max(0, min(100, value))


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
                temp_value = None
                humidity_value = None

        # Fallback giúp demo được ngay cả khi chưa gắn DHT20.
        if temp_value is None:
            temp_value = temperature()

        values = {
            'temperature': temp_value,
            'humidity': humidity_value,
            'light': display.read_light_level(),
            'water_level': percent_from_analog(pin1.read_analog()),
        }
        if USE_SOIL_MOISTURE:
            values['soil_moisture'] = percent_from_analog(pin2.read_analog())
        return values
