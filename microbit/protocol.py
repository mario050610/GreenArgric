from microbit import uart
import ujson

_buffer = b''


def send(payload):
    uart.write(ujson.dumps(payload) + '\n')


def receive():
    global _buffer
    while uart.any():
        chunk = uart.read()
        if chunk:
            _buffer += chunk
    if b'\n' not in _buffer:
        return None
    line, _buffer = _buffer.split(b'\n', 1)
    try:
        return ujson.loads(line.decode('utf-8').strip())
    except (ValueError, UnicodeError):
        return None
