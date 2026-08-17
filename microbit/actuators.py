from yolobit import pin2, pin3, pin6, pin10, pin13

from config import RELAY_ACTIVE_LOW

# Relay mini at P2; USB OUTPUT1/OUTPUT2 at P3/P6.
SINGLE_PINS = {
    'pump': pin3,
    'grow_light': pin2,
    'dosing_pump': pin6,
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
        pin10.write_digital(1 if normalized == 'ON' else 0)
        pin13.write_digital(0)
    else:
        SINGLE_PINS[device].write_digital(output_value(normalized))

    STATES[device] = normalized
    return True


def get_state(device):
    return STATES.get(device, 'UNKNOWN')
