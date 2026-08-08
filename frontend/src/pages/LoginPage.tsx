import { useState } from 'react';
import { Activity, BarChart3, Eye, Leaf, Lock, SlidersHorizontal, TriangleAlert, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types';
import './LoginPage.css';

const accounts: Array<{ role: Role; label: string; email: string }> = [
  { role: 'owner', label: 'Chủ vườn', email: 'owner@greenargric.edu.vn' },
  { role: 'admin', label: 'Quản trị viên', email: 'admin@greenargric.edu.vn' },
  { role: 'technician', label: 'Kỹ thuật viên', email: 'tech@greenargric.edu.vn' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>('owner');
  const [email, setEmail] = useState(accounts[0].email);
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const choose = (nextRole: Role) => { setRole(nextRole); setEmail(accounts.find((item) => item.role === nextRole)!.email); setPassword('demo123'); };
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(''); try { await login(email, password); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Đăng nhập thất bại'); } finally { setLoading(false); } }
  return <div className="login-page"><section className="login-visual"><div className="login-brand"><div className="login-logo"><Leaf /></div><div><h1>GREEN ARGRIC</h1><p>Hệ thống giám sát vườn thủy canh thông minh IoT</p></div></div><div className="login-stats"><span><b>6</b>Khu vực</span><span><b>28+</b>Cảm biến IoT</span><span><b>99.8%</b>Uptime</span></div><ul><li><Activity /> Theo dõi chỉ số môi trường 24/7 theo thời gian thực</li><li><SlidersHorizontal /> Điều khiển thiết bị IoT từ xa, tự động hóa thông minh</li><li><TriangleAlert /> Nhận cảnh báo tức thì khi vượt ngưỡng cài đặt</li><li><BarChart3 /> Thống kê năng suất và phân tích xu hướng dữ liệu</li></ul><small className="login-version">GREEN ARGRIC v2.4.1 · © 2026 Smart Agriculture Lab</small></section><section className="login-panel"><form onSubmit={submit}><h2>Đăng nhập</h2><p>Chọn vai trò và nhập thông tin tài khoản</p><div className="role-tabs">{accounts.map((account) => <button type="button" key={account.role} className={role === account.role ? 'active' : ''} onClick={() => choose(account.role)}>{account.label}</button>)}</div><label>Tên đăng nhập</label><div className="input-wrap"><UserRound size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><label>Mật khẩu</label><div className="input-wrap"><Lock size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /><Eye size={16} /></div>{error && <div className="error-box">{error}</div>}<button className="primary" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button><div className="demo-box"><b>Tài khoản demo:</b>{accounts.map((account) => <span key={account.role}><strong>{account.label}:</strong> {account.email}</span>)}<span><strong>Mật khẩu:</strong> demo123</span></div></form></section></div>;
}
