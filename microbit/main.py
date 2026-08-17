from time import sleep_ms, ticks_diff, ticks_ms

from yolobit import Image, display

from actuators import get_state, initialize, set_state
from config import (
    AREA_ID,
    LCD_I2C_ADDRESS,
    LCD_PAGE_INTERVAL_MS,
    SAMPLE_INTERVAL_MS,
    USE_LCD,
)
from lcd1602 import SensorLCD
from protocol import receive, send
from sensors import SensorManager

sensors = SensorManager()
lcd = SensorLCD(USE_LCD, LCD_I2C_ADDRESS, LCD_PAGE_INTERVAL_MS)
initialize()
display.show(Image.YES)
last_sample = -SAMPLE_INTERVAL_MS
last_heartbeat = 0

while True:
    now = ticks_ms()

    command = receive()
    if command and command.get('type') == 'lcd':
        ok = lcd.select(str(command.get('sensor') or 'auto'))
        send({'type': 'lcd_status', 'sensor': command.get('sensor'), 'ok': ok, 'area_id': AREA_ID})
    elif command and command.get('type') == 'command':
        device = command.get('device')
        state = str(command.get('state', '')).upper()
        ok = set_state(device, state)
        send({
            'type': 'status',
            'request_id': command.get('request_id'),
            'device': device,
            'device_code': command.get('device_code'),
            'area_id': AREA_ID,
            'state': get_state(device),
            'ok': ok,
            'uptime_ms': now,
        })
        display.show(Image.YES if ok else Image.NO)
        lcd.show_device(device or 'unknown', get_state(device))

    if ticks_diff(now, last_sample) >= SAMPLE_INTERVAL_MS:
        values = sensors.read_all()
        send({
            'type': 'sensor',
            'area_id': AREA_ID,
            'values': values,
            'uptime_ms': now,
        })
        lcd.show_readings(values, now)
        last_sample = now

    if ticks_diff(now, last_heartbeat) >= 30000:
        send({
            'type': 'heartbeat',
            'status': 'online',
            'area_id': AREA_ID,
            'uptime_ms': now,
        })
        last_heartbeat = now

    sleep_ms(20)
