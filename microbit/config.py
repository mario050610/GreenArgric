# Cấu hình đúng với bộ OhStem YOLO:BIT trong ảnh của nhóm.

AREA_ID = 1
SAMPLE_INTERVAL_MS = 5000
UART_BAUD = 115200

# Hai cổng I2C trên mạch mở rộng cùng dùng P19 (SCL) và P20 (SDA).
USE_DHT20 = True

# Cảm biến Grove.
USE_EXTERNAL_LIGHT = True
USE_SOIL_MOISTURE = True
USE_DISTANCE_WATER_LEVEL = True

# Hiệu chuẩn cảm biến ánh sáng: giá trị ADC tối đa được quy đổi gần đúng sang lux.
# Đây là số đo tương đối cho mô hình, không thay thế lux meter đã hiệu chuẩn.
LIGHT_MAX_LUX = 1200

# Độ ẩm đất: thay hai giá trị này bằng số ADC đo được khi que khô và khi cắm
# vào đất ẩm. Với cảm biến này, số ADC thường giảm khi đất ẩm hơn.
SOIL_DRY_RAW = 800
SOIL_WET_RAW = 350

# Cảm biến siêu âm đặt trên miệng bình. Mực nước 100% tại khoảng cách FULL,
# và 0% tại khoảng cách EMPTY. Đo thực tế rồi sửa hai số này.
TANK_FULL_DISTANCE_CM = 3.0
TANK_EMPTY_DISTANCE_CM = 20.0

# Sơ đồ cổng trên mạch mở rộng OhStem:
# P0      : cảm biến độ ẩm đất
# P1      : cảm biến ánh sáng
# P2      : relay mini (tải thử/đèn)
# P10/P13 : cảm biến khoảng cách (trigger/echo)
# P14/P15 : công tắc USB 2 kênh (bơm nước/bơm dự phòng)
# P16/P12 : quạt mini (hai chân điều khiển chiều)
RELAY_ACTIVE_LOW = False
