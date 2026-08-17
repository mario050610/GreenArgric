from aiot_dht20 import DHT20 as OhStemDHT20


class DHT20:
    """Adapter around the DHT20 driver bundled with Yolo:Bit."""

    def __init__(self):
        self.sensor = OhStemDHT20()

    def read(self):
        return (
            self.sensor.dht20_temperature(),
            self.sensor.dht20_humidity(),
        )
