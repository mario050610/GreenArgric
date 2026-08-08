import { useEffect, useState } from 'react';
import { Power } from 'lucide-react';
import { api } from '../lib/api';
import type { Device } from '../types';
import { Badge, Card, ErrorBox, Loading, PageTitle } from '../components/UI';
import './DevicesPage.css';

type CommandResponse = { message: string; device: Device; command: { result_status: string }; mqtt: { sent: boolean; reason?: string } };

export function DevicesPage() {
  const [data, setData] = useState<Device[]>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingId, setPendingId] = useState<number>();
  const load = () => api<Device[]>('/device').then(setData).catch((reason) => setError(reason.message));
  useEffect(() => { void load(); }, []);

  async function toggle(device: Device) {
    setPendingId(device.device_id);
    setError('');
    setNotice('');
    try {
      const result = await api<CommandResponse>('/device/override', {
        method: 'POST',
        body: JSON.stringify({ device_id: device.device_id, state: device.status === 'ON' ? 'OFF' : 'ON' }),
      });
      setNotice(result.mqtt.sent ? `${result.message}. Đang chờ thiết bị phản hồi.` : `${result.message} (${result.mqtt.reason || 'MQTT offline'}).`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Thao tác thất bại');
    } finally {
      setPendingId(undefined);
    }
  }

  return <><PageTitle title="Điều khiển thiết bị" subtitle="Bật/tắt và theo dõi trạng thái phản hồi từ IoT Gateway" />
    {error && <ErrorBox message={error} />}{notice && <div className="success-box">{notice}</div>}
    {!data ? <Loading /> : <div className="device-grid">{data.map((device) => <Card key={device.device_id}>
      <div className="device-icon"><Power /></div><div className="device-title"><div><h3>{device.device_name}</h3><p>{device.area_name} · {device.device_type}</p></div><Badge tone={device.mode === 'AUTO' ? 'blue' : 'gray'}>{device.mode}</Badge></div>
      <p className="device-seen">Phản hồi cuối: {device.last_seen ? new Date(device.last_seen).toLocaleString('vi-VN') : 'chưa có'}</p>
      <div className="device-bottom"><span>Trạng thái: <b>{device.status}</b></span><button aria-label={`Bật tắt ${device.device_name}`} disabled={pendingId === device.device_id} className={device.status === 'ON' ? 'switch on' : 'switch'} onClick={() => toggle(device)}><i /></button></div>
    </Card>)}</div>}
  </>;
}
