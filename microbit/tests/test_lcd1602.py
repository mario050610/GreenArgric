from __future__ import annotations

import runpy
import sys
import types
from pathlib import Path


class FakeLCD:
    def __init__(self, address):
        self.address = address
        self.cursor = (0, 0)
        self.writes = []

    def move_to(self, column, row):
        self.cursor = (column, row)

    def putstr(self, value):
        self.writes.append((self.cursor, value))


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root))
    sys.modules['aiot_lcd1602'] = types.SimpleNamespace(LCD1602=FakeLCD)
    module = runpy.run_path(str(root / 'lcd1602.py'))

    presenter = module['SensorLCD'](False, 0x21, 3000)
    assert presenter.show_readings({'temperature': 28}, 0) is False

    presenter.lcd = FakeLCD(0x21)
    readings = {'motion': 1, 'light': 480, 'ir_code': 69}
    assert presenter.show_readings(readings, 0) is True
    assert presenter.show_readings(readings, 1000) is False
    assert presenter.select('ir_code') is True
    assert presenter.show_readings(readings, 3000) is True
    assert presenter.select('invalid') is False
    assert presenter.show_device('pump', 'ON') is True
    assert presenter.lcd.address == 0x21
    assert presenter.lcd.writes
    print('yolobit lcd1602 tests: PASS')


if __name__ == '__main__':
    main()
