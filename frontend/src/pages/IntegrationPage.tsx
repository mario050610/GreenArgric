import { useCallback, useEffect, useState } from 'react';
import { Cloud, Database, Radio, Server } from 'lucide-react';
import { api } from '../lib/api';
import { Badge, Card, ErrorBox, Loading, PageTitle } from '../components/UI';
import './IntegrationPage.css';

type IntegrationStatus = {
  backend: { status: string; data_mode: string };
  mqtt: { enabled: boolean; provider: string; connected: boolean; broker: string | null; subscriptions: string[]; lastMessageAt: string | null; lastError: string | null };
  gateway: { online: boolean; last_seen: string | null; age_ms: number | null };
  adafruit: { configured: boolean; username: string | null };
};

const formatTime = (value: string | null) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa nhận dữ liệu';

export function IntegrationPage() {
  const [data, setData] = useState<IntegrationStatus>();
  const [error, setError] = useState('');
  const load = useCallback(() => {
    api<IntegrationStatus>('/integration/status')
      .then((result) => { setData(result); setError(''); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được trạng thái'));
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return <>
    <PageTitle title="Trạng thái tích hợp" subtitle="Backend, MQTT, Adafruit IO và Python Gateway" action={<button className="secondary" onClick={load}>Làm mới</button>} />
    {error && <ErrorBox message={error} />}
    {!data ? <Loading /> : <>
      <div className="integration-grid">
        <Card><Server /><h3>Backend</h3><Badge>{data.backend.status}</Badge><p>Chế độ dữ liệu: <b>{data.backend.data_mode}</b></p></Card>
        <Card><Radio /><h3>MQTT</h3><Badge tone={data.mqtt.connected ? 'green' : 'red'}>{data.mqtt.connected ? 'Đã kết nối' : 'Mất kết nối'}</Badge><p>Provider: <b>{data.mqtt.provider}</b></p></Card>
        <Card><Cloud /><h3>Python Gateway</h3><Badge tone={data.gateway.online ? 'green' : 'red'}>{data.gateway.online ? 'Online' : 'Offline'}</Badge><p>Lần cuối: <b>{formatTime(data.gateway.last_seen)}</b></p></Card>
        <Card><Database /><h3>Adafruit IO</h3><Badge tone={data.adafruit.configured ? 'green' : 'yellow'}>{data.adafruit.configured ? 'Đã cấu hình' : 'Chưa cấu hình'}</Badge><p>Tài khoản: <b>{data.adafruit.username || '-'}</b></p></Card>
      </div>
      {data.mqtt.lastError && <ErrorBox message={`MQTT: ${data.mqtt.lastError}`} />}
      <Card className="integration-details"><h3>Chi tiết MQTT</h3><p>Broker: {data.mqtt.broker || '-'}</p><p>Tin nhắn cuối: {formatTime(data.mqtt.lastMessageAt)}</p><p>Subscriptions: {data.mqtt.subscriptions.length}</p></Card>
    </>}
  </>;
}
