# Cấu hình đúng với bộ OhStem YOLO:BIT trong ảnh của nhóm.

AREA_ID = 1
SAMPLE_INTERVAL_MS = 1000
UART_BAUD = 115200

# Hai cổng I2C trên mạch mở rộng cùng dùng P19 (SCL) và P20 (SDA).
# DHT20 va LCD dang khong duoc mach that nhan (E02/E09). Giu driver trong du an
# nhung tat mac dinh de cac cam bien da test van hoat dong doc lap.
USE_DHT20 = False

# LCD1602 OhStem dung I2C, dia chi mac dinh 0x21. Dat USE_LCD = False neu
# khong lap man hinh; firmware van tiep tuc chay neu LCD bi ngat ket noi.
USE_LCD = True
LCD_I2C_ADDRESS = 0x21
LCD_PAGE_INTERVAL_MS = 1000

# Cảm biến Grove.
USE_EXTERNAL_LIGHT = True
USE_MOTION_SENSOR = True

# Hiệu chuẩn cảm biến ánh sáng: giá trị ADC tối đa được quy đổi gần đúng sang lux.
# Đây là số đo tương đối cho mô hình, không thay thế lux meter đã hiệu chuẩn.
LIGHT_MAX_LUX = 1200

# Độ ẩm đất: thay hai giá trị này bằng số ADC đo được khi que khô và khi cắm
# vào đất ẩm. Với cảm biến này, số ADC thường giảm khi đất ẩm hơn.

# Cảm biến siêu âm đặt trên miệng bình. Mực nước 100% tại khoảng cách FULL,
# và 0% tại khoảng cách EMPTY. Đo thực tế rồi sửa hai số này.

# Sơ đồ cổng trên mạch mở rộng OhStem:
# P0      : cảm biến ánh sáng
# P1      : cảm biến độ ẩm đất
# P2      : relay mini (tải thử/đèn)
# P10/P13 : quạt mini (hai chân điều khiển chiều)
# P14/P15 : cảm biến khoảng cách (trigger/echo)
# P3/P6   : công tắc USB 2 kênh (USB_OUTPUT1/USB_OUTPUT2)
# P19/P20 : bus I2C dùng cho LCD1602
RELAY_ACTIVE_LOW = False
