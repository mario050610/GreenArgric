from __future__ import annotations

import json
import runpy
import sys
import types
from pathlib import Path


class FakeUart:
    def __init__(self) -> None:
        self.chunks = []
        self.writes = []

    def any(self):
        return bool(self.chunks)

    def read(self):
        return self.chunks.pop(0)

    def write(self, value):
        self.writes.append(value)


def main() -> None:
    uart = FakeUart()
    sys.modules['microbit'] = types.SimpleNamespace(uart=uart)
    sys.modules['ujson'] = json
    protocol = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'protocol.py'))

    uart.chunks.extend([b'{"type":"command",', b'"device":"fan","state":"ON"}\n{"type":"heartbeat"}\n'])
    first = protocol['receive']()
    second = protocol['receive']()
    assert first == {'type': 'command', 'device': 'fan', 'state': 'ON'}
    assert second == {'type': 'heartbeat'}
    assert protocol['receive']() is None

    protocol['send']({'ok': True})
    assert json.loads(uart.writes[-1]) == {'ok': True}
    print('microbit protocol tests: PASS')


if __name__ == '__main__':
    main()
