from __future__ import annotations

import runpy
import sys
import types
from pathlib import Path


class FakePin:
    def __init__(self, analog=0):
        self.analog = analog
        self.writes = []

    def read_analog(self):
        return self.analog

    def write_digital(self, value):
        self.writes.append(value)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root))
    pins = {number: FakePin() for number in (0, 1, 2, 10, 12, 13, 14, 15, 16)}
    sys.modules['microbit'] = types.SimpleNamespace(
        pin0=pins[0], pin1=pins[1], pin2=pins[2], pin10=pins[10],
        pin12=pins[12], pin13=pins[13], pin14=pins[14], pin15=pins[15],
        pin16=pins[16], sleep=lambda _ms: None, temperature=lambda: 25,
    )
    sys.modules['machine'] = types.SimpleNamespace(time_pulse_us=lambda *_args: 580)
    sys.modules['dht20'] = types.SimpleNamespace(DHT20=None)

    sensors = runpy.run_path(str(root / 'sensors.py'))
    assert sensors['calibrated_percent'](800, 350, 800) == 0
    assert sensors['calibrated_percent'](350, 350, 800) == 100
    assert sensors['distance_to_water_level'](3, 3, 20) == 100
    assert sensors['distance_to_water_level'](20, 3, 20) == 0

    actuators = runpy.run_path(str(root / 'actuators.py'))
    assert actuators['set_state']('pump', 'ON') is True
    assert pins[14].writes[-1] == 1
    assert actuators['set_state']('fan', 'ON') is True
    assert pins[16].writes[-1] == 1 and pins[12].writes[-1] == 0
    assert actuators['set_state']('fan', 'OFF') is True
    assert pins[16].writes[-1] == 0 and pins[12].writes[-1] == 0
    print('microbit hardware mapping tests: PASS')


if __name__ == '__main__':
    main()
