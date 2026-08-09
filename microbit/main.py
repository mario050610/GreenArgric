from microbit import Image, display, running_time, sleep, uart

from actuators import get_state, initialize, set_state
from config import AREA_ID, SAMPLE_INTERVAL_MS, UART_BAUD
from protocol import receive, send
from sensors import SensorManager

uart.init(baudrate=UART_BAUD, bits=8, parity=None, stop=1)
sensors = SensorManager()
initialize()
display.show(Image.YES)
last_sample = -SAMPLE_INTERVAL_MS
last_heartbeat = 0

while True:
    now = running_time()

    command = receive()
    if command and command.get('type') == 'command':
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

    if now - last_sample >= SAMPLE_INTERVAL_MS:
        send({
            'type': 'sensor',
            'area_id': AREA_ID,
            'values': sensors.read_all(),
            'uptime_ms': now,
        })
        last_sample = now

    if now - last_heartbeat >= 30000:
        send({
            'type': 'heartbeat',
            'status': 'online',
            'area_id': AREA_ID,
            'uptime_ms': now,
        })
        last_heartbeat = now

    sleep(20)
