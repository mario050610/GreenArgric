from __future__ import annotations

import runpy
import sys
import types
from pathlib import Path


class FakePin:
    def __init__(self, number, analog=0):
        self.pin = number
        self.analog = analog
        self.writes = []

    def read_analog(self):
        return self.analog

    def read_digital(self):
        return 1 if self.analog else 0

    def write_digital(self, value):
        self.writes.append(value)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root))
    pins = {number: FakePin(number) for number in (0, 1, 2, 3, 6, 10, 13, 14, 15)}
    sys.modules['yolobit'] = types.SimpleNamespace(
        pin0=pins[0], pin1=pins[1], pin2=pins[2], pin3=pins[3], pin6=pins[6],
        pin10=pins[10], pin13=pins[13], pin14=pins[14], pin15=pins[15],
    )
    class FakeIR:
        def __init__(self, pin): self.pin = pin
        def get_code(self): return 69
    sys.modules['aiot_ir_receiver'] = types.SimpleNamespace(IR_RX=FakeIR)
    class FakeMachinePin:
        IN = 0
        def __init__(self, number, mode): self.number, self.mode = number, mode
    sys.modules['machine'] = types.SimpleNamespace(Pin=FakeMachinePin)
    sys.modules['dht20'] = types.SimpleNamespace(DHT20=None)

    sensors = runpy.run_path(str(root / 'sensors.py'))
    pins[1].analog = 1
    values = sensors['SensorManager']().read_all()
    assert values['motion'] == 1
    assert values['ir_code'] == 69

    actuators = runpy.run_path(str(root / 'actuators.py'))
    assert actuators['set_state']('pump', 'ON') is True
    assert pins[3].writes[-1] == 1
    assert actuators['set_state']('pump', 'OFF') is True
    assert pins[3].writes[-1] == 0
    assert actuators['set_state']('dosing_pump', 'ON') is True
    assert pins[6].writes[-1] == 1
    assert actuators['set_state']('fan', 'ON') is True
    assert pins[10].writes[-1] == 1 and pins[13].writes[-1] == 0
    assert actuators['set_state']('fan', 'OFF') is True
    assert pins[10].writes[-1] == 0 and pins[13].writes[-1] == 0
    print('microbit hardware mapping tests: PASS')


if __name__ == '__main__':
    main()
