from __future__ import annotations

import io
import json
import runpy
import sys
import types
from pathlib import Path


class FakeInput:
    def __init__(self):
        self.data = ''

    def read(self, count):
        value, self.data = self.data[:count], self.data[count:]
        return value


class FakePoll:
    def __init__(self, input_stream):
        self.input_stream = input_stream

    def register(self, _stream, _event):
        pass

    def poll(self, _timeout):
        return [1] if self.input_stream.data else []


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    input_stream = FakeInput()
    output_stream = io.StringIO()
    original_stdin, original_stdout = sys.stdin, sys.stdout
    sys.stdin, sys.stdout = input_stream, output_stream
    sys.modules['ujson'] = json
    sys.modules['uselect'] = types.SimpleNamespace(
        POLLIN=1, poll=lambda: FakePoll(input_stream),
    )
    try:
        protocol = runpy.run_path(str(root / 'protocol.py'))
        input_stream.data = (
            '{"type":"command","device":"fan","state":"ON"}\n'
            '{"type":"heartbeat"}\n'
        )
        first = protocol['receive']()
        second = protocol['receive']()
        assert first == {'type': 'command', 'device': 'fan', 'state': 'ON'}
        assert second == {'type': 'heartbeat'}
        assert protocol['receive']() is None

        protocol['send']({'ok': True})
        assert json.loads(output_stream.getvalue()) == {'ok': True}
    finally:
        sys.stdin, sys.stdout = original_stdin, original_stdout
    print('yolobit protocol tests: PASS')


if __name__ == '__main__':
    main()
