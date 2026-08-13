+USE GreenArgric;
GO

/* =========================================================
   Đối tượng SQL phục vụ demo GREEN ARGRIC
   Có thể chạy lại file này: view/function/procedure/trigger
   được cập nhật bằng CREATE OR ALTER.
   ========================================================= */

IF OBJECT_ID(N'dbo.UserAuditLog', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserAuditLog (
        audit_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        action_type VARCHAR(20) NOT NULL,
        full_name NVARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        role_id INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        changed_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

CREATE OR ALTER VIEW dbo.vw_UserDetails
AS
SELECT
    u.user_id,
    u.full_name,
    u.email,
    r.role_name,
    r.description AS role_description,
    u.status,
    u.created_at
FROM dbo.[User] AS u
INNER JOIN dbo.Role AS r ON r.role_id = u.role_id;
GO

CREATE OR ALTER FUNCTION dbo.fn_CountUsersByRole
(
    @role_name VARCHAR(30)
)
RETURNS INT
AS
BEGIN
    DECLARE @result INT;

    SELECT @result = COUNT(*)
    FROM dbo.[User] AS u
    INNER JOIN dbo.Role AS r ON r.role_id = u.role_id
    WHERE r.role_name = @role_name;

    RETURN ISNULL(@result, 0);
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_CountOpenAlertsByArea
(
    @area_id INT
)
RETURNS INT
AS
BEGIN
    DECLARE @result INT;

    SELECT @result = COUNT(*)
    FROM dbo.Alert
    WHERE area_id = @area_id
      AND status <> 'resolved';

    RETURN ISNULL(@result, 0);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetAreaOperationalSummary
    @area_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH SensorCounts AS (
        SELECT area_id, COUNT(*) AS sensor_count
        FROM dbo.Sensor
        GROUP BY area_id
    ), DeviceCounts AS (
        SELECT area_id, COUNT(*) AS device_count
        FROM dbo.Device
        GROUP BY area_id
    ), AlertCounts AS (
        SELECT area_id, COUNT(*) AS open_alert_count
        FROM dbo.Alert
        WHERE status <> 'resolved'
        GROUP BY area_id
    ), LatestReadings AS (
        SELECT area_id, MAX(reading_time) AS latest_reading_at
        FROM dbo.HydroponicReading
        GROUP BY area_id
    )
    SELECT
        a.area_id,
        a.area_name,
        a.crop_type,
        a.status,
        a.ui_status,
        a.health_score,
        ISNULL(sc.sensor_count, 0) AS sensor_count,
        ISNULL(dc.device_count, 0) AS device_count,
        ISNULL(ac.open_alert_count, 0) AS open_alert_count,
        lr.latest_reading_at
    FROM dbo.HydroponicArea AS a
    LEFT JOIN SensorCounts AS sc ON sc.area_id = a.area_id
    LEFT JOIN DeviceCounts AS dc ON dc.area_id = a.area_id
    LEFT JOIN AlertCounts AS ac ON ac.area_id = a.area_id
    LEFT JOIN LatestReadings AS lr ON lr.area_id = a.area_id
    WHERE @area_id IS NULL OR a.area_id = @area_id
    ORDER BY a.area_id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetUserStatistics
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_users,
        SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) AS locked_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_users
    FROM dbo.[User];

    SELECT
        r.role_name,
        COUNT(u.user_id) AS user_count
    FROM dbo.Role AS r
    LEFT JOIN dbo.[User] AS u ON u.role_id = r.role_id
    GROUP BY r.role_name
    ORDER BY r.role_name;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_User_Audit
ON dbo.[User]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.UserAuditLog
        (user_id, action_type, full_name, email, role_id, status, changed_at)
    SELECT
        i.user_id,
        CASE WHEN d.user_id IS NULL THEN 'INSERT' ELSE 'UPDATE' END,
        i.full_name,
        i.email,
        i.role_id,
        i.status,
        SYSDATETIME()
    FROM inserted AS i
    LEFT JOIN deleted AS d ON d.user_id = i.user_id;

    INSERT INTO dbo.UserAuditLog
        (user_id, action_type, full_name, email, role_id, status, changed_at)
    SELECT
        d.user_id,
        'DELETE',
        d.full_name,
        d.email,
        d.role_id,
        d.status,
        SYSDATETIME()
    FROM deleted AS d
    LEFT JOIN inserted AS i ON i.user_id = d.user_id
    WHERE i.user_id IS NULL;
END;
GO
