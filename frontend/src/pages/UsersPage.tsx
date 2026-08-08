import { useEffect, useMemo, useState } from 'react';
import { LockKeyhole, Plus, UserPlus, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Role, User } from '../types';
import { Badge, Card, ErrorBox, PageTitle } from '../components/UI';
import './UsersPage.css';

type FormState = { full_name: string; email: string; password: string; role: Role; status: 'active' | 'locked' };
const emptyForm: FormState = { full_name: '', email: '', password: '', role: 'owner', status: 'active' };
const roleLabel: Record<Role, string> = { admin: 'Quản trị viên', owner: 'Chủ vườn', technician: 'Kỹ thuật viên' };

export function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const load = () => api<User[]>('/user').then(setData).catch((reason) => setError(reason.message));
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: data.length, active: data.filter((user) => user.status === 'active').length, locked: data.filter((user) => user.status !== 'active').length, admins: data.filter((user) => user.role === 'admin').length }), [data]);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try { await api('/user', { method: 'POST', body: JSON.stringify(form) }); setSuccess(`Đã tạo tài khoản ${form.email}`); setForm(emptyForm); setOpen(false); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tạo tài khoản'); }
    finally { setSaving(false); }
  }
  async function toggle(user: User) {
    setError(''); setSuccess('');
    try { await api(`/user/${user.id}/toggle`, { method: 'POST' }); setSuccess(`Đã cập nhật ${user.full_name}`); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể cập nhật tài khoản'); }
  }
  const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

  return <><PageTitle title="Quản lý người dùng" subtitle="Tài khoản và phân quyền hệ thống" />
    <div className="user-stats"><Card><b>{stats.total}</b><span>Tổng tài khoản</span></Card><Card className="active"><b>{stats.active}</b><span>Đang hoạt động</span></Card><Card><b>{stats.locked}</b><span>Tạm khóa</span></Card><Card className="admin"><b>{stats.admins}</b><span>Quản trị viên</span></Card></div>
    {error && <ErrorBox message={error} />}{success && <div className="success-box">{success}</div>}
    <Card className="users-card"><div className="users-card-head"><h3>Danh sách tài khoản người dùng</h3><button className="primary small" onClick={() => setOpen(true)}><Plus size={16} /> Thêm tài khoản</button></div><div className="table-scroll"><table><thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{data.map((user) => <tr key={user.id}><td><div className="user-cell"><i>{initials(user.full_name)}</i><b>{user.full_name}</b></div></td><td>{user.email}</td><td><Badge tone={user.role === 'admin' ? 'green' : user.role === 'owner' ? 'blue' : 'gray'}>{roleLabel[user.role]}</Badge></td><td><span className={`account-status ${user.status === 'active' ? 'on' : ''}`}><i />{user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}</span></td><td><button className="icon-action" title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở tài khoản'} onClick={() => toggle(user)}><LockKeyhole size={15} /></button></td></tr>)}</tbody></table></div></Card>
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="account-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><UserPlus /><span><b>Thêm tài khoản</b><small>Tạo tài khoản và phân quyền truy cập</small></span></div><button onClick={() => setOpen(false)}><X /></button></div><form onSubmit={create}><div className="form-grid"><label>Họ và tên<input required minLength={2} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyễn Văn A" /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@greenargric.edu.vn" /></label><label>Mật khẩu<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" /></label><label>Vai trò<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}><option value="owner">Chủ vườn</option><option value="technician">Kỹ thuật viên</option><option value="admin">Quản trị viên</option></select></label><label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })}><option value="active">Hoạt động</option><option value="locked">Tạm khóa</option></select></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={() => setOpen(false)}>Hủy</button><button className="primary small" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo tài khoản'}</button></div></form></div></div>}
  </>;
}
