from microbit import pin2, pin12, pin14, pin15, pin16

from config import RELAY_ACTIVE_LOW

# Relay mini ở P2; hai kênh USB ở P14/P15.
SINGLE_PINS = {
    'pump': pin14,
    'grow_light': pin2,
    'dosing_pump': pin15,
}

STATES = {
    'pump': 'OFF',
    'grow_light': 'OFF',
    'fan': 'OFF',
    'dosing_pump': 'OFF',
}


def output_value(state):
    on = state == 'ON'
    if RELAY_ACTIVE_LOW:
        return 0 if on else 1
    return 1 if on else 0


def initialize():
    for device in STATES:
        set_state(device, 'OFF')


def set_state(device, state):
    normalized = str(state).upper()
    if device not in STATES or normalized not in ('ON', 'OFF'):
        return False

    if device == 'fan':
        # Quạt OhStem dùng hai chân. Chạy thuận: P16 bật, P12 tắt.
        pin16.write_digital(1 if normalized == 'ON' else 0)
        pin12.write_digital(0)
    else:
        SINGLE_PINS[device].write_digital(output_value(normalized))

    STATES[device] = normalized
    return True


def get_state(device):
    return STATES.get(device, 'UNKNOWN')
