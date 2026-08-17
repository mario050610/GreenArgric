import { useEffect, useMemo, useState } from 'react';
import { Clock3, Power } from 'lucide-react';
import { api } from '../lib/api';
import type { Device, Sensor } from '../types';
import { Badge, Card, ErrorBox, Loading, PageTitle } from '../components/UI';
import './DevicesPage.css';

type CommandResponse = {
  message: string;
  device: Device;
  mqtt: { sent: boolean; reason?: string };
};

const sensorLabels: Record<string, string> = {
  light: 'Cường độ ánh sáng', motion: 'Trạng thái chuyển động',
  temperature: 'Nhiệt độ', humidity: 'Độ ẩm không khí',
};

export function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>();
  const [sensors, setSensors] = useState<Sensor[]>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingId, setPendingId] = useState<number>();
  const [seconds, setSeconds] = useState<Record<number, number>>({});
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    try {
      const [nextDevices, nextSensors] = await Promise.all([
        api<Device[]>('/device'), api<Sensor[]>('/sensor/area/1/latest'),
      ]);
      setDevices(nextDevices);
      const liveTypes = ['light', 'motion'];
      setSensors(nextSensors.filter((sensor) => liveTypes.includes(sensor.sensor_type) && sensor.value !== null));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu');
    }
  };

  useEffect(() => {
    void load();
    const refresh = window.setInterval(() => void load(), 2000);
    const clock = window.setInterval(() => setNow(Date.now()), 250);
    return () => { window.clearInterval(refresh); window.clearInterval(clock); };
  }, []);

  const areaDevices = useMemo(() => devices?.filter((device) => device.area_id === 1) ?? [], [devices]);

  async function setDeviceState(device: Device, state: 'ON' | 'OFF') {
    setPendingId(device.device_id);
    setError('');
    setNotice('');
    try {
      const autoOffSeconds = state === 'ON' ? Math.max(0, Number(seconds[device.device_id] || 0)) : 0;
      const result = await api<CommandResponse>('/device/override', {
        method: 'POST',
        body: JSON.stringify({ device_id: device.device_id, state, auto_off_seconds: autoOffSeconds }),
      });
      setNotice(autoOffSeconds
        ? `${device.device_name} đã bật và sẽ tự tắt sau ${autoOffSeconds} giây.`
        : `${result.message}. Đang chờ thiết bị phản hồi.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Thao tác thất bại');
    } finally {
      setPendingId(undefined);
    }
  }

  const remaining = (device: Device) => device.scheduled_off_at
    ? Math.max(0, Math.ceil((new Date(device.scheduled_off_at).getTime() - now) / 1000)) : 0;

  return <>
    <PageTitle title="Điều khiển và cảm biến Khu A" subtitle="Điều khiển trực tiếp YOLO:BIT qua MQTT, tự cập nhật mỗi 2 giây" />
    {error && <ErrorBox message={error} />}
    {notice && <div className="success-box">{notice}</div>}
    <h3 className="section-title">Cảm biến trực tiếp</h3>
    {!sensors ? <Loading /> : <div className="live-sensor-grid">{sensors.map((sensor) => <Card key={sensor.sensor_id}>
      <div className="metric-head"><span>{sensorLabels[sensor.sensor_type] || sensor.sensor_type}</span><span className="online">● LIVE</span></div>
      <div className="metric"><b>{sensor.value ?? '-'}</b><small>{sensor.unit}</small></div>
      <p className="device-seen">Cập nhật: {sensor.reading_time ? new Date(sensor.reading_time).toLocaleTimeString('vi-VN') : '-'}</p>
    </Card>)}</div>}
    <h3 className="section-title">Thiết bị điều khiển</h3>
    {!devices ? <Loading /> : <div className="device-grid">{areaDevices.map((device) => <Card key={device.device_id}>
      <div className="device-icon"><Power /></div>
      <div className="device-title"><div><h3>{device.device_name}</h3><p>{device.device_code} · {device.device_type}</p></div><Badge tone={device.status === 'ON' ? 'blue' : 'gray'}>{device.status}</Badge></div>
      <p className="device-seen">Phản hồi cuối: {device.last_seen ? new Date(device.last_seen).toLocaleString('vi-VN') : 'chưa có'}</p>
      <div className="timer-row"><Clock3 size={16}/><label>Tự tắt sau</label><input type="number" min="0" max="86400" value={seconds[device.device_id] ?? 0} onChange={(event) => setSeconds((old) => ({ ...old, [device.device_id]: Number(event.target.value) }))}/><span>giây</span></div>
      {remaining(device) > 0 && <div className="countdown">Đang chạy · còn {remaining(device)} giây</div>}
      <div className="device-actions">
        <button disabled={pendingId === device.device_id} className="device-on" onClick={() => setDeviceState(device, 'ON')}>BẬT</button>
        <button disabled={pendingId === device.device_id} className="device-off" onClick={() => setDeviceState(device, 'OFF')}>TẮT</button>
      </div>
    </Card>)}</div>}
  </>;
}
