import { AlertTriangle, BarChart3, Bell, ClipboardList, Gauge, LayoutDashboard, Leaf, LogOut, Map, RadioTower, Search, Settings2, SlidersHorizontal, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types';

const roleLabels: Record<Role, string> = { admin: 'Quản trị viên', owner: 'Chủ vườn', technician: 'Kỹ thuật viên' };
const roleSections: Record<Role, string> = { admin: 'QUẢN TRỊ HỆ THỐNG', owner: 'QUẢN LÝ VƯỜN', technician: 'CÔNG VIỆC KỸ THUẬT' };
const pageTitles: Record<string, string> = { '/': 'Tổng quan', '/environment': 'Chỉ số môi trường', '/devices': 'Thiết bị', '/alerts': 'Cảnh báo bất thường', '/integration': 'Tích hợp IoT', '/history': 'Lịch sử dữ liệu', '/thresholds': 'Cấu hình ngưỡng & Tự động hóa', '/areas': 'Khu vực trồng', '/tasks': 'Công việc & Bảo trì', '/users': 'Quản lý người dùng' };
const items: Array<{ to: string; label: string; roleLabels?: Partial<Record<Role, string>>; icon: LucideIcon; roles: Role[] }> = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, roles: ['admin', 'owner', 'technician'] },
  { to: '/environment', label: 'Chỉ số môi trường', icon: Gauge, roles: ['owner', 'technician'] },
  { to: '/devices', label: 'Thiết bị', roleLabels: { owner: 'Điều khiển thiết bị', admin: 'Quản lý thiết bị', technician: 'Bảo trì thiết bị' }, icon: Settings2, roles: ['admin', 'owner', 'technician'] },
  { to: '/alerts', label: 'Cảnh báo', icon: AlertTriangle, roles: ['admin', 'owner', 'technician'] },
  { to: '/history', label: 'Lịch sử dữ liệu', icon: BarChart3, roles: ['owner', 'technician'] },
  { to: '/thresholds', label: 'Cấu hình ngưỡng', icon: SlidersHorizontal, roles: ['admin', 'owner'] },
  { to: '/areas', label: 'Khu vực trồng', icon: Map, roles: ['admin', 'owner'] },
  { to: '/tasks', label: 'Công việc / Bảo trì', icon: ClipboardList, roles: ['admin', 'technician'] },
  { to: '/integration', label: 'Tích hợp IoT', icon: RadioTower, roles: ['admin', 'owner', 'technician'] },
  { to: '/users', label: 'Người dùng', icon: Users, roles: ['admin'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const visibleItems = items.filter((item) => user && item.roles.includes(user.role));
  const initials = user?.full_name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase() || 'GA';
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Leaf /></div><div><strong>GREEN ARGRIC</strong><small>Cổng {user ? roleLabels[user.role].toLowerCase() : ''}</small></div></div>
      {user && <div className={`role-pill ${user.role}`}><i />{roleLabels[user.role]}</div>}
      {user && <div className="nav-section">{roleSections[user.role]}</div>}
      <nav>{visibleItems.map(({ to, label, roleLabels: labels, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={17} /><span>{user ? labels?.[user.role] || label : label}</span><b>›</b></NavLink>)}</nav>
      <div className="profile"><div className="avatar">{initials}</div><div><strong>{user?.full_name}</strong><small>{user ? roleLabels[user.role] : ''}</small></div></div>
      <button className="logout" onClick={logout}><LogOut size={17} />Đăng xuất</button>
    </aside>
    <main><header><div><h2>{pageTitles[location.pathname] || 'GREEN ARGRIC'}</h2><p>Cập nhật: {new Date().toLocaleString('vi-VN')}</p></div><div className="header-tools"><div className="header-search"><Search size={16} /><input placeholder="Tìm kiếm..." /></div><button className="bell"><Bell size={18} /><i>2</i></button><div className="header-profile"><span>{initials}</span><div><b>{user?.full_name}</b><small>{user ? roleLabels[user.role] : ''}</small></div></div></div></header><section className="content"><Outlet /></section></main>
  </div>;
}
