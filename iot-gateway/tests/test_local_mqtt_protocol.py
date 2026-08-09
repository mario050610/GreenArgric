from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from local_mqtt_client import DEVICE_ALIASES, command_subscription, sensor_topic


def main() -> None:
    assert command_subscription('greenargric') == 'greenargric/area/+/device/+/set'
    assert sensor_topic('greenargric', 1, 'temperature') == (
        'greenargric/area/1/sensor/temperature/data'
    )
    assert DEVICE_ALIASES['FAN-A'] == 'fan'
    assert DEVICE_ALIASES['LED-A'] == 'grow_light'
    print('local MQTT protocol tests: PASS')


if __name__ == '__main__':
    main()
