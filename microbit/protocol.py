import sys
import ujson
import uselect

_buffer = ''
_poll = uselect.poll()
_poll.register(sys.stdin, uselect.POLLIN)


def send(payload):
    sys.stdout.write(ujson.dumps(payload) + '\n')


def receive():
    global _buffer
    while _poll.poll(0):
        chunk = sys.stdin.read(1)
        if not chunk:
            break
        _buffer += chunk
    if '\n' not in _buffer:
        return None
    line, _buffer = _buffer.split('\n', 1)
    try:
        return ujson.loads(line.strip())
    except ValueError:
        return None
