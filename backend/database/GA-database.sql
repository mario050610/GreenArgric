IF DB_ID(N'GreenArgric') IS NULL CREATE DATABASE GreenArgric;
GO
USE GreenArgric;
GO

CREATE TABLE Role (
  role_id INT IDENTITY PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL UNIQUE,
  description NVARCHAR(255),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE [User] (
  user_id INT IDENTITY PRIMARY KEY,
  role_id INT NOT NULL REFERENCES Role(role_id),
  full_name NVARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked','inactive')),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE HydroponicArea (
  area_id INT IDENTITY PRIMARY KEY,
  area_name NVARCHAR(100) NOT NULL UNIQUE,
  location NVARCHAR(255), crop_type NVARCHAR(100), description NVARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  ui_status VARCHAR(20), health_score INT, planted_date NVARCHAR(30), harvest_date NVARCHAR(30),
  created_at DATETIME2 DEFAULT SYSDATETIME(), updated_at DATETIME2
);

CREATE TABLE UserArea (
  user_id INT NOT NULL REFERENCES [User](user_id), area_id INT NOT NULL REFERENCES HydroponicArea(area_id),
  access_level VARCHAR(30) NOT NULL DEFAULT 'view', assigned_at DATETIME2 DEFAULT SYSDATETIME(), assigned_by INT NULL REFERENCES [User](user_id),
  CONSTRAINT PK_UserArea PRIMARY KEY(user_id, area_id)
);

CREATE TABLE Sensor (
  sensor_id INT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id),
  sensor_code VARCHAR(50) NOT NULL UNIQUE, sensor_type VARCHAR(30) NOT NULL, unit NVARCHAR(20), mqtt_topic VARCHAR(255), adafruit_feed_key VARCHAR(100),
  calibration_value DECIMAL(12,4), status VARCHAR(20) DEFAULT 'online', installed_at DATETIME2 DEFAULT SYSDATETIME(), last_seen DATETIME2
);

CREATE TABLE Device (
  device_id INT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id), device_code VARCHAR(50) NOT NULL UNIQUE,
  device_name NVARCHAR(100) NOT NULL, device_type VARCHAR(40) NOT NULL, adafruit_device_key VARCHAR(100), command_topic VARCHAR(255), status_topic VARCHAR(255),
  status VARCHAR(10) DEFAULT 'OFF', mode VARCHAR(20) DEFAULT 'MANUAL', installed_at DATETIME2 DEFAULT SYSDATETIME(), last_seen DATETIME2
);

CREATE TABLE PlantBatch (
  batch_id INT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id), plant_name NVARCHAR(100) NOT NULL,
  variety NVARCHAR(100), start_date DATE NOT NULL, expected_harvest_date DATE, growth_stage NVARCHAR(50), status VARCHAR(20), note NVARCHAR(500)
);

CREATE TABLE HydroponicReading (
  reading_id BIGINT IDENTITY PRIMARY KEY, sensor_id INT NOT NULL REFERENCES Sensor(sensor_id), area_id INT NOT NULL REFERENCES HydroponicArea(area_id),
  value DECIMAL(14,4) NOT NULL, unit NVARCHAR(20), reading_time DATETIME2 NOT NULL DEFAULT SYSDATETIME(), quality_flag VARCHAR(20) DEFAULT 'good'
);
CREATE INDEX IX_Reading_SensorTime ON HydroponicReading(sensor_id, reading_time DESC);
CREATE INDEX IX_Reading_AreaTime ON HydroponicReading(area_id, reading_time DESC);

CREATE TABLE DeviceCommand (
  command_id BIGINT IDENTITY PRIMARY KEY, device_id INT NOT NULL REFERENCES Device(device_id), user_id INT NULL REFERENCES [User](user_id),
  command_type VARCHAR(30) NOT NULL, source VARCHAR(20) NOT NULL, payload NVARCHAR(MAX), result_status VARCHAR(30), sent_at DATETIME2 DEFAULT SYSDATETIME(), created_at DATETIME2 DEFAULT SYSDATETIME()
);

CREATE TABLE ThresholdConfig (
  threshold_id INT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id), sensor_type VARCHAR(30) NOT NULL,
  min_value DECIMAL(14,4) NOT NULL, max_value DECIMAL(14,4) NOT NULL, warning_level VARCHAR(20) DEFAULT 'medium', is_activated BIT DEFAULT 1,
  created_by INT NULL REFERENCES [User](user_id), updated_at DATETIME2 DEFAULT SYSDATETIME(), CONSTRAINT UQ_Threshold_AreaType UNIQUE(area_id, sensor_type),
  CONSTRAINT CK_Threshold_Range CHECK(min_value <= max_value)
);

CREATE TABLE Alert (
  alert_id BIGINT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id), sensor_id INT NULL REFERENCES Sensor(sensor_id),
  device_id INT NULL REFERENCES Device(device_id), threshold_id INT NULL REFERENCES ThresholdConfig(threshold_id), title NVARCHAR(200) NOT NULL,
  message NVARCHAR(1000), alert_type VARCHAR(40), severity VARCHAR(20), status VARCHAR(20) DEFAULT 'open', created_at DATETIME2 DEFAULT SYSDATETIME(),
  resolved_at DATETIME2, resolved_by INT NULL REFERENCES [User](user_id)
);

CREATE TABLE Task (
  task_id BIGINT IDENTITY PRIMARY KEY, area_id INT NOT NULL REFERENCES HydroponicArea(area_id), assigned_by INT NULL REFERENCES [User](user_id),
  assigned_to INT NULL REFERENCES [User](user_id), title NVARCHAR(200) NOT NULL, description NVARCHAR(1000), task_type VARCHAR(40),
  scheduled_at DATETIME2 NOT NULL, status VARCHAR(20) DEFAULT 'pending', created_at DATETIME2 DEFAULT SYSDATETIME(), completed_at DATETIME2
);

CREATE TABLE Notification (
  notification_id BIGINT IDENTITY PRIMARY KEY, user_id INT NOT NULL REFERENCES [User](user_id), alert_id BIGINT NULL REFERENCES Alert(alert_id),
  task_id BIGINT NULL REFERENCES Task(task_id), title NVARCHAR(200), message NVARCHAR(1000), type VARCHAR(30), is_read BIT DEFAULT 0, created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO
