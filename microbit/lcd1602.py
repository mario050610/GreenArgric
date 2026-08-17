"""Failure-safe presenter using the LCD driver bundled with Yolo:Bit."""

from aiot_lcd1602 import LCD1602


class SensorLCD:
    def __init__(self, enabled=True, address=0x21, page_interval_ms=3000):
        self.lcd = None
        self.enabled = enabled
        self.address = address
        self.page = 0
        self.last_page_ms = -page_interval_ms
        self.page_interval_ms = page_interval_ms
        self.selected = 'auto'
        self._connect()

    def _connect(self):
        if not self.enabled or self.lcd:
            return bool(self.lcd)
        try:
            self.lcd = LCD1602(self.address)
            self._show('GREEN ARGRIC', 'Khoi dong...')
            return True
        except Exception as error:
            print('LCD init error:', error)
            self.lcd = None
            return False

    def _show(self, line_1='', line_2=''):
        line_1 = self._fit(line_1)
        line_2 = self._fit(line_2)
        self.lcd.move_to(0, 0)
        self.lcd.putstr(line_1)
        self.lcd.move_to(0, 1)
        self.lcd.putstr(line_2)

    @staticmethod
    def _fit(value):
        text = str(value)[:16]
        return text + (' ' * (16 - len(text)))

    def show_readings(self, values, now_ms):
        if not self._connect() or now_ms - self.last_page_ms < self.page_interval_ms:
            return False
        pages = (
            ('ANH SANG', '{0} lux'.format(self._value(values, 'light'))),
            ('CHUYEN DONG', 'CO' if values.get('motion') else 'KHONG'),
        )
        single = {
            'light': ('ANH SANG P0', '{0} lux'.format(self._value(values, 'light'))),
            'motion': ('CHUYEN DONG', 'CO' if values.get('motion') else 'KHONG'),
        }
        try:
            if self.selected in single:
                self._show(*single[self.selected])
            else:
                self._show(*pages[self.page % len(pages)])
                self.page += 1
            self.last_page_ms = now_ms
            return True
        except Exception:
            self.lcd = None
            return False

    def select(self, sensor):
        allowed = ('auto', 'light', 'motion')
        if sensor not in allowed:
            return False
        self.selected = sensor
        self.last_page_ms = -self.page_interval_ms
        return True

    def show_device(self, device, state):
        if not self.lcd:
            return False
        try:
            self._show('Thiet bi', '{0}: {1}'.format(device, state))
            return True
        except Exception:
            self.lcd = None
            return False

    @staticmethod
    def _value(values, key):
        value = values.get(key)
        return '--' if value is None else value
