import React, { useEffect, useState } from "react";
import {
  Leaf, Droplets, Thermometer, Sun, Wind, AlertTriangle,
  BarChart2, Users, Settings, LogOut, Bell, Search, Activity,
  Home, Sliders, History, Map, CheckCircle, Clock, Plus,
  Edit2, Trash2, Download, ChevronRight, Eye, EyeOff,
  ArrowUp, ArrowDown, ArrowRight, Lock, Zap, Gauge, Mail,
  MessageCircle, Bot, Send, X, FileText, HelpCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Role = "owner" | "admin" | "tech";

type Screen =
  | "login"
  | "dashboard" | "environment" | "devices" | "history" | "alerts"
  | "thresholds" | "zones" | "tasks" | "users" | "notifications" | "profile"
  | "owner-yield" | "messages" | "reports" | "help"
  | "logo";

// ── Data ─────────────────────────────────────────────────────────────────

const HOURLY = [
  { t: "00:00", tmp: 23.1, hum: 68, ph: 6.1, ec: 1.82, lux: 0 },
  { t: "03:00", tmp: 22.5, hum: 71, ph: 6.0, ec: 1.79, lux: 0 },
  { t: "06:00", tmp: 23.2, hum: 68, ph: 6.0, ec: 1.81, lux: 120 },
  { t: "09:00", tmp: 25.8, hum: 63, ph: 6.2, ec: 1.88, lux: 480 },
  { t: "12:00", tmp: 27.9, hum: 58, ph: 6.4, ec: 1.95, lux: 750 },
  { t: "15:00", tmp: 28.2, hum: 56, ph: 6.3, ec: 1.97, lux: 680 },
  { t: "18:00", tmp: 26.1, hum: 62, ph: 6.1, ec: 1.89, lux: 210 },
  { t: "21:00", tmp: 24.3, hum: 66, ph: 6.0, ec: 1.84, lux: 0 },
];

const HISTORY_7D = [
  { date: "23/06", nhietDo: 25.1, doAm: 65, pH: 6.2, ec: 1.85 },
  { date: "24/06", nhietDo: 24.7, doAm: 67, pH: 6.1, ec: 1.82 },
  { date: "25/06", nhietDo: 26.3, doAm: 62, pH: 6.3, ec: 1.88 },
  { date: "26/06", nhietDo: 25.8, doAm: 64, pH: 6.0, ec: 1.84 },
  { date: "27/06", nhietDo: 27.2, doAm: 59, pH: 6.4, ec: 1.92 },
  { date: "28/06", nhietDo: 26.5, doAm: 61, pH: 6.2, ec: 1.89 },
  { date: "29/06", nhietDo: 27.8, doAm: 58, pH: 6.3, ec: 1.95 },
];

const WEEKLY = [
  { day: "T2", tb: 25.2, max: 28.1, min: 22.3, canh_bao: 2 },
  { day: "T3", tb: 24.8, max: 27.5, min: 21.9, canh_bao: 1 },
  { day: "T4", tb: 26.1, max: 29.2, min: 22.8, canh_bao: 5 },
  { day: "T5", tb: 25.5, max: 28.7, min: 22.1, canh_bao: 3 },
  { day: "T6", tb: 24.9, max: 27.9, min: 22.5, canh_bao: 2 },
  { day: "T7", tb: 25.8, max: 28.3, min: 22.9, canh_bao: 1 },
  { day: "CN", tb: 26.3, max: 29.0, min: 23.1, canh_bao: 4 },
];

const ALERTS_INIT = [
  { id: 1, level: "danger", sensor: "pH", zone: "Khu A", msg: "pH vượt ngưỡng trên: 7.1 (max 6.5)", time: "10:32", date: "29/06/2026", resolved: false },
  { id: 2, level: "warning", sensor: "Nhiệt độ", zone: "Khu B", msg: "Nhiệt độ cao bất thường: 29.5°C", time: "09:15", date: "29/06/2026", resolved: false },
  { id: 3, level: "warning", sensor: "Mực nước", zone: "Khu C", msg: "Mực nước bể thấp: 38% (min 40%)", time: "08:47", date: "29/06/2026", resolved: true },
  { id: 4, level: "danger", sensor: "EC", zone: "Khu A", msg: "EC quá thấp: 1.1 mS/cm (min 1.2)", time: "07:20", date: "29/06/2026", resolved: true },
  { id: 5, level: "info", sensor: "Hệ thống", zone: "Khu D", msg: "Đèn LED tắt tự động lúc 22:00", time: "22:00", date: "28/06/2026", resolved: true },
  { id: 6, level: "warning", sensor: "Độ ẩm", zone: "Khu B", msg: "Độ ẩm KK thấp: 52% (min 55%)", time: "14:33", date: "28/06/2026", resolved: true },
];

const DEVICES_INIT = [
  { id: 1, name: "Máy bơm dinh dưỡng A", zone: "Khu A", type: "pump", on: true, mode: "auto", watt: 150, lastRun: "10:30" },
  { id: 2, name: "Máy bơm tưới B", zone: "Khu B", type: "pump", on: false, mode: "schedule", watt: 120, lastRun: "08:00" },
  { id: 3, name: "Hệ thống đèn LED A", zone: "Khu A", type: "light", on: true, mode: "schedule", watt: 300, lastRun: "06:00" },
  { id: 4, name: "Hệ thống đèn LED B", zone: "Khu B", type: "light", on: true, mode: "schedule", watt: 280, lastRun: "06:00" },
  { id: 5, name: "Quạt thông gió C", zone: "Khu C", type: "fan", on: true, mode: "auto", watt: 80, lastRun: "09:15" },
  { id: 6, name: "Máy điều chỉnh pH", zone: "Khu A", type: "dosing", on: false, mode: "manual", watt: 50, lastRun: "07:45" },
  { id: 7, name: "Bơm oxy hòa tan D", zone: "Khu D", type: "pump", on: true, mode: "auto", watt: 60, lastRun: "10:00" },
  { id: 8, name: "Quạt làm mát D", zone: "Khu D", type: "fan", on: false, mode: "auto", watt: 100, lastRun: "15:30" },
  { id: 9, name: "Bơm tuần hoàn E", zone: "Khu E", type: "pump", on: true, mode: "auto", watt: 135, lastRun: "10:20" },
  { id: 10, name: "Đèn LED sinh trưởng E", zone: "Khu E", type: "light", on: true, mode: "schedule", watt: 320, lastRun: "06:00" },
  { id: 11, name: "Quạt đối lưu E", zone: "Khu E", type: "fan", on: true, mode: "auto", watt: 75, lastRun: "10:10" },
  { id: 12, name: "Bơm dinh dưỡng F", zone: "Khu F", type: "dosing", on: false, mode: "schedule", watt: 55, lastRun: "08:30" },
  { id: 13, name: "Bơm tuần hoàn F", zone: "Khu F", type: "pump", on: true, mode: "auto", watt: 125, lastRun: "10:25" },
  { id: 14, name: "Đèn LED sinh trưởng F", zone: "Khu F", type: "light", on: true, mode: "schedule", watt: 300, lastRun: "06:00" },
  { id: 15, name: "Máy châm dinh dưỡng B", zone: "Khu B", type: "dosing", on: false, mode: "auto", watt: 48, lastRun: "07:50" },
  { id: 16, name: "Bơm oxy hòa tan C", zone: "Khu C", type: "pump", on: true, mode: "auto", watt: 65, lastRun: "10:05" },
];

const ZONES = [
  { id: 1, name: "Khu A", crop: "Rau muống", area: "20 m²", planted: "15/05", harvest: "30/06", health: 92, sensors: 4, status: "good" },
  { id: 2, name: "Khu B", crop: "Xà lách xanh", area: "15 m²", planted: "01/06", harvest: "15/07", health: 87, sensors: 3, status: "good" },
  { id: 3, name: "Khu C", crop: "Cải bó xôi", area: "18 m²", planted: "20/05", harvest: "04/07", health: 74, sensors: 4, status: "warning" },
  { id: 4, name: "Khu D", crop: "Húng quế", area: "12 m²", planted: "10/06", harvest: "25/07", health: 95, sensors: 3, status: "good" },
  { id: 5, name: "Khu E", crop: "Cà chua bi", area: "25 m²", planted: "01/05", harvest: "15/07", health: 63, sensors: 5, status: "danger" },
  { id: 6, name: "Khu F", crop: "Dưa leo", area: "22 m²", planted: "05/06", harvest: "20/07", health: 88, sensors: 4, status: "good" },
];

const USERS_INIT = [
  { id: 1, name: "Phạm Phước Nguyên", email: "nguyen.ppn@greenargric.edu.vn", role: "admin", dept: "Khoa CNTT", status: "active", lastLogin: "29/06/2026 10:32" },
  { id: 2, name: "Huỳnh Minh Quân", email: "quan.hmq@greenargric.edu.vn", role: "operator", dept: "Khoa Nông học", status: "active", lastLogin: "29/06/2026 09:15" },
  { id: 3, name: "Nguyễn Thanh Tâm", email: "tam.nt@greenargric.edu.vn", role: "viewer", dept: "Khoa CNTT", status: "active", lastLogin: "28/06/2026 16:40" },
  { id: 4, name: "Nguyễn Thúy Ái", email: "ai.nta@greenargric.edu.vn", role: "operator", dept: "Khoa Nông học", status: "active", lastLogin: "28/06/2026 14:22" },
  { id: 5, name: "Phạm Đình Duy Thái", email: "thai.pdd@greenargric.edu.vn", role: "viewer", dept: "Sinh viên K21", status: "inactive", lastLogin: "25/06/2026 11:05" },
  { id: 6, name: "Trần Huỳnh Đăng Khoa", email: "khoa.thdk@greenargric.edu.vn", role: "viewer", dept: "Sinh viên K21", status: "active", lastLogin: "29/06/2026 08:30" },
  { id: 7, name: "Trần Thị Nhi", email: "nhi.tt@greenargric.edu.vn", role: "operator", dept: "Khoa Nông học", status: "active", lastLogin: "29/06/2026 07:55" },
  { id: 8, name: "Nguyễn Văn Đức", email: "duc.nv@greenargric.edu.vn", role: "viewer", dept: "Sinh viên K22", status: "active", lastLogin: "28/06/2026 13:10" },
];

const FARM_IMG = "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?w=1400&h=600&fit=crop&auto=format";

// ── Shared UI ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ width: 40, height: 22, background: on ? "#2E7D32" : "#D1D5DB" }}>
      <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: `translateX(${on ? "20px" : "3px"})` }} />
    </button>
  );
}

function ArcGauge({ value, min, max, unit, color = "#2E7D32", size = 100 }: {
  value: number; min: number; max: number; unit: string; color?: string; size?: number;
}) {
  const sc = size / 100;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const r = 38 * sc, cx = 50 * sc, cy = 52 * sc, sw = 8 * sc;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const pt = (ang: number): [number, number] => [
    parseFloat((cx + r * Math.cos(toRad(ang))).toFixed(2)),
    parseFloat((cy + r * Math.sin(toRad(ang))).toFixed(2)),
  ];
  const [sx, sy] = pt(135);
  const [ex, ey] = pt(45);
  const [vx, vy] = pt(135 + pct * 270);
  const la = pct * 270 > 180 ? 1 : 0;
  return (
    <svg width={size} height={96 * sc} viewBox={`0 0 ${size} ${96 * sc}`}>
      <path d={`M${sx},${sy} A${r},${r},0,1,1,${ex},${ey}`} fill="none" stroke="#E8F5E9" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0.01 && <path d={`M${sx},${sy} A${r},${r},0,${la},1,${vx},${vy}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
      <text x={cx} y={cy - 7 * sc} textAnchor="middle" fontSize={16 * sc} fontWeight="700" fill="#1F2937" fontFamily="Inter,system-ui,sans-serif">{value}</text>
      <text x={cx} y={cy + 9 * sc} textAnchor="middle" fontSize={9 * sc} fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{unit}</text>
    </svg>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────

const OWNER_NAV = [
  { id: "dashboard", label: "Tổng quan", Icon: Home },
  { id: "environment", label: "Chỉ số môi trường", Icon: Activity },
  { id: "devices", label: "Điều khiển thiết bị", Icon: Sliders },
  { id: "history", label: "Lịch sử dữ liệu", Icon: History },
  { id: "alerts", label: "Cảnh báo", Icon: AlertTriangle, badge: 2 },
  { id: "thresholds", label: "Cấu hình ngưỡng", Icon: Settings },
  { id: "zones", label: "Khu vực trồng", Icon: Map },
  { id: "owner-yield", label: "Thống kê năng suất", Icon: BarChart2 },
  { id: "tasks", label: "Công việc / Bảo trì", Icon: Clock },
  { id: "messages", label: "Tin nhắn", Icon: MessageCircle },
  { id: "reports", label: "Báo cáo", Icon: FileText },
  { id: "notifications", label: "Cài đặt thông báo", Icon: Bell },
  { id: "help", label: "Trợ giúp", Icon: HelpCircle },
  { id: "profile", label: "Hồ sơ cá nhân", Icon: Users },
];

const ADMIN_NAV = [
  { id: "dashboard", label: "Tổng quan", Icon: Home },
  { id: "devices", label: "Quản lý thiết bị", Icon: Zap },
  { id: "alerts", label: "Cảnh báo", Icon: AlertTriangle, badge: 2 },
  { id: "thresholds", label: "Cấu hình ngưỡng", Icon: Settings },
  { id: "zones", label: "Khu vực trồng", Icon: Map },
  { id: "tasks", label: "Công việc / Bảo trì", Icon: Clock },
  { id: "users", label: "Người dùng", Icon: Users },
  { id: "messages", label: "Tin nhắn", Icon: MessageCircle },
  { id: "reports", label: "Báo cáo hệ thống", Icon: FileText },
  { id: "help", label: "Trợ giúp", Icon: HelpCircle },
  { id: "profile", label: "Hồ sơ cá nhân", Icon: Users },
];

const TECH_NAV = [
  { id: "dashboard", label: "Tổng quan", Icon: Home },
  { id: "environment", label: "Chỉ số môi trường", Icon: Activity },
  { id: "devices", label: "Bảo trì thiết bị", Icon: Zap },
  { id: "history", label: "Lịch sử dữ liệu", Icon: History },
  { id: "alerts", label: "Cảnh báo", Icon: AlertTriangle, badge: 2 },
  { id: "tasks", label: "Công việc / Bảo trì", Icon: Clock },
  { id: "messages", label: "Tin nhắn", Icon: MessageCircle },
  { id: "reports", label: "Báo cáo kỹ thuật", Icon: FileText },
  { id: "help", label: "Trợ giúp", Icon: HelpCircle },
  { id: "profile", label: "Hồ sơ cá nhân", Icon: Users },
];

function Sidebar({ active, role, onNavigate, onLogout }: {
  active: Screen; role: Role; onNavigate: (s: Screen) => void; onLogout: () => void;
}) {
  const nav = role === "owner" ? OWNER_NAV : role === "admin" ? ADMIN_NAV : TECH_NAV;
  const userName = role === "owner" ? "Huỳnh Minh Quân" : role === "admin" ? "Phạm Phước Nguyên" : "Trần Huỳnh Đăng Khoa";
  const userInitial = role === "owner" ? "Q" : role === "admin" ? "N" : "K";
  const userRole = role === "owner" ? "Chủ vườn" : role === "admin" ? "Quản trị viên" : "Kỹ thuật viên";
  const menuLabel = role === "owner" ? "Quản lý vườn" : role === "admin" ? "Quản trị hệ thống" : "Công việc kỹ thuật";

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto"
      style={{ background: "#1B5E20" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <Leaf size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">GREEN ARGRIC</div>
            <div className="text-[11px]" style={{ color: "#86EFAC" }}>
              {role === "owner" ? "Cổng chủ vườn" : role === "admin" ? "Cổng quản trị" : "Cổng kỹ thuật viên"}
            </div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: role === "owner" ? "rgba(134,239,172,0.15)" : role === "admin" ? "rgba(251,191,36,0.15)" : "rgba(147,197,253,0.15)" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: role === "owner" ? "#86EFAC" : role === "admin" ? "#FCD34D" : "#93C5FD" }} />
          <span className="text-xs font-semibold" style={{ color: role === "owner" ? "#86EFAC" : role === "admin" ? "#FCD34D" : "#93C5FD" }}>
            {role === "owner" ? "Chủ vườn" : role === "admin" ? "Quản trị viên" : "Kỹ thuật viên"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#86EFAC" }}>
          {menuLabel}
        </div>
        {nav.map(({ id, label, Icon, badge }: any) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id as Screen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
              }}>
              <Icon size={17} className="flex-shrink-0" />
              <span className="text-[13px] font-medium flex-1">{label}</span>
              {badge && !isActive && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {badge}
                </span>
              )}
              {isActive && <ChevronRight size={13} className="opacity-50" />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: role === "owner" ? "#388E3C" : role === "admin" ? "#2E7D32" : "#1D4ED8" }}>{userInitial}</div>
          <div>
            <div className="text-white text-sm font-medium">{userName}</div>
            <div className="text-[11px]" style={{ color: "#86EFAC" }}>{userRole}</div>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ color: "#FCA5A5" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <LogOut size={17} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<Screen, string> = {
  login: "",
  dashboard: "Tổng quan",
  environment: "Chỉ số môi trường",
  devices: "Thiết bị",
  history: "Lịch sử dữ liệu",
  alerts: "Cảnh báo bất thường",
  thresholds: "Cấu hình ngưỡng & Tự động hóa",
  zones: "Khu vực trồng",
  tasks: "Công việc & Bảo trì",
  users: "Quản lý người dùng",
  notifications: "Cài đặt thông báo",
  profile: "Hồ sơ cá nhân",
  "owner-yield": "Thống kê năng suất",
  messages: "Trung tâm tin nhắn & AI",
  reports: "Báo cáo & xuất dữ liệu",
  help: "Trợ giúp sử dụng",
  logo: "Nhận diện thương hiệu",
};

function Header({ screen, role, onNavigate }: { screen: Screen; role: Role; onNavigate: (screen: Screen) => void }) {
  const userName = role === "owner" ? "Huỳnh Minh Quân" : role === "admin" ? "Phạm Phước Nguyên" : "Trần Huỳnh Đăng Khoa";
  const userInitial = role === "owner" ? "Q" : role === "admin" ? "N" : "K";
  const userRole = role === "owner" ? "Chủ vườn" : role === "admin" ? "Quản trị viên" : "Kỹ thuật viên";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(2);
  const [chatMode, setChatMode] = useState<"owner" | "ai">("ai");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ from: "ai", text: "Xin chào! Tôi có thể hỗ trợ phân tích tình trạng vườn và hướng dẫn vận hành." }]);
  const sendMessage = () => {
    const text = message.trim(); if (!text) return;
    const reply = chatMode === "owner" ? "Tin nhắn đã được gửi đến Chủ vườn Huỳnh Minh Quân." : /nhiệt|temperature/i.test(text) ? "Nhiệt độ hiện tại trong bộ dữ liệu là 27.8°C, vẫn nằm trong ngưỡng cấu hình 22–30°C." : /ph/i.test(text) ? "pH hiện tại là 6.3. Khuyến nghị duy trì trong khoảng 5.8–6.5." : /cảnh báo/i.test(text) ? "Hệ thống đang có 2 cảnh báo chưa xử lý. Bạn nên ưu tiên cảnh báo pH và nhiệt độ." : "Tôi đã ghi nhận. Bạn có thể hỏi về nhiệt độ, pH, cảnh báo hoặc trạng thái thiết bị.";
    setMessages((items) => [...items, { from: "me", text }, { from: chatMode, text: reply }]); setMessage("");
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm"
      style={{ height: 72 }}>
      <div>
        <h1 className="text-lg font-bold text-gray-800">{PAGE_TITLES[screen]}</h1>
        <p className="text-xs text-gray-400">Cập nhật: 29/06/2026 · 10:45:22</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-52">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" placeholder="Tìm kiếm..." />
        </div>
        <button onClick={() => onNavigate("messages")} className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors" title="Tin nhắn và trợ lý AI"><MessageCircle size={17} className="text-gray-600" /></button>
        <button onClick={() => { setNotificationsOpen(!notificationsOpen); setUnread(0); }} className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell size={17} className="text-gray-600" />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>}
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "#2E7D32" }}>{userInitial}</div>
          <div>
            <div className="text-sm font-semibold text-gray-700">{userName}</div>
            <div className="text-xs text-gray-400">{userRole}</div>
          </div>
        </div>
      </div>
      {notificationsOpen && <div className="absolute right-52 top-16 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3"><div className="font-bold text-sm px-2 py-2">Thông báo</div>{[{t:"pH vượt ngưỡng tại Khu A",s:"10:32"},{t:"Công việc bảo trì sắp đến hạn",s:"09:15"},{t:"Gateway đã kết nối lại",s:"08:47"}].map((item) => <div key={item.t} className="p-3 rounded-xl hover:bg-gray-50"><div className="text-sm text-gray-700">{item.t}</div><div className="text-xs text-gray-400 mt-1">{item.s}</div></div>)}</div>}
      {chatOpen && <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-end p-5"><div className="w-[390px] h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"><div className="p-4 text-white flex items-center justify-between" style={{background:'#1B5E20'}}><div className="flex items-center gap-2"><Bot size={20}/><b>Trung tâm trò chuyện</b></div><button onClick={() => setChatOpen(false)}><X size={20}/></button></div><div className="grid grid-cols-2 p-2 bg-gray-50 gap-2"><button onClick={() => setChatMode('ai')} className={`py-2 rounded-xl text-xs font-semibold ${chatMode==='ai'?'bg-green-700 text-white':'bg-white text-gray-500'}`}>Trợ lý AI</button><button onClick={() => setChatMode('owner')} className={`py-2 rounded-xl text-xs font-semibold ${chatMode==='owner'?'bg-green-700 text-white':'bg-white text-gray-500'}`}>Nhắn Chủ vườn</button></div><div className="flex-1 overflow-auto p-4 space-y-3">{messages.map((item,index)=><div key={index} className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${item.from==='me'?'ml-auto bg-green-700 text-white':'bg-gray-100 text-gray-700'}`}>{item.text}</div>)}</div><div className="p-3 border-t flex gap-2"><input value={message} onChange={(event)=>setMessage(event.target.value)} onKeyDown={(event)=>event.key==='Enter'&&sendMessage()} className="flex-1 border rounded-xl px-3 text-sm" placeholder="Nhập tin nhắn..."/><button onClick={sendMessage} className="w-10 h-10 rounded-xl text-white grid place-items-center" style={{background:'#2E7D32'}}><Send size={17}/></button></div></div></div>}
    </div>
  );
}

// ── Screen: Login (single, shared) ───────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (role: Role, username: string, password: string) => Promise<void> }) {
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [username, setUsername] = useState("quan.hmq");
  const [password, setPassword] = useState("greenargric2026");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const roleInfo: Record<Role, { label: string; color: string; bg: string; user: string; accent: string }> = {
    owner: { label: "Chủ vườn", color: "#2E7D32", bg: "#E8F5E9", user: "quan.hmq", accent: "#2E7D32" },
    admin: { label: "Quản trị viên", color: "#B45309", bg: "#FEF3C7", user: "nguyen.ppn", accent: "#D97706" },
    tech:  { label: "Kỹ thuật viên", color: "#1D4ED8", bg: "#EFF6FF", user: "khoa.thdk", accent: "#2563EB" },
  };

  const handleRoleChange = (r: Role) => {
    setSelectedRole(r);
    setUsername(roleInfo[r].user);
  };

  const info = roleInfo[selectedRole];

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="flex-1 relative overflow-hidden min-h-screen" style={{ background: "linear-gradient(145deg,#1B5E20 0%,#2E7D32 60%,#43A047 100%)" }}>
        <img src={FARM_IMG} alt="GREEN ARGRIC" className="absolute inset-0 w-full h-full object-cover opacity-20" style={{ objectPosition: "center 40%" }} />
        <div className="relative flex flex-col justify-center min-h-screen px-14 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Leaf size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">GREEN ARGRIC</h1>
              <p className="text-green-200 text-sm mt-0.5">Hệ thống giám sát vườn thủy canh thông minh IoT</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm">
            {[
              { v: "6", l: "Khu vực" },
              { v: "28+", l: "Cảm biến IoT" },
              { v: "99.8%", l: "Uptime" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="text-2xl font-extrabold text-white">{v}</div>
                <div className="text-xs text-green-200 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3 max-w-md">
            {[
              { Icon: Activity, text: "Theo dõi chỉ số môi trường 24/7 theo thời gian thực" },
              { Icon: Sliders, text: "Điều khiển thiết bị IoT từ xa, tự động hóa thông minh" },
              { Icon: AlertTriangle, text: "Nhận cảnh báo tức thì khi vượt ngưỡng cài đặt" },
              { Icon: BarChart2, text: "Thống kê năng suất và phân tích xu hướng dữ liệu" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-green-100 text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>GREEN ARGRIC v2.4.1 · © 2026 Smart Agriculture Lab</div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-[480px] flex-shrink-0 bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h2>
          <p className="text-gray-400 text-sm mb-6">Chọn vai trò và nhập thông tin tài khoản</p>

          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-gray-100">
            {(["owner", "admin", "tech"] as Role[]).map(r => (
              <button key={r} onClick={() => handleRoleChange(r)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={selectedRole === r
                  ? { background: roleInfo[r].color, color: "#fff" }
                  : { background: "transparent", color: "#6B7280" }}>
                {roleInfo[r].label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 transition-all"
                style={{ ["--tw-ring-color" as any]: info.color + "33" }}>
                <Users size={15} className="text-gray-400 flex-shrink-0" />
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="username" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 transition-all">
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="••••••••" />
                <button onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
            <button disabled={submitting} onClick={async () => { setSubmitting(true); setError(""); try { await onLogin(selectedRole, username, password); } catch (reason) { setError(reason instanceof Error ? reason.message : "Đăng nhập thất bại"); } finally { setSubmitting(false); } }}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{ background: `linear-gradient(135deg,${info.color},${info.accent})` }}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-5 p-4 rounded-2xl border" style={{ background: info.bg, borderColor: info.color + "33" }}>
            <p className="text-xs font-bold mb-2" style={{ color: info.color }}>Tài khoản demo:</p>
            <div className="space-y-1 text-xs" style={{ color: info.color }}>
              <div><span className="font-semibold">Chủ vườn:</span> quan.hmq</div>
              <div><span className="font-semibold">Quản trị viên:</span> nguyen.ppn</div>
              <div><span className="font-semibold">Kỹ thuật viên:</span> khoa.thdk</div>
              <div className="mt-1"><span className="font-semibold">Mật khẩu:</span> greenargric2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REMOVED: HomeScreen (replaced by LoginScreen) ─────────────────────────
// ── REMOVED: LoginOwnerScreen (replaced by LoginScreen) ───────────────────
// ── REMOVED: LoginAdminScreen (replaced by LoginScreen) ───────────────────

function _REMOVED_HomeScreen({ onOwner, onAdmin, onTech }: { onOwner: () => void; onAdmin: () => void; onTech: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7FAF7" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-10 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#43A047,#1B5E20)" }}>
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-wide" style={{ color: "#1B5E20" }}>GREEN ARGRIC</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOwner}
            className="px-5 py-2 rounded-xl border text-sm font-semibold transition-all hover:bg-green-50"
            style={{ borderColor: "#2E7D32", color: "#2E7D32" }}>
            Đăng nhập chủ vườn
          </button>
          <button onClick={onTech}
            className="px-5 py-2 rounded-xl border text-sm font-semibold transition-all hover:bg-blue-50"
            style={{ borderColor: "#1D4ED8", color: "#1D4ED8" }}>
            Kỹ thuật viên
          </button>
          <button onClick={onAdmin}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#2E7D32,#1B5E20)" }}>
            Quản trị viên
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
        <img src={FARM_IMG} alt="Vườn thủy canh" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(27,94,32,0.92) 0%,rgba(46,125,50,0.75) 60%,rgba(56,142,60,0.5) 100%)" }} />
        <div className="relative px-16 py-20 flex flex-col justify-center" style={{ minHeight: 480 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit" style={{ background: "rgba(134,239,172,0.2)", border: "1px solid rgba(134,239,172,0.4)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-green-200 text-xs font-semibold">Hệ thống đang hoạt động · 28 cảm biến online</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight max-w-2xl">
            Vườn thủy canh<br />thông minh IoT
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-xl leading-relaxed">
            Giám sát và điều chỉnh môi trường tự động 24/7. Tối ưu năng suất cây trồng với dữ liệu thời gian thực.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={onOwner}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#43A047,#2E7D32)" }}>
              <Home size={16} />
              Cổng chủ vườn
            </button>
            <button onClick={onTech}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "rgba(99,179,253,0.25)", color: "#fff", border: "1px solid rgba(147,197,253,0.5)" }}>
              <Zap size={16} />
              Cổng kỹ thuật viên
            </button>
            <button onClick={onAdmin}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Settings size={16} />
              Cổng quản trị
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-y border-gray-100 py-6 px-16">
        <div className="flex items-center justify-center gap-16">
          {[
            { v: "6", l: "Khu vực trồng", Icon: Map },
            { v: "28+", l: "Cảm biến IoT", Icon: Activity },
            { v: "8", l: "Thiết bị tự động", Icon: Zap },
            { v: "99.8%", l: "Uptime hệ thống", Icon: CheckCircle },
            { v: "24/7", l: "Giám sát liên tục", Icon: Clock },
          ].map(({ v, l, Icon }) => (
            <div key={l} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                <Icon size={18} style={{ color: "#2E7D32" }} />
              </div>
              <div>
                <div className="text-xl font-extrabold" style={{ color: "#1B5E20" }}>{v}</div>
                <div className="text-xs text-gray-500">{l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-16 py-14 flex-1">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tính năng hệ thống</h2>
          <p className="text-gray-500 text-sm">Giải pháp toàn diện cho vườn thủy canh hiện đại</p>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { Icon: Activity, title: "Giám sát thời gian thực", desc: "Theo dõi nhiệt độ, độ ẩm, pH, EC, ánh sáng liên tục 24/7 với độ chính xác cao.", color: "#E8F5E9", icolor: "#2E7D32" },
            { Icon: Sliders, title: "Điều khiển tự động", desc: "Bật/tắt máy bơm, đèn LED, quạt thông gió theo lịch hoặc ngưỡng tự động.", color: "#EFF6FF", icolor: "#2563EB" },
            { Icon: AlertTriangle, title: "Cảnh báo tức thì", desc: "Nhận thông báo ngay khi môi trường vượt ngưỡng cho phép qua IoT.", color: "#FEF3C7", icolor: "#D97706" },
            { Icon: BarChart2, title: "Phân tích & Báo cáo", desc: "Thống kê xu hướng dữ liệu, xuất báo cáo tuần/tháng chi tiết.", color: "#F5F3FF", icolor: "#7C3AED" },
            { Icon: Map, title: "Quản lý khu vực", desc: "Phân chia và theo dõi từng khu trồng với sức khỏe cây trồng riêng biệt.", color: "#FFF1F2", icolor: "#E11D48" },
            { Icon: Users, title: "Phân quyền người dùng", desc: "Hệ thống 2 cấp quyền: Chủ vườn vận hành, Quản trị viên cấu hình.", color: "#ECFDF5", icolor: "#059669" },
          ].map(({ Icon, title, desc, color, icolor }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: color }}>
                <Icon size={20} style={{ color: icolor }} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-16 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf size={16} style={{ color: "#2E7D32" }} />
            <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>GREEN ARGRIC</span>
            <span className="text-xs text-gray-400">v2.4.1 · © 2026 Smart Agriculture Lab</span>
          </div>
          <div className="flex gap-6">
            <button onClick={onOwner} className="text-sm text-gray-500 hover:text-green-700 transition-colors">Cổng chủ vườn</button>
            <button onClick={onTech} className="text-sm text-gray-500 hover:text-blue-700 transition-colors">Cổng kỹ thuật viên</button>
            <button onClick={onAdmin} className="text-sm text-gray-500 hover:text-green-700 transition-colors">Cổng quản trị</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── REMOVED: LoginOwnerScreen (replaced by unified LoginScreen above) ────

function _REMOVED_LoginOwnerScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("quan.hmq@greenargric.edu.vn");
  const [password, setPassword] = useState("owner123");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative overflow-hidden min-h-screen">
        <img src={FARM_IMG} alt="GREEN ARGRIC" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,rgba(27,94,32,0.93) 0%,rgba(46,125,50,0.80) 55%,rgba(56,142,60,0.65) 100%)" }} />
        <div className="relative flex flex-col justify-center min-h-screen px-14 py-16">
          <button onClick={onBack} className="flex items-center gap-2 text-green-200 hover:text-white transition-colors mb-10 w-fit text-sm">
            <ChevronRight size={16} className="rotate-180" /> Về trang chủ
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Leaf size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">GREEN ARGRIC</h1>
              <p className="text-green-200 text-sm">Cổng đăng nhập chủ vườn</p>
            </div>
          </div>
          <p className="text-green-100 text-sm mb-8 leading-relaxed max-w-md">
            Theo dõi môi trường, điều khiển thiết bị và nhận cảnh báo tức thì cho vườn thủy canh của bạn.
          </p>
          <div className="space-y-3 max-w-md">
            {[
              { Icon: Activity, text: "Xem chỉ số môi trường theo thời gian thực" },
              { Icon: Sliders, text: "Điều khiển bơm, đèn, quạt từ xa" },
              { Icon: AlertTriangle, text: "Nhận cảnh báo ngay khi vượt ngưỡng" },
              { Icon: History, text: "Xem lịch sử dữ liệu và xu hướng" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-green-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[460px] flex-shrink-0 bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit" style={{ background: "#E8F5E9" }}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">Cổng Chủ vườn</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h2>
          <p className="text-gray-400 text-sm mb-6">Tài khoản chủ vườn — GREEN ARGRIC</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="email@greenargric.edu.vn" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="Nhập mật khẩu" />
                <button onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded accent-green-600" />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button className="text-sm font-semibold" style={{ color: "#2E7D32" }}>Quên mật khẩu?</button>
            </div>
            <button onClick={onLogin}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{ background: "linear-gradient(135deg,#2E7D32,#388E3C)" }}>
              Đăng nhập
            </button>
            <button onClick={onBack}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
              Đăng nhập với tư cách quản trị viên
            </button>
          </div>

          <div className="mt-5 p-4 rounded-2xl border border-green-100" style={{ background: "#F0FDF4" }}>
            <p className="text-xs font-bold text-green-800 mb-1">Tài khoản demo (Chủ vườn):</p>
            <p className="text-xs text-green-700">Email: quan.hmq@greenargric.edu.vn</p>
            <p className="text-xs text-green-700">Mật khẩu: owner123</p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">GREEN ARGRIC v2.4.1 · © 2026 Smart Agriculture Lab</p>
        </div>
      </div>
    </div>
  );
}

// ── REMOVED: LoginAdminScreen (replaced by unified LoginScreen above) ────

function _REMOVED_LoginAdminScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("nguyen.ppn@greenargric.edu.vn");
  const [password, setPassword] = useState("admin123");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — darker/admin tone */}
      <div className="flex-1 relative overflow-hidden min-h-screen">
        <img src={FARM_IMG} alt="GREEN ARGRIC Admin" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.95) 0%,rgba(27,94,32,0.85) 55%,rgba(46,125,50,0.70) 100%)" }} />
        <div className="relative flex flex-col justify-center min-h-screen px-14 py-16">
          <button onClick={onBack} className="flex items-center gap-2 text-green-300 hover:text-white transition-colors mb-10 w-fit text-sm">
            <ChevronRight size={16} className="rotate-180" /> Về trang chủ
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">GREEN ARGRIC</h1>
              <p className="text-yellow-200 text-sm">Cổng Quản trị viên</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed max-w-md">
            Truy cập đầy đủ để cấu hình hệ thống, quản lý thiết bị, ngưỡng cảnh báo và người dùng.
          </p>
          <div className="space-y-3 max-w-md">
            {[
              { Icon: Zap, text: "Quản lý và cấu hình toàn bộ thiết bị IoT" },
              { Icon: Settings, text: "Thiết lập ngưỡng cảnh báo tự động" },
              { Icon: Users, text: "Quản lý tài khoản và phân quyền" },
              { Icon: BarChart2, text: "Xem báo cáo và thống kê toàn hệ thống" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(252,211,77,0.15)" }}>
                  <Icon size={14} className="text-yellow-300" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[460px] flex-shrink-0 bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit" style={{ background: "#FEF3C7" }}>
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-yellow-700">Cổng Quản trị viên</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập quản trị</h2>
          <p className="text-gray-400 text-sm mb-6">Dành riêng cho quản trị viên hệ thống</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email quản trị</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-50 transition-all">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="admin@greenargric.edu.vn" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-50 transition-all">
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="Nhập mật khẩu" />
                <button onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded accent-yellow-600" />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button className="text-sm font-semibold text-yellow-600">Quên mật khẩu?</button>
            </div>
            <button onClick={onLogin}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)" }}>
              Đăng nhập quản trị
            </button>
            <button onClick={onBack}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
              Đăng nhập với tư cách chủ vườn
            </button>
          </div>

          <div className="mt-5 p-4 rounded-2xl border border-yellow-100" style={{ background: "#FFFBEB" }}>
            <p className="text-xs font-bold text-yellow-800 mb-1">Tài khoản demo (Quản trị):</p>
            <p className="text-xs text-yellow-700">Email: nguyen.ppn@greenargric.edu.vn</p>
            <p className="text-xs text-yellow-700">Mật khẩu: admin123</p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">GREEN ARGRIC v2.4.1 · © 2026 Smart Agriculture Lab</p>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Dashboard (role-adaptive) ─────────────────────────────────────

function DashboardScreen({ role }: { role: Role }) {
  if (role === "admin") return <AdminDashboardView />;
  if (role === "tech") return <TechDashboardView />;
  return <OwnerDashboardView />;
}

function OwnerDashboardView() {
  const metrics = [
    { label: "Nhiệt độ KK", value: "27.8", unit: "°C", Icon: Thermometer, color: "#EF4444", bg: "#FEF2F2", change: "+0.8°", up: true, warn: true },
    { label: "Độ ẩm KK", value: "58", unit: "%", Icon: Droplets, color: "#3B82F6", bg: "#EFF6FF", change: "-3%", up: false, warn: false },
    { label: "pH dung dịch", value: "6.3", unit: "pH", Icon: Activity, color: "#2E7D32", bg: "#F0FDF4", change: "+0.2", up: true, warn: false },
    { label: "EC dung dịch", value: "1.95", unit: "mS", Icon: Zap, color: "#F59E0B", bg: "#FFFBEB", change: "+0.05", up: true, warn: false },
    { label: "Ánh sáng", value: "680", unit: "μmol", Icon: Sun, color: "#EAB308", bg: "#FEFCE8", change: "-70", up: false, warn: false },
    { label: "Mực nước", value: "72", unit: "%", Icon: Gauge, color: "#0EA5E9", bg: "#F0F9FF", change: "-5%", up: false, warn: false },
  ];

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-6 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: m.bg }}>
                <m.Icon size={18} style={{ color: m.color }} />
              </div>
              {m.warn && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">Cao</span>}
            </div>
            <div className="text-2xl font-bold text-gray-800 leading-tight">
              {m.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
            <div className={`flex items-center gap-0.5 text-[11px] mt-2 ${m.up ? "text-red-500" : "text-green-600"}`}>
              {m.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {m.change} / 1h
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Biến động môi trường 24 giờ qua</h3>
            <div className="flex gap-3">
              {[{ c: "#EF4444", l: "Nhiệt độ" }, { c: "#3B82F6", l: "Độ ẩm" }].map(x => (
                <span key={x.l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: x.c }} />{x.l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={HOURLY} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Area type="monotone" dataKey="tmp" name="Nhiệt độ (°C)" stroke="#EF4444" fill="url(#gT)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="hum" name="Độ ẩm (%)" stroke="#3B82F6" fill="url(#gH)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cảnh báo gần đây</h3>
            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold">2 mới</span>
          </div>
          <div className="space-y-2.5">
            {ALERTS_INIT.slice(0, 5).map(a => (
              <div key={a.id} className="p-3 rounded-xl"
                style={{ background: a.level === "danger" ? "#FEF2F2" : a.level === "warning" ? "#FFFBEB" : "#F0FDF4" }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5"
                    style={{ color: a.level === "danger" ? "#EF4444" : a.level === "warning" ? "#F59E0B" : "#2E7D32" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 line-clamp-2 leading-snug">{a.msg}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{a.zone} · {a.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone health + Device summary */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Sức khỏe khu vực trồng</h3>
          <div className="space-y-3">
            {ZONES.map(z => {
              const c = z.health >= 80 ? "#2E7D32" : z.health >= 65 ? "#F59E0B" : "#EF4444";
              return (
                <div key={z.id} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 w-14 flex-shrink-0">{z.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${z.health}%`, background: c }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right flex-shrink-0" style={{ color: c }}>{z.health}%</span>
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0 truncate">{z.crop}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Tổng quan thiết bị</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { l: "Đang bật", v: DEVICES_INIT.filter(d => d.on).length, c: "#2E7D32", bg: "#F0FDF4" },
              { l: "Đang tắt", v: DEVICES_INIT.filter(d => !d.on).length, c: "#6B7280", bg: "#F9FAFB" },
              { l: "Auto", v: DEVICES_INIT.filter(d => d.mode === "auto").length, c: "#3B82F6", bg: "#EFF6FF" },
              { l: "Hẹn giờ", v: DEVICES_INIT.filter(d => d.mode === "schedule").length, c: "#F59E0B", bg: "#FFFBEB" },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                <div className="text-xl font-bold" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-2 font-medium">Thiết bị đang bật:</div>
          <div className="flex flex-wrap gap-1.5">
            {DEVICES_INIT.filter(d => d.on).map(d => (
              <span key={d.id} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: "#F0FDF4", color: "#2E7D32" }}>{d.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Environment ─────────────────────────────────────────────────

function EnvironmentScreen() {
  const sensors = [
    { label: "Nhiệt độ KK", value: 27.8, min: 15, max: 40, unit: "°C", color: "#EF4444", ok: false },
    { label: "Độ ẩm KK", value: 58, min: 0, max: 100, unit: "%", color: "#3B82F6", ok: true },
    { label: "pH dung dịch", value: 6.3, min: 4, max: 9, unit: "pH", color: "#2E7D32", ok: true },
    { label: "EC dung dịch", value: 1.95, min: 0, max: 4, unit: "mS/cm", color: "#F59E0B", ok: true },
    { label: "Ánh sáng", value: 680, min: 0, max: 1000, unit: "μmol", color: "#EAB308", ok: true },
    { label: "Mực nước bể", value: 72, min: 0, max: 100, unit: "%", color: "#0EA5E9", ok: true },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-6 gap-4">
        {sensors.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center"
            style={{ border: s.ok ? "none" : "1.5px solid #FECACA" }}>
            <ArcGauge value={s.value} min={s.min} max={s.max} unit={s.unit} color={s.color} size={90} />
            <div className="text-xs font-bold text-gray-700 text-center mt-2 leading-tight">{s.label}</div>
            <div className={`text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full ${s.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {s.ok ? "✓ Bình thường" : "⚠ Cảnh báo"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Nhiệt độ & Độ ẩm (24h)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HOURLY} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Line type="monotone" dataKey="tmp" name="Nhiệt độ (°C)" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hum" name="Độ ẩm (%)" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">pH & EC dung dịch (24h)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HOURLY} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Line type="monotone" dataKey="ph" name="pH" stroke="#2E7D32" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ec" name="EC (mS/cm)" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Bảng dữ liệu cảm biến theo giờ</h3>
          <button className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Xuất CSV
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Thời gian", "Nhiệt độ (°C)", "Độ ẩm (%)", "pH", "EC (mS/cm)", "Ánh sáng (μmol)"].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURLY.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-gray-700">{row.t}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.tmp}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.hum}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.ph}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.ec}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.lux}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Screen: Devices (role-adaptive) ──────────────────────────────────────

function DevicesScreen({ role }: { role: Role }) {
  if (role === "admin") return <DeviceManagementView />;
  if (role === "tech") return <DeviceTechView />;
  return <DeviceControlView />;
}

// Owner: device control with ON/OFF toggles grouped by zone
function DeviceControlView() {
  const [devices, setDevices] = useState(DEVICES_INIT);
  const toggle = (id: number) => setDevices(d => d.map(dev => dev.id === id ? { ...dev, on: !dev.on } : dev));
  const typeIcon: Record<string, any> = { pump: Droplets, light: Sun, fan: Wind, dosing: Zap };
  const modeStyle: Record<string, { bg: string; color: string; label: string }> = {
    auto: { bg: "#EFF6FF", color: "#3B82F6", label: "Tự động" },
    schedule: { bg: "#FFFBEB", color: "#F59E0B", label: "Hẹn giờ" },
    manual: { bg: "#F9FAFB", color: "#6B7280", label: "Thủ công" },
  };
  const totalOn = devices.filter(d => d.on).length;
  const totalWatt = devices.filter(d => d.on).reduce((s, d) => s + d.watt, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "Tổng thiết bị", v: devices.length, c: "#1F2937", bg: "white" },
          { l: "Đang hoạt động", v: totalOn, c: "#2E7D32", bg: "#F0FDF4" },
          { l: "Đang tắt", v: devices.length - totalOn, c: "#6B7280", bg: "#F9FAFB" },
          { l: "Tổng công suất", v: `${totalWatt}W`, c: "#F59E0B", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-4 shadow-sm" style={{ background: s.bg === "white" ? "#fff" : s.bg }}>
            <div className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-sm text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {devices.map(d => {
          const Icon = typeIcon[d.type] || Droplets;
          const ms = modeStyle[d.mode] || modeStyle.manual;
          return (
            <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: d.on ? "#F0FDF4" : "#F9FAFB" }}>
                <Icon size={22} style={{ color: d.on ? "#2E7D32" : "#9CA3AF" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{d.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{d.zone}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ms.bg, color: ms.color }}>{ms.label}</span>
                  <span className="text-xs text-gray-400">{d.watt}W</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Lần cuối: {d.lastRun}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Toggle on={d.on} onChange={() => toggle(d.id)} />
                <span className={`text-xs font-semibold ${d.on ? "text-green-600" : "text-gray-400"}`}>
                  {d.on ? "Đang bật" : "Đang tắt"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Screen 5: Alerts (role-aware) ────────────────────────────────────────

function AlertsScreen({ role }: { role: Role }) {
  const [alerts, setAlerts] = useState(ALERTS_INIT);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const resolve = (id: number) => setAlerts(a => a.map(x => x.id === id ? { ...x, resolved: true } : x));
  const filtered = alerts.filter(a => filter === "all" ? true : filter === "active" ? !a.resolved : a.resolved);

  const roleBanner = role === "owner"
    ? { msg: "Theo dõi cảnh báo vườn của bạn", color: "#2E7D32", bg: "#E8F5E9" }
    : role === "admin"
    ? { msg: "Tất cả cảnh báo hệ thống — Có thể phân công xử lý", color: "#D97706", bg: "#FEF3C7" }
    : { msg: "Cảnh báo cần xử lý — Được phân công cho bạn", color: "#1D4ED8", bg: "#EFF6FF" };
  const levelStyle = (l: string) => ({
    danger: { bg: "#FEF2F2", border: "#FECACA", c: "#EF4444", label: "Nguy hiểm" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", c: "#F59E0B", label: "Cảnh báo" },
    info: { bg: "#EFF6FF", border: "#BFDBFE", c: "#3B82F6", label: "Thông tin" },
  }[l] || { bg: "#F9FAFB", border: "#E5E7EB", c: "#6B7280", label: l });

  return (
    <div className="space-y-5">
      {/* Role-based banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: roleBanner.bg }}>
        <AlertTriangle size={16} style={{ color: roleBanner.color }} />
        <span className="text-sm font-semibold" style={{ color: roleBanner.color }}>{roleBanner.msg}</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "Tổng cảnh báo", v: alerts.length, c: "#1F2937", bg: "white" },
          { l: "Chưa xử lý", v: alerts.filter(a => !a.resolved).length, c: "#EF4444", bg: "#FEF2F2" },
          { l: "Đã xử lý", v: alerts.filter(a => a.resolved).length, c: "#2E7D32", bg: "#F0FDF4" },
          { l: "Hôm nay", v: alerts.filter(a => a.date === "29/06/2026").length, c: "#F59E0B", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-4 shadow-sm" style={{ background: s.bg === "white" ? "#fff" : s.bg }}>
            <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-sm text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "active", "resolved"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: filter === f ? "#fff" : "transparent",
                  color: filter === f ? "#2E7D32" : "#6B7280",
                  boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                {f === "all" ? "Tất cả" : f === "active" ? "Chưa xử lý" : "Đã xử lý"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Xuất báo cáo
          </button>
        </div>
        <div className="space-y-3">
          {filtered.map(a => {
            const st = levelStyle(a.level);
            return (
              <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ background: st.bg, borderColor: st.border }}>
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: st.c }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: st.c + "22", color: st.c }}>{st.label}</span>
                    <span className="text-xs text-gray-500">{a.sensor} · {a.zone}</span>
                    <span className="text-xs text-gray-400 ml-auto">{a.time} · {a.date}</span>
                  </div>
                  <div className="text-sm text-gray-700">{a.msg}</div>
                </div>
                <div className="flex-shrink-0">
                  {a.resolved ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-semibold whitespace-nowrap">
                      <CheckCircle size={14} /> Đã xử lý
                    </span>
                  ) : (
                    <button onClick={() => resolve(a.id)}
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white hover:opacity-90 whitespace-nowrap"
                      style={{ background: "#2E7D32" }}>Xử lý ngay</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Screen 6: History ─────────────────────────────────────────────────────

function HistoryScreen() {
  const [sensor, setSensor] = useState<"nhietDo" | "doAm" | "pH" | "ec">("nhietDo");
  const sc = { nhietDo: { label: "Nhiệt độ (°C)", color: "#EF4444" }, doAm: { label: "Độ ẩm (%)", color: "#3B82F6" }, pH: { label: "pH", color: "#2E7D32" }, ec: { label: "EC (mS/cm)", color: "#F59E0B" } }[sensor];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Từ:</span>
          <input type="date" defaultValue="2026-06-23" className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-green-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Đến:</span>
          <input type="date" defaultValue="2026-06-29" className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-green-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Cảm biến:</span>
          <select value={sensor} onChange={e => setSensor(e.target.value as typeof sensor)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-green-500 bg-white">
            <option value="nhietDo">Nhiệt độ</option>
            <option value="doAm">Độ ẩm</option>
            <option value="pH">pH</option>
            <option value="ec">EC</option>
          </select>
        </div>
        <button className="ml-auto flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
          <Download size={14} /> Xuất CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Lịch sử {sc.label} — 7 ngày qua (23/06 – 29/06/2026)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={HISTORY_7D} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sc.color} stopOpacity={0.18} /><stop offset="95%" stopColor={sc.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
            <Area type="monotone" dataKey={sensor} name={sc.label} stroke={sc.color} fill="url(#gArea)" strokeWidth={2.5} dot={{ r: 5, fill: sc.color, stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Dữ liệu chi tiết theo ngày</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Ngày", "Nhiệt độ TB (°C)", "Độ ẩm TB (%)", "pH TB", "EC TB (mS/cm)", "Trạng thái"].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY_7D.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-gray-700">{row.date}/2026</td>
                <td className="py-2.5 px-3 text-gray-600">{row.nhietDo}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.doAm}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.pH}</td>
                <td className="py-2.5 px-3 text-gray-600">{row.ec}</td>
                <td className="py-2.5 px-3"><span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-50 text-green-700">Bình thường</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Screen 7: Thresholds ──────────────────────────────────────────────────

function ThresholdsScreen() {
  const [saved, setSaved] = useState(false);
  const [automation, setAutomation] = useState([
    { device: "Hệ thống đèn LED", schedule: "06:00 – 22:00", days: "T2 – CN", status: true },
    { device: "Máy bơm dinh dưỡng A", schedule: "06:00, 12:00, 18:00 (15 phút)", days: "T2 – CN", status: true },
    { device: "Quạt thông gió", schedule: "Khi nhiệt độ > 30°C", days: "Tự động", status: true },
    { device: "Máy điều chỉnh pH", schedule: "Khi pH > 6.8 hoặc < 5.5", days: "Tự động", status: false },
  ]);
  const [cfg, setCfg] = useState<Record<string, { label: string; unit: string; min: number; max: number; enabled: boolean }>>({
    nhietDo: { label: "Nhiệt độ không khí", unit: "°C", min: 20, max: 30, enabled: true },
    doAm: { label: "Độ ẩm không khí", unit: "%", min: 55, max: 85, enabled: true },
    pH: { label: "pH dung dịch", unit: "pH", min: 5.5, max: 6.8, enabled: true },
    ec: { label: "EC dung dịch", unit: "mS/cm", min: 1.2, max: 2.8, enabled: true },
    anhSang: { label: "Cường độ ánh sáng", unit: "μmol/m²/s", min: 200, max: 800, enabled: true },
    mucNuoc: { label: "Mực nước bể chứa", unit: "%", min: 40, max: 95, enabled: true },
    doAmDat: { label: "Độ ẩm giá thể", unit: "%", min: 60, max: 90, enabled: false },
  });
  const update = (key: string, field: string, value: number | boolean) =>
    (setCfg((c: any) => ({ ...c, [key]: { ...c[key], [field]: value } })), setSaved(false));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Thiết lập ngưỡng cảnh báo min/max cho từng thông số môi trường.</p>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-sm text-green-700 font-semibold"><CheckCircle size={15} /> Đã lưu</span>}
          <button onClick={() => setSaved(true)}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            style={{ background: "#2E7D32" }}>Lưu cấu hình</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(cfg).map(([key, s]) => (
          <div key={key} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">{s.label}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{s.enabled ? "Bật" : "Tắt"}</span>
                <Toggle on={s.enabled} onChange={() => update(key, "enabled", !s.enabled)} />
              </div>
            </div>
            <div className={`space-y-3 transition-opacity ${s.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-32 flex-shrink-0">Ngưỡng dưới:</label>
                <input type="number" value={s.min} step="0.1" onChange={e => update(key, "min", parseFloat(e.target.value))}
                  className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-green-500" />
                <span className="text-sm text-gray-400">{s.unit}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-32 flex-shrink-0">Ngưỡng trên:</label>
                <input type="number" value={s.max} step="0.1" onChange={e => update(key, "max", parseFloat(e.target.value))}
                  className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-green-500" />
                <span className="text-sm text-gray-400">{s.unit}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex">
                <div className="w-[20%]" style={{ background: "#FCA5A5" }} />
                <div className="flex-1" style={{ background: "#BBF7D0" }} />
                <div className="w-[20%]" style={{ background: "#FCA5A5" }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Dưới {s.min}</span>
                <span className="text-green-600 font-medium">Vùng an toàn: {s.min} – {s.max} {s.unit}</span>
                <span>Trên {s.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Automation schedule section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Lịch tự động hóa</h3>
        <div className="space-y-3">
          {automation.map(({ device, schedule, days, status }) => (
            <div key={device} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: status ? "#E8F5E9" : "#F3F4F6" }}>
                  <Clock size={16} style={{ color: status ? "#2E7D32" : "#9CA3AF" }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">{device}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{schedule} · {days}</div>
                </div>
              </div>
              <Toggle on={status} onChange={() => { setAutomation(rows => rows.map(item => item.device === device ? { ...item, status: !item.status } : item)); setSaved(false); }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 8: Zones (with inline slide-in drawer) ─────────────────────────

function ZonesScreen() {
  const [zones, setZones] = useState(ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<"detail" | "manage">("detail");
  const selectedZone = selectedZoneId != null ? zones.find(z => z.id === selectedZoneId) : null;
  const selectedDetail = selectedZoneId != null ? ZONE_DETAIL_DATA[selectedZoneId] || ZONE_DETAIL_DATA[1] : null;

  const stSt = (s: string) => ({
    good: { bg: "#F0FDF4", border: "#BBF7D0", c: "#2E7D32", l: "Tốt" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", c: "#F59E0B", l: "Cần chú ý" },
    danger: { bg: "#FEF2F2", border: "#FECACA", c: "#EF4444", l: "Nguy hiểm" },
  }[s] || { bg: "#F9FAFB", border: "#E5E7EB", c: "#6B7280", l: s });

  const trendIcon = { up: ArrowUp, down: ArrowDown, stable: ArrowRight };
  const deviceTypeIcon: Record<string, any> = { pump: Droplets, light: Sun, fan: Wind, sensor: Activity, dosing: Gauge };

  return (
    <div className="relative space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "Tổng khu vực", v: zones.length, c: "#1F2937", bg: "white" },
          { l: "Hoạt động tốt", v: zones.filter(z => z.status === "good").length, c: "#2E7D32", bg: "#F0FDF4" },
          { l: "Cần chú ý", v: zones.filter(z => z.status === "warning").length, c: "#F59E0B", bg: "#FFFBEB" },
          { l: "Nguy hiểm", v: zones.filter(z => z.status === "danger").length, c: "#EF4444", bg: "#FEF2F2" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-4 shadow-sm" style={{ background: s.bg === "white" ? "#fff" : s.bg }}>
            <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-sm text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {zones.map(z => {
          const st = stSt(z.status);
          const bc = z.health >= 80 ? "#2E7D32" : z.health >= 65 ? "#F59E0B" : "#EF4444";
          return (
            <div key={z.id} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: z.status !== "good" ? st.border : "transparent" }}
              onClick={() => { setDrawerMode("detail"); setSelectedZoneId(z.id); }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-xl">{z.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{z.crop}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.c }}>{st.l}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Sức khỏe cây trồng</span>
                  <span className="text-sm font-bold" style={{ color: bc }}>{z.health}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2.5 rounded-full" style={{ width: `${z.health}%`, background: bc }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{ icon: Map, t: z.area }, { icon: Activity, t: `${z.sensors} cảm biến` }, { icon: Clock, t: `Trồng: ${z.planted}` }, { icon: CheckCircle, t: `Thu: ${z.harvest}` }].map(({ icon: Icon, t }) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Icon size={12} className="flex-shrink-0" />{t}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={e => { e.stopPropagation(); setDrawerMode("detail"); setSelectedZoneId(z.id); }} className="flex-1 text-xs py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">Chi tiết</button>
                <button onClick={e => { e.stopPropagation(); setDrawerMode("manage"); setSelectedZoneId(z.id); }} className="flex-1 text-xs py-2 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>Quản lý</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline slide-in drawer */}
      {selectedZoneId != null && selectedZone && selectedDetail && (() => {
        const z = selectedZone;
        const detail = selectedDetail;
        const healthColor = z.health >= 80 ? "#2E7D32" : z.health >= 65 ? "#D97706" : "#EF4444";
        const statusColor = { good: { bg: "#DCFCE7", color: "#166534", label: "Tốt" }, warning: { bg: "#FEF3C7", color: "#D97706", label: "Cần chú ý" }, danger: { bg: "#FEE2E2", color: "#DC2626", label: "Nguy hiểm" } }[z.status] || { bg: "#F3F4F6", color: "#6B7280", label: "—" };
        const stageIdx = GROWTH_STAGES.indexOf(detail.growthStage);
        return (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedZoneId(null)} />
            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl overflow-y-auto" style={{ width: 520 }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800">{z.name} — {drawerMode === "detail" ? "Chi tiết theo dõi" : "Quản lý khu vực"}</h2>
                  <p className="text-sm text-gray-400">{drawerMode === "detail" ? detail.variety : "Chỉnh sửa thông tin và trạng thái khu trồng"}</p>
                </div>
                <button onClick={() => setSelectedZoneId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {drawerMode === "manage" && <form className="bg-green-50 rounded-2xl p-5 border border-green-100 space-y-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setZones(rows => rows.map(item => item.id === z.id ? { ...item, name: String(data.get("name")), crop: String(data.get("crop")), area: String(data.get("area")), status: String(data.get("status")) } : item)); window.alert("Đã lưu thông tin khu vực"); }}>
                  <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-gray-600">Tên khu vực<input name="name" defaultValue={z.name} className="mt-1 w-full bg-white border rounded-xl px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-gray-600">Loại cây<input name="crop" defaultValue={z.crop} className="mt-1 w-full bg-white border rounded-xl px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-gray-600">Diện tích<input name="area" defaultValue={z.area} className="mt-1 w-full bg-white border rounded-xl px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-gray-600">Trạng thái<select name="status" defaultValue={z.status} className="mt-1 w-full bg-white border rounded-xl px-3 py-2 text-sm"><option value="good">Tốt</option><option value="warning">Cần chú ý</option><option value="danger">Nguy hiểm</option></select></label></div>
                  <div className="flex gap-3"><button type="submit" className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold">Lưu thay đổi</button><button type="button" onClick={() => { if (window.confirm(`Xóa ${z.name}?`)) { setZones(rows => rows.filter(item => item.id !== z.id)); setSelectedZoneId(null); } }} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">Xóa khu vực</button></div>
                </form>}
                {/* Hero */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: statusColor.bg, color: statusColor.color }}>{statusColor.label}</span>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold" style={{ color: healthColor }}>{z.health}%</div>
                      <div className="text-xs text-gray-400">Sức khỏe</div>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full mb-4">
                    <div className="h-full rounded-full" style={{ width: `${z.health}%`, background: healthColor }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "Diện tích", value: z.area }, { label: "Cảm biến", value: `${z.sensors} cảm biến` }, { label: "Ngày trồng", value: detail.startDate }, { label: "Thu hoạch DK", value: detail.harvestDate }].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-xl p-3">
                        <div className="text-xs text-gray-400">{label}</div>
                        <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth stage */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Giai đoạn sinh trưởng</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>{detail.growthStage}</span>
                    <span className="text-sm font-bold text-gray-600">{detail.growthPct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full mb-3">
                    <div className="h-full rounded-full" style={{ width: `${detail.growthPct}%`, background: "linear-gradient(90deg,#43A047,#2E7D32)" }} />
                  </div>
                  <div className="flex items-center gap-0">
                    {GROWTH_STAGES.map((stage, i) => (
                      <div key={stage} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-center">
                          {i > 0 && <div className="flex-1 h-0.5" style={{ background: i <= stageIdx ? "#2E7D32" : "#E5E7EB" }} />}
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border-2"
                            style={{ background: i < stageIdx ? "#2E7D32" : i === stageIdx ? "#43A047" : "#fff", borderColor: i <= stageIdx ? "#2E7D32" : "#E5E7EB" }} />
                          {i < GROWTH_STAGES.length - 1 && <div className="flex-1 h-0.5" style={{ background: i < stageIdx ? "#2E7D32" : "#E5E7EB" }} />}
                        </div>
                        <span className="text-[8px] text-center mt-1 leading-tight" style={{ color: i === stageIdx ? "#2E7D32" : "#9CA3AF", fontWeight: i === stageIdx ? 700 : 400 }}>
                          {stage.split("—")[0].trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Env snapshot */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Chỉ số môi trường</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {detail.envHistory.map(({ param, value, trend }) => {
                      const TrendIcon = trendIcon[trend];
                      const trendColor = trend === "up" ? "#EF4444" : trend === "down" ? "#3B82F6" : "#6B7280";
                      return (
                        <div key={param} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                          <span className="text-xs text-gray-500">{param}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-800">{value}</span>
                            <TrendIcon size={11} style={{ color: trendColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Devices */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Thiết bị liên kết</h3>
                  <div className="space-y-2">
                    {detail.devices.map(({ name, type, status }) => {
                      const Icon = deviceTypeIcon[type as keyof typeof deviceTypeIcon] || Zap;
                      const sColor = status === "on" ? { bg: "#DCFCE7", color: "#166534", dot: "#22C55E", label: "Đang chạy" }
                        : status === "off" ? { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF", label: "Tắt" }
                        : { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B", label: "Cần chú ý" };
                      return (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                            <Icon size={14} style={{ color: "#2E7D32" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-700 truncate">{name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: sColor.dot }} />
                              <span className="text-xs" style={{ color: sColor.color }}>{sColor.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="p-4 rounded-xl border border-yellow-100" style={{ background: "#FFFBEB" }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800">{detail.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ── Custom grouped bar chart (SVG) với tooltip ───────────────────────────

type TooltipData = { day: string; max: number; tb: number; min: number; pct: number } | null;

function TempGroupedBar({ data }: { data: typeof WEEKLY }) {
  const [tooltip, setTooltip] = useState<TooltipData>(null);

  const VW = 560, VH = 210;
  const ml = 30, mr = 8, mt = 8, mb = 22;
  const cw = VW - ml - mr;
  const ch = VH - mt - mb;
  const yMin = 18, yMax = 32, yRange = yMax - yMin;

  const ys = (v: number) => mt + ch - ((v - yMin) / yRange) * ch;
  const barH = (v: number) => ((v - yMin) / yRange) * ch;

  const groupW = cw / data.length;
  const bw = Math.floor(groupW * 0.21);
  const gap = Math.floor(groupW * 0.04);
  const totalBars = bw * 3 + gap * 2;
  const gOffset = (groupW - totalBars) / 2;

  const COLORS = ["#FCA5A5", "#166534", "#BBF7D0"] as const;
  const LABELS = ["Max", "TB", "Min"] as const;
  const KEYS: (keyof typeof data[0])[] = ["max", "tb", "min"];
  const yTicks = [18, 20, 22, 24, 26, 28, 30, 32];

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" style={{ display: "block" }}>
        {/* Grid lines + Y labels */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={ml} y1={ys(v)} x2={ml + cw} y2={ys(v)}
              stroke={v === yMin ? "#E5E7EB" : "#F3F4F6"} strokeWidth={v === yMin ? 1.5 : 1} />
            <text x={ml - 4} y={ys(v)} textAnchor="end" fontSize={9} fill="#9CA3AF"
              dominantBaseline="middle">{v}</text>
          </g>
        ))}

        {/* Bars per group */}
        {data.map((d, i) => {
          const gx = ml + i * groupW + gOffset;
          const isHovered = tooltip?.day === d.day;
          const pct = (ml + i * groupW + groupW / 2) / VW;

          return (
            <g key={d.day}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ day: d.day, max: d.max as number, tb: d.tb as number, min: d.min as number, pct })}
              onMouseLeave={() => setTooltip(null)}>
              {/* Hover highlight background */}
              {isHovered && (
                <rect x={gx - 4} y={mt} width={totalBars + 8} height={ch}
                  fill="#F3F4F6" rx={4} opacity={0.7} />
              )}
              {KEYS.map((k, j) => {
                const val = d[k] as number;
                const x = gx + j * (bw + gap);
                const h = barH(val);
                const y = ys(val);
                return (
                  <g key={k}>
                    <rect x={x} y={y} width={bw} height={h}
                      fill={COLORS[j]} rx={3} ry={3}
                      opacity={tooltip && !isHovered ? 0.45 : 1} />
                  </g>
                );
              })}
              {/* X label */}
              <text x={ml + i * groupW + groupW / 2} y={VH - 4}
                textAnchor="middle" fontSize={10}
                fill={isHovered ? "#2E7D32" : "#9CA3AF"}
                fontWeight={isHovered ? "700" : "400"}>
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip popup */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 transition-all duration-150"
          style={{
            left: `${tooltip.pct * 100}%`,
            top: "12%",
            transform: "translateX(-50%)",
          }}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3"
            style={{ minWidth: 148, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div className="text-[13px] font-bold text-gray-800 mb-2.5">{tooltip.day}</div>
            <div className="space-y-1.5">
              {([
                { c: "#FCA5A5", l: "Max", v: tooltip.max },
                { c: "#166534", l: "Trung bình", v: tooltip.tb },
                { c: "#BBF7D0", l: "Min", v: tooltip.min },
              ] as const).map(row => (
                <div key={row.l} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 border border-gray-200"
                      style={{ background: row.c }} />
                    {row.l}
                  </span>
                  <span className="text-[13px] font-bold text-gray-800">{row.v}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Screen 9: Reports ─────────────────────────────────────────────────────

function ReportsScreen() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "Tổng cảnh báo tuần", v: "18", sub: "+3 so với tuần trước", c: "#EF4444", bg: "#FEF2F2" },
          { l: "Nhiệt độ trung bình", v: "25.7°C", sub: "Trong ngưỡng an toàn", c: "#2E7D32", bg: "#F0FDF4" },
          { l: "pH trung bình tuần", v: "6.18", sub: "Ổn định — dao động ±0.15", c: "#2E7D32", bg: "#F0FDF4" },
          { l: "Uptime hệ thống", v: "99.2%", sub: "7 ngày liên tục", c: "#3B82F6", bg: "#EFF6FF" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-4 shadow-sm" style={{ background: s.bg }}>
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.c }}>{s.v}</div>
            <div className="text-sm font-semibold text-gray-700">{s.l}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Temperature chart — 60% */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Nhiệt độ theo ngày trong tuần</h3>
            <div className="flex items-center gap-4">
              {[{ c: "#FCA5A5", l: "Max" }, { c: "#166534", l: "TB" }, { c: "#BBF7D0", l: "Min" }].map(x => (
                <span key={x.l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm inline-block border border-gray-200" style={{ background: x.c }} />
                  {x.l}
                </span>
              ))}
              <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50">
                <Download size={11} /> Xuất
              </button>
            </div>
          </div>
          <div style={{ height: 260 }}>
            <TempGroupedBar data={WEEKLY} />
          </div>
        </div>

        {/* Alert chart — 40% */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Số cảnh báo theo ngày</h3>
            <p className="text-xs text-gray-400 mt-0.5">Tuần này — tổng 18 cảnh báo</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={WEEKLY} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="canh_bao" name="Số cảnh báo" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Hiệu suất khu vực trồng — Tuần 26</h3>
          <button className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Xuất PDF
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Khu vực", "Cây trồng", "Sức khỏe", "Nhiệt độ TB", "pH TB", "Cảnh báo", "Trạng thái"].map(h => (
                <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ZONES.map(z => (
              <tr key={z.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-gray-700">{z.name}</td>
                <td className="py-2.5 px-4 text-gray-600">{z.crop}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full" style={{ width: `${z.health}%`, background: z.health >= 80 ? "#2E7D32" : z.health >= 65 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                    <span className="text-xs font-semibold">{z.health}%</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-gray-600">25.8°C</td>
                <td className="py-2.5 px-4 text-gray-600">6.2</td>
                <td className="py-2.5 px-4 text-gray-600">{[0, 2, 1, 4, 0, 7, 2][z.id]}</td>
                <td className="py-2.5 px-4">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${z.status === "good" ? "bg-green-50 text-green-700" : z.status === "warning" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                    {z.status === "good" ? "Tốt" : z.status === "warning" ? "Cần chú ý" : "Nguy hiểm"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Screen 10: Users ──────────────────────────────────────────────────────

function UsersScreen() {
  const [users, setUsers] = useState(USERS_INIT);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const loadUsers = async () => {
    const token = localStorage.getItem("greenArgricToken");
    if (!token) return;
    const response = await fetch(`${apiUrl}/user`, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) return;
    const rows = await response.json();
    setUsers(rows.map((user: any) => ({ id: user.id, name: user.full_name, email: user.email, role: user.role === "admin" ? "admin" : user.role === "owner" ? "operator" : "viewer", dept: user.role === "admin" ? "Khoa CNTT" : user.role === "owner" ? "Khoa Nông học" : "Kỹ thuật", status: user.status === "active" ? "active" : "inactive", lastLogin: "-" })));
  };
  useEffect(() => { void loadUsers(); }, []);
  const addUser = async () => {
    const full_name = window.prompt("Họ và tên tài khoản mới:"); if (!full_name) return;
    const email = window.prompt("Email:"); if (!email) return;
    const password = window.prompt("Mật khẩu (tối thiểu 6 ký tự):"); if (!password) return;
    const selectedRole = window.prompt("Vai trò: admin, owner hoặc technician", "owner"); if (!selectedRole) return;
    const token = localStorage.getItem("greenArgricToken");
    const response = await fetch(`${apiUrl}/user`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ full_name, email, password, role: selectedRole, status: "active" }) });
    const result = await response.json();
    if (!response.ok) return window.alert(result.message || "Không thể tạo tài khoản");
    await loadUsers();
    window.alert("Đã tạo tài khoản thành công");
  };
  const editUser = async (user: any) => {
    const full_name = window.prompt("Họ và tên:", user.name); if (!full_name) return;
    const email = window.prompt("Email:", user.email); if (!email) return;
    const currentRole = user.role === "operator" ? "owner" : user.role === "viewer" ? "technician" : "admin";
    const updatedRole = window.prompt("Vai trò: admin, owner hoặc technician", currentRole); if (!updatedRole) return;
    const response = await fetch(`${apiUrl}/user/${user.id}`, { method: "PUT", headers: { "content-type": "application/json", authorization: `Bearer ${localStorage.getItem("greenArgricToken")}` }, body: JSON.stringify({ full_name, email, role: updatedRole }) });
    const result = await response.json(); if (!response.ok) return window.alert(result.message || "Không thể cập nhật tài khoản"); await loadUsers(); window.alert("Đã cập nhật tài khoản");
  };
  const toggleUser = async (user: any) => {
    if (!window.confirm(`${user.status === "active" ? "Khóa" : "Mở khóa"} tài khoản ${user.name}?`)) return;
    const response = await fetch(`${apiUrl}/user/${user.id}/toggle`, { method: "POST", headers: { authorization: `Bearer ${localStorage.getItem("greenArgricToken")}` } });
    const result = await response.json(); if (!response.ok) return window.alert(result.message || "Không thể đổi trạng thái tài khoản"); await loadUsers();
  };
  const roleStyle = (r: string) => ({
    admin: { bg: "#F0FDF4", c: "#2E7D32", l: "Quản trị viên" },
    operator: { bg: "#EFF6FF", c: "#3B82F6", l: "Vận hành viên" },
    viewer: { bg: "#F9FAFB", c: "#6B7280", l: "Người xem" },
  }[r] || { bg: "#F9FAFB", c: "#6B7280", l: r });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "Tổng tài khoản", v: users.length, c: "#1F2937", bg: "white" },
          { l: "Đang hoạt động", v: users.filter(u => u.status === "active").length, c: "#2E7D32", bg: "#F0FDF4" },
          { l: "Tạm khóa", v: users.filter(u => u.status === "inactive").length, c: "#6B7280", bg: "#F9FAFB" },
          { l: "Quản trị viên", v: users.filter(u => u.role === "admin").length, c: "#3B82F6", bg: "#EFF6FF" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-4 shadow-sm" style={{ background: s.bg === "white" ? "#fff" : s.bg }}>
            <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-sm text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Danh sách tài khoản người dùng</h3>
          <button onClick={addUser} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "#2E7D32" }}>
            <Plus size={15} /> Thêm tài khoản
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Người dùng", "Email", "Vai trò", "Bộ phận / Lớp", "Trạng thái", "Đăng nhập cuối", "Thao tác"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const role = roleStyle(u.role);
              const initials = u.name.split(" ").slice(-2).map((n: string) => n[0]).join("");
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: role.c }}>{initials}</div>
                      <span className="font-semibold text-gray-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: role.bg, color: role.c }}>{role.l}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{u.dept}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${u.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{u.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => void editUser(u)} title="Chỉnh sửa tài khoản" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Edit2 size={13} className="text-gray-500" />
                      </button>
                      <button onClick={() => void toggleUser(u)} title={u.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── REMOVED: LoginTechScreen (replaced by unified LoginScreen above) ─────

function _REMOVED_LoginTechScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("khoa.thdk@greenargric.edu.vn");
  const [password, setPassword] = useState("tech123");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative overflow-hidden min-h-screen">
        <img src={FARM_IMG} alt="GREEN ARGRIC Tech" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,rgba(15,23,66,0.95) 0%,rgba(29,78,216,0.80) 55%,rgba(37,99,235,0.60) 100%)" }} />
        <div className="relative flex flex-col justify-center min-h-screen px-14 py-16">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-10 w-fit text-sm">
            <ChevronRight size={16} className="rotate-180" /> Về trang chủ
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">GREEN ARGRIC</h1>
              <p className="text-blue-200 text-sm">Cổng Kỹ thuật viên</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed max-w-md">
            Quản lý bảo trì, hiệu chỉnh cảm biến và ghi nhật ký sửa chữa thiết bị IoT trong hệ thống.
          </p>
          <div className="space-y-3 max-w-md">
            {[
              { Icon: Zap, text: "Lên lịch và thực hiện bảo trì thiết bị" },
              { Icon: Gauge, text: "Hiệu chỉnh và kiểm tra độ chính xác cảm biến" },
              { Icon: Activity, text: "Ghi nhật ký sửa chữa và thay thế linh kiện" },
              { Icon: Clock, text: "Quản lý lịch công việc theo tuần/tháng" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,197,253,0.2)" }}>
                  <Icon size={14} className="text-blue-200" />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[460px] flex-shrink-0 bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit" style={{ background: "#EFF6FF" }}>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-700">Cổng Kỹ thuật viên</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h2>
          <p className="text-gray-400 text-sm mb-6">Tài khoản kỹ thuật viên — GREEN ARGRIC</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="tech@greenargric.edu.vn" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="Nhập mật khẩu" />
                <button onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button className="text-sm font-semibold text-blue-600">Quên mật khẩu?</button>
            </div>
            <button onClick={onLogin}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
              Đăng nhập kỹ thuật
            </button>
            <button onClick={onBack}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
              Về trang chủ
            </button>
          </div>
          <div className="mt-5 p-4 rounded-2xl border border-blue-100" style={{ background: "#EFF6FF" }}>
            <p className="text-xs font-bold text-blue-800 mb-1">Tài khoản demo (Kỹ thuật viên):</p>
            <p className="text-xs text-blue-700">Email: khoa.thdk@greenargric.edu.vn</p>
            <p className="text-xs text-blue-700">Mật khẩu: tech123</p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">GREEN ARGRIC v2.4.1 · © 2026 Smart Agriculture Lab</p>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Tech Dashboard ────────────────────────────────────────────────

function TechDashboardView() {
  const tasks = [
    { id: 1, title: "Bảo trì máy bơm dinh dưỡng A", zone: "Khu A", priority: "high", status: "pending", due: "Hôm nay 14:00" },
    { id: 2, title: "Hiệu chỉnh cảm biến pH — Khu C", zone: "Khu C", priority: "high", status: "in-progress", due: "Hôm nay 10:30" },
    { id: 3, title: "Thay bộ lọc máy bơm B", zone: "Khu B", priority: "medium", status: "pending", due: "Ngày mai 09:00" },
    { id: 4, title: "Kiểm tra đèn LED Khu D", zone: "Khu D", priority: "low", status: "done", due: "Hôm qua" },
    { id: 5, title: "Vệ sinh quạt thông gió C", zone: "Khu C", priority: "medium", status: "done", due: "Hôm qua" },
  ];
  const alerts = [
    { device: "Máy điều chỉnh pH", issue: "Offline 2 giờ, cần kiểm tra nguồn", severity: "high" },
    { device: "Cảm biến EC Khu A", issue: "Sai lệch ±0.3 mS/cm so với chuẩn", severity: "medium" },
    { device: "Bơm oxy D", issue: "Cần thay dầu bôi trơn", severity: "low" },
  ];
  const prioColor = { high: { bg: "#FEE2E2", color: "#991B1B", label: "Khẩn" }, medium: { bg: "#FEF3C7", color: "#92400E", label: "Trung bình" }, low: { bg: "#F0FDF4", color: "#166534", label: "Thấp" } };
  const statusConfig = { pending: { bg: "#F3F4F6", color: "#6B7280", label: "Chờ xử lý" }, "in-progress": { bg: "#EFF6FF", color: "#1D4ED8", label: "Đang làm" }, done: { bg: "#DCFCE7", color: "#166534", label: "Hoàn thành" } };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Công việc hôm nay", value: "3", sub: "2 chưa hoàn thành", Icon: Clock, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "Thiết bị cần bảo trì", value: "2", sub: "1 đang xử lý", Icon: Zap, color: "#D97706", bg: "#FEF3C7" },
          { label: "Cảm biến lệch chuẩn", value: "2", sub: "Khu A, C", Icon: Gauge, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Hoàn thành tuần này", value: "8", sub: "Đúng tiến độ", Icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
        ].map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-800 mb-0.5">{value}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Task list */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Công việc được giao</h3>
            <button className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
              <Plus size={12} /> Thêm task
            </button>
          </div>
          <div className="space-y-2.5">
            {tasks.map(t => {
              const pc = prioColor[t.priority as keyof typeof prioColor];
              const sc = statusConfig[t.status as keyof typeof statusConfig];
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pc.bg }}>
                    <Zap size={13} style={{ color: pc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{t.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{t.zone}</span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{t.due}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts requiring attention */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Cần xử lý ngay</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FEE2E2", color: "#991B1B" }}>3 vấn đề</span>
          </div>
          <div className="space-y-3">
            {alerts.map(({ device, issue, severity }) => {
              const sev = { high: { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" }, medium: { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" }, low: { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" } }[severity];
              return (
                <div key={device} className="p-3 rounded-xl" style={{ background: sev?.bg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sev?.dot }} />
                    <span className="text-xs font-bold" style={{ color: sev?.color }}>{device}</span>
                  </div>
                  <p className="text-xs text-gray-600 pl-3.5">{issue}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tiến độ tuần này</h4>
            {[{ label: "Bảo trì", done: 5, total: 7 }, { label: "Hiệu chỉnh", done: 3, total: 4 }, { label: "Sửa chữa", done: 2, total: 3 }].map(({ label, done, total }) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span className="font-semibold">{done}/{total}</span></div>
                <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: "#1D4ED8" }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Tasks (merged, role-adaptive) ────────────────────────────────

function TasksScreen({ role }: { role: Role }) {
  const [activeTab, setActiveTab] = useState<"schedule" | "repair" | "calibration" | "create">("schedule");

  const [schedule, setSchedule] = useState([
    { id: 1, device: "Máy bơm dinh dưỡng A", zone: "Khu A", type: "Bảo trì định kỳ", date: "29/06/2026", tech: "Trần Huỳnh Đăng Khoa", status: "due" },
    { id: 2, device: "Máy bơm tưới B", zone: "Khu B", type: "Thay bộ lọc", date: "02/07/2026", tech: "Trần Huỳnh Đăng Khoa", status: "upcoming" },
    { id: 3, device: "Hệ thống đèn LED A", zone: "Khu A", type: "Kiểm tra cường độ", date: "05/07/2026", tech: "Nguyễn Thúy Ái", status: "upcoming" },
    { id: 4, device: "Máy điều chỉnh pH", zone: "Khu A", type: "Kiểm tra van bơm", date: "28/06/2026", tech: "Nguyễn Thúy Ái", status: "overdue" },
    { id: 5, device: "Quạt thông gió C", zone: "Khu C", type: "Vệ sinh cánh quạt", date: "10/07/2026", tech: "Trần Huỳnh Đăng Khoa", status: "upcoming" },
    { id: 6, device: "Bơm tuần hoàn E", zone: "Khu E", type: "Kiểm tra lưu lượng", date: "11/07/2026", tech: "Trần Huỳnh Đăng Khoa", status: "upcoming" },
    { id: 7, device: "Đèn LED sinh trưởng E", zone: "Khu E", type: "Vệ sinh và đo cường độ", date: "12/07/2026", tech: "Nguyễn Thúy Ái", status: "upcoming" },
    { id: 8, device: "Bơm dinh dưỡng F", zone: "Khu F", type: "Kiểm tra ống châm", date: "13/07/2026", tech: "Trần Huỳnh Đăng Khoa", status: "upcoming" },
    { id: 9, device: "Bơm tuần hoàn F", zone: "Khu F", type: "Bảo trì định kỳ", date: "15/07/2026", tech: "Trần Huỳnh Đăng Khoa", status: "upcoming" },
    { id: 10, device: "Máy châm dinh dưỡng B", zone: "Khu B", type: "Hiệu chỉnh định lượng", date: "16/07/2026", tech: "Nguyễn Thúy Ái", status: "upcoming" },
  ]);
  const [repairLogs, setRepairLogs] = useState([
    { id: "RL-029", date: "29/06/2026", device: "Máy điều chỉnh pH", zone: "Khu A", issue: "Van bơm châm dịch tắc nghẽn", action: "Tháo vệ sinh van, thay gioăng", tech: "Trần Huỳnh Đăng Khoa", status: "completed" },
    { id: "RL-028", date: "27/06/2026", device: "Cảm biến EC Khu C", zone: "Khu C", issue: "Sai số đo lớn hơn 15%", action: "Hiệu chỉnh lại 2 điểm chuẩn", tech: "Nguyễn Thúy Ái", status: "completed" },
    { id: "RL-027", date: "25/06/2026", device: "Máy bơm dinh dưỡng A", zone: "Khu A", issue: "Rò rỉ ống nối đầu ra", action: "Thay ống nối và siết đầu nối", tech: "Trần Huỳnh Đăng Khoa", status: "completed" },
    { id: "RL-026", date: "22/06/2026", device: "Đèn LED Khu B", zone: "Khu B", issue: "3 bóng LED bị cháy", action: "Thay 3 bóng LED grow light", tech: "Nguyễn Thúy Ái", status: "completed" },
    { id: "RL-025", date: "18/06/2026", device: "Bơm oxy Khu D", zone: "Khu D", issue: "Áp suất bơm yếu", action: "Đang kiểm tra nguyên nhân", tech: "Trần Huỳnh Đăng Khoa", status: "in-progress" },
  ]);
  const [sensors, setSensors] = useState([
    { id: 1, name: "Cảm biến nhiệt độ KA-01", zone: "Khu A", type: "Nhiệt độ", current: 25.8, standard: 25.3, drift: +0.5, unit: "°C", lastCal: "25/06/2026", status: "drift" },
    { id: 2, name: "Cảm biến pH KB-01", zone: "Khu B", type: "pH", current: 6.15, standard: 6.20, drift: -0.05, unit: "", lastCal: "20/06/2026", status: "ok" },
    { id: 3, name: "Cảm biến EC KC-01", zone: "Khu C", type: "EC", current: 1.62, standard: 1.85, drift: -0.23, unit: "mS/cm", lastCal: "18/06/2026", status: "critical" },
    { id: 4, name: "Cảm biến ánh sáng KD-01", zone: "Khu D", type: "Lux", current: 480, standard: 500, drift: -20, unit: "lux", lastCal: "15/06/2026", status: "drift" },
  ]);

  const [newTask, setNewTask] = useState({ zone: "", device: "", type: "Bảo trì định kỳ", tech: "", date: "2026-07-05", priority: "medium", notes: "" });
  const setNT = (k: string, v: string) => setNewTask(f => ({ ...f, [k]: v }));

  const statusSt = { due: { bg: "#FEF3C7", color: "#D97706", label: "Đến hạn" }, overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Quá hạn" }, upcoming: { bg: "#F0FDF4", color: "#16A34A", label: "Sắp tới" } };
  const calSt = { ok: { bg: "#DCFCE7", color: "#166534", label: "Đạt chuẩn" }, drift: { bg: "#FEF3C7", color: "#D97706", label: "Lệch nhẹ" }, critical: { bg: "#FEE2E2", color: "#DC2626", label: "Lệch nhiều" } };

  const tabs = [
    { id: "schedule", l: "Lịch công việc" },
    { id: "repair", l: "Nhật ký sửa chữa" },
    { id: "calibration", l: "Hiệu chỉnh cảm biến" },
    { id: "create", l: "Tạo công việc" },
  ] as const;

  const displaySchedule = role === "tech"
    ? schedule.filter(s => s.tech === "Trần Huỳnh Đăng Khoa")
    : schedule;

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white";

  return (
    <div className="space-y-5">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === t.id ? { background: "#1D4ED8", color: "#fff" } : { background: "transparent", color: "#6B7280" }}>
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "schedule" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Lịch công việc {role === "tech" ? "của tôi" : "toàn hệ thống"}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {schedule.filter(s => s.status === "overdue").length > 0 && (
                <span className="px-2 py-1 rounded-full font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  {schedule.filter(s => s.status === "overdue").length} quá hạn
                </span>
              )}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Ngày", "Thiết bị", "Khu vực", "Loại bảo trì", "Kỹ thuật viên", "Trạng thái", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {displaySchedule.map(s => {
                const sc = statusSt[s.status as keyof typeof statusSt];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.device}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.tech}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { const note = window.prompt("Ghi chú kết quả xử lý:", "Đã kiểm tra và hoàn thành"); if (note) { setSchedule(rows => rows.filter(item => item.id !== s.id)); window.alert(`Đã hoàn thành: ${s.device}\n${note}`); } }} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1D4ED8" }}>Xử lý</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "repair" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Nhật ký sửa chữa</h3>
            <button onClick={() => { const device = window.prompt("Thiết bị cần ghi nhật ký:"); if (!device) return; const issue = window.prompt("Mô tả sự cố:"); if (!issue) return; setRepairLogs(rows => [{ id: `RL-${String(30 + rows.length).padStart(3,"0")}`, date: new Date().toLocaleDateString("vi-VN"), device, zone: "Chưa chọn", issue, action: "Đang xử lý", tech: role === "tech" ? "Trần Huỳnh Đăng Khoa" : "Chưa phân công", status: "in-progress" }, ...rows]); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
              <Plus size={14} /> Ghi nhật ký
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {repairLogs.map(log => (
              <div key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{log.id}</span>
                      <span className="text-xs text-gray-400">{log.date}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: log.status === "completed" ? "#DCFCE7" : "#FEF3C7", color: log.status === "completed" ? "#166534" : "#D97706" }}>
                        {log.status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800 mb-1">{log.device} <span className="text-gray-400 font-normal text-sm">— {log.zone}</span></div>
                    <div className="text-sm text-gray-500 mb-1"><span className="font-medium text-gray-700">Vấn đề:</span> {log.issue}</div>
                    <div className="text-sm text-gray-500"><span className="font-medium text-gray-700">Xử lý:</span> {log.action}</div>
                    <div className="text-xs text-gray-400 mt-1">KTV: {log.tech}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { const action = window.prompt("Cập nhật cách xử lý:", log.action); if (action) setRepairLogs(rows => rows.map(item => item.id === log.id ? { ...item, action, status: "completed" } : item)); }} title="Cập nhật nhật ký" className="p-1.5 rounded-lg hover:bg-blue-50"><Edit2 size={14} className="text-gray-400" /></button>
                    <button onClick={() => { if (window.confirm(`Xóa nhật ký ${log.id}?`)) setRepairLogs(rows => rows.filter(item => item.id !== log.id)); }} title="Xóa nhật ký" className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-gray-400" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "calibration" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Hiệu chỉnh cảm biến</h3>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
              <Download size={14} /> Xuất báo cáo
            </button>
          </div>
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Cảm biến", "Khu vực", "Loại", "Hiện tại", "Chuẩn", "Sai lệch", "Hiệu chỉnh cuối", "Tình trạng", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sensors.map(s => {
                const sc = calSt[s.status as keyof typeof calSt];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{s.type}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.current}{s.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.standard}{s.unit}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: Math.abs(s.drift) > 0.15 ? "#DC2626" : "#D97706" }}>
                      {s.drift > 0 ? "+" : ""}{s.drift}{s.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.lastCal}</td>
                    <td className="px-4 py-3"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (s.status === "ok") window.alert(`${s.name} đang đạt chuẩn. Sai lệch: ${s.drift}${s.unit}`); else { const value = window.prompt("Nhập giá trị sau hiệu chỉnh:", String(s.standard)); if (value != null && Number.isFinite(Number(value))) setSensors(rows => rows.map(item => item.id === s.id ? { ...item, current: Number(value), drift: Number((Number(value) - item.standard).toFixed(2)), status: "ok", lastCal: new Date().toLocaleDateString("vi-VN") } : item)); } }} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: s.status === "ok" ? "#6B7280" : "#1D4ED8" }}>
                        {s.status === "ok" ? "Chi tiết" : "Hiệu chỉnh"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "create" && (
        <div className="max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
            <h2 className="text-base font-bold text-white">Tạo công việc bảo trì mới</h2>
            <p className="text-blue-200 text-xs mt-0.5">Điền thông tin để lên lịch bảo trì thiết bị</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Khu vực <span className="text-red-500">*</span></label>
                <select value={newTask.zone} onChange={e => { setNT("zone", e.target.value); setNT("device", ""); }} className={inputCls}>
                  <option value="">— Chọn khu vực —</option>
                  {ZONES.map(z => <option key={z.id} value={z.name}>{z.name} — {z.crop}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thiết bị <span className="text-red-500">*</span></label>
                <select value={newTask.device} onChange={e => setNT("device", e.target.value)} className={inputCls} disabled={!newTask.zone}>
                  <option value="">— Chọn thiết bị —</option>
                  {DEVICES_INIT.filter(d => !newTask.zone || d.zone === newTask.zone).map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại bảo trì</label>
                <select value={newTask.type} onChange={e => setNT("type", e.target.value)} className={inputCls}>
                  {["Bảo trì định kỳ", "Thay linh kiện", "Hiệu chỉnh cảm biến", "Vệ sinh thiết bị", "Sửa chữa khẩn"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày thực hiện</label>
                <input type="date" value={newTask.date} onChange={e => setNT("date", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mức ưu tiên</label>
              <div className="flex gap-3">
                {[{ v: "low", l: "Thấp", c: "#16A34A", bg: "#DCFCE7" }, { v: "medium", l: "Trung bình", c: "#D97706", bg: "#FEF3C7" }, { v: "high", l: "Khẩn cấp", c: "#DC2626", bg: "#FEE2E2" }].map(p => (
                  <button key={p.v} onClick={() => setNT("priority", p.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={newTask.priority === p.v ? { background: p.bg, color: p.c, borderColor: p.c } : { background: "#F9FAFB", color: "#9CA3AF", borderColor: "transparent" }}>
                    {p.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú</label>
              <textarea value={newTask.notes} onChange={e => setNT("notes", e.target.value)} rows={3} className={`${inputCls} resize-none`}
                placeholder="Mô tả chi tiết công việc cần thực hiện..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setActiveTab("schedule")}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
              <button onClick={() => { const nextId = Math.max(0, ...schedule.map(item => item.id)) + 1; setSchedule(rows => [...rows, { id: nextId, device: newTask.device, zone: newTask.zone, type: newTask.type, date: new Date(newTask.date).toLocaleDateString("vi-VN"), tech: newTask.tech || "Trần Huỳnh Đăng Khoa", status: "upcoming" }]); setNewTask({ zone: "", device: "", type: "Bảo trì định kỳ", tech: "", date: "2026-07-05", priority: "medium", notes: "" }); setActiveTab("schedule"); window.alert("Đã lưu công việc bảo trì"); }} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                style={{ background: newTask.zone && newTask.device ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "#D1D5DB" }}
                disabled={!newTask.zone || !newTask.device}>
                Lưu công việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REMOVED: MaintenanceScreen (replaced by TasksScreen) ──────────────────

function _REMOVED_MaintenanceScreen({ onCreateTask }: { onCreateTask: () => void }) {
  const [activeTab, setActiveTab] = useState<"schedule" | "history">("schedule");
  const schedule = [
    { id: 1, device: "Máy bơm dinh dưỡng A", zone: "Khu A", type: "Bảo trì định kỳ", nextDate: "29/06/2026", interval: "30 ngày", status: "due", tech: "Trần Huỳnh Đăng Khoa" },
    { id: 2, device: "Máy bơm tưới B", zone: "Khu B", type: "Thay bộ lọc", nextDate: "02/07/2026", interval: "45 ngày", status: "upcoming", tech: "Trần Huỳnh Đăng Khoa" },
    { id: 3, device: "Hệ thống đèn LED A", zone: "Khu A", type: "Kiểm tra cường độ", nextDate: "05/07/2026", interval: "60 ngày", status: "upcoming", tech: "Nguyễn Thúy Ái" },
    { id: 4, device: "Quạt thông gió C", zone: "Khu C", type: "Vệ sinh cánh quạt", nextDate: "10/07/2026", interval: "30 ngày", status: "upcoming", tech: "Trần Huỳnh Đăng Khoa" },
    { id: 5, device: "Máy điều chỉnh pH", zone: "Khu A", type: "Kiểm tra van bơm", nextDate: "28/06/2026", interval: "15 ngày", status: "overdue", tech: "Nguyễn Thúy Ái" },
    { id: 6, device: "Bơm oxy D", zone: "Khu D", type: "Thay dầu bôi trơn", nextDate: "15/07/2026", interval: "90 ngày", status: "upcoming", tech: "Trần Huỳnh Đăng Khoa" },
  ];
  const history = [
    { date: "25/06/2026", device: "Cảm biến nhiệt độ Khu A", action: "Hiệu chỉnh lại — lệch +0.5°C", tech: "Trần Huỳnh Đăng Khoa", duration: "45 phút", result: "ok" },
    { date: "23/06/2026", device: "Máy bơm dinh dưỡng A", action: "Thay ron cao su bơm", tech: "Trần Huỳnh Đăng Khoa", duration: "90 phút", result: "ok" },
    { date: "20/06/2026", device: "Đèn LED Khu B", action: "Thay 3 bóng LED bị cháy", tech: "Nguyễn Thúy Ái", duration: "60 phút", result: "ok" },
    { date: "18/06/2026", device: "Máy điều chỉnh pH", action: "Sửa van châm dịch bị tắc", tech: "Trần Huỳnh Đăng Khoa", duration: "120 phút", result: "partial" },
    { date: "15/06/2026", device: "Quạt thông gió C", action: "Vệ sinh cánh quạt, tra dầu", tech: "Nguyễn Thúy Ái", duration: "30 phút", result: "ok" },
  ];
  const statusCfg = { due: { bg: "#FEF3C7", color: "#D97706", label: "Đến hạn" }, overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Quá hạn" }, upcoming: { bg: "#F0FDF4", color: "#16A34A", label: "Sắp tới" } };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Thiết bị cần bảo trì", value: schedule.filter(s => s.status === "due" || s.status === "overdue").length, Icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" },
          { label: "Quá hạn", value: schedule.filter(s => s.status === "overdue").length, Icon: Clock, color: "#DC2626", bg: "#FEE2E2" },
          { label: "Tháng này", value: 8, Icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Tổng thiết bị theo dõi", value: schedule.length, Icon: Zap, color: "#1D4ED8", bg: "#EFF6FF" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}><Icon size={18} style={{ color }} /></div>
            <div><div className="text-2xl font-extrabold text-gray-800">{value}</div><div className="text-xs text-gray-400">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex gap-2">
            {(["schedule", "history"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={activeTab === t ? { background: "#1D4ED8", color: "#fff" } : { background: "#F3F4F6", color: "#6B7280" }}>
                {t === "schedule" ? "Lịch bảo trì" : "Lịch sử bảo trì"}
              </button>
            ))}
          </div>
          <button onClick={onCreateTask} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
            <Plus size={14} /> Thêm lịch
          </button>
        </div>

        {activeTab === "schedule" ? (
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Thiết bị", "Khu vực", "Loại bảo trì", "Ngày tiếp theo", "Chu kỳ", "Kỹ thuật viên", "Trạng thái", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {schedule.map(s => {
                const sc = statusCfg[s.status as keyof typeof statusCfg];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.device}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.type}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{s.nextDate}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.interval}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.tech}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={onCreateTask} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1D4ED8" }}>Xử lý</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Ngày", "Thiết bị", "Công việc đã làm", "Kỹ thuật viên", "Thời gian", "Kết quả"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{h.date}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{h.device}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{h.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{h.tech}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{h.duration}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: h.result === "ok" ? "#DCFCE7" : "#FEF3C7", color: h.result === "ok" ? "#166534" : "#92400E" }}>
                      {h.result === "ok" ? "Hoàn thành" : "Một phần"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── REMOVED: CalibrationScreen (merged into TasksScreen) ─────────────────

function _REMOVED_CalibrationScreen() {
  const sensors = [
    { id: 1, name: "Cảm biến nhiệt độ KA-01", zone: "Khu A", type: "Nhiệt độ", current: 25.8, standard: 25.3, drift: +0.5, unit: "°C", lastCal: "25/06/2026", status: "drift" },
    { id: 2, name: "Cảm biến pH KB-01", zone: "Khu B", type: "pH", current: 6.15, standard: 6.20, drift: -0.05, unit: "", lastCal: "20/06/2026", status: "ok" },
    { id: 3, name: "Cảm biến EC KC-01", zone: "Khu C", type: "EC", current: 1.62, standard: 1.85, drift: -0.23, unit: "mS/cm", lastCal: "18/06/2026", status: "critical" },
    { id: 4, name: "Cảm biến độ ẩm KA-02", zone: "Khu A", type: "Độ ẩm", current: 63.2, standard: 63.0, drift: +0.2, unit: "%", lastCal: "28/06/2026", status: "ok" },
    { id: 5, name: "Cảm biến ánh sáng KD-01", zone: "Khu D", type: "Lux", current: 480, standard: 500, drift: -20, unit: "lux", lastCal: "15/06/2026", status: "drift" },
    { id: 6, name: "Cảm biến pH KE-01", zone: "Khu E", type: "pH", current: 6.8, standard: 6.5, drift: +0.3, unit: "", lastCal: "10/06/2026", status: "critical" },
  ];
  const statusCfg = { ok: { bg: "#DCFCE7", color: "#166534", label: "Đạt chuẩn" }, drift: { bg: "#FEF3C7", color: "#D97706", label: "Lệch nhẹ" }, critical: { bg: "#FEE2E2", color: "#DC2626", label: "Lệch nhiều" } };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Đạt chuẩn", value: sensors.filter(s => s.status === "ok").length, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Lệch nhẹ (cần chú ý)", value: sensors.filter(s => s.status === "drift").length, color: "#D97706", bg: "#FEF3C7" },
          { label: "Lệch nhiều (cần hiệu chỉnh)", value: sensors.filter(s => s.status === "critical").length, color: "#DC2626", bg: "#FEE2E2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0" style={{ background: bg, color }}>{value}</div>
            <div className="text-sm font-semibold text-gray-700">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Bảng hiệu chỉnh cảm biến</h3>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
            <Download size={14} /> Xuất báo cáo
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{ background: "#F9FAFB" }}>
            {["Cảm biến", "Khu vực", "Loại", "Giá trị hiện tại", "Giá trị chuẩn", "Sai lệch", "Lần hiệu chỉnh cuối", "Tình trạng", "Thao tác"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {sensors.map(s => {
              const sc = statusCfg[s.status as keyof typeof statusCfg];
              const driftColor = Math.abs(s.drift) > 0.2 || Math.abs(s.drift) > 15 ? "#DC2626" : "#D97706";
              return (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                  <td className="px-4 py-3 text-xs font-medium px-2 py-1">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{s.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.current}{s.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.standard}{s.unit}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: driftColor }}>
                    {s.drift > 0 ? "+" : ""}{s.drift}{s.unit}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.lastCal}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: s.status === "ok" ? "#6B7280" : "#1D4ED8" }}>
                      {s.status === "ok" ? "Chi tiết" : "Hiệu chỉnh"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── REMOVED: RepairLogScreen (merged into TasksScreen) ───────────────────

function _REMOVED_RepairLogScreen() {
  const logs = [
    { id: "RL-029", date: "29/06/2026", time: "10:15", device: "Máy điều chỉnh pH", zone: "Khu A", issue: "Van bơm châm dịch tắc nghẽn", action: "Tháo vệ sinh van, thay gioăng cao su", parts: "Gioăng cao su 5mm × 2", cost: "45.000đ", duration: "90 phút", tech: "Trần Huỳnh Đăng Khoa", status: "completed" },
    { id: "RL-028", date: "27/06/2026", time: "14:30", device: "Cảm biến EC Khu C", zone: "Khu C", issue: "Sai số đo lớn hơn 15%", action: "Hiệu chỉnh lại điểm chuẩn 2 điểm", parts: "Dung dịch chuẩn EC", cost: "120.000đ", duration: "45 phút", tech: "Nguyễn Thúy Ái", status: "completed" },
    { id: "RL-027", date: "25/06/2026", time: "09:00", device: "Máy bơm dinh dưỡng A", zone: "Khu A", issue: "Rò rỉ ống nối đầu ra", action: "Thay ống nối và siết lại đầu nối", parts: "Ống nối 20mm, keo gen", cost: "85.000đ", duration: "60 phút", tech: "Trần Huỳnh Đăng Khoa", status: "completed" },
    { id: "RL-026", date: "22/06/2026", time: "11:00", device: "Đèn LED Khu B — bóng 3", zone: "Khu B", issue: "3 bóng LED bị cháy", action: "Thay 3 bóng LED grow light 50W", parts: "Bóng LED 50W × 3", cost: "360.000đ", duration: "60 phút", tech: "Nguyễn Thúy Ái", status: "completed" },
    { id: "RL-025", date: "20/06/2026", time: "15:00", device: "Quạt thông gió C", zone: "Khu C", issue: "Tiếng ồn bất thường", action: "Tra dầu trục quạt, vệ sinh cánh quạt", parts: "Dầu bôi trơn WD-40", cost: "25.000đ", duration: "30 phút", tech: "Trần Huỳnh Đăng Khoa", status: "completed" },
    { id: "RL-024", date: "18/06/2026", time: "08:30", device: "Bơm oxy Khu D", zone: "Khu D", issue: "Áp suất bơm yếu", action: "Đang kiểm tra nguyên nhân", parts: "Chưa xác định", cost: "—", duration: "Đang xử lý", tech: "Trần Huỳnh Đăng Khoa", status: "in-progress" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng lần sửa chữa", value: logs.length, Icon: Activity, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "Tháng này", value: 4, Icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Đang xử lý", value: logs.filter(l => l.status === "in-progress").length, Icon: Clock, color: "#D97706", bg: "#FEF3C7" },
          { label: "Chi phí tháng này", value: "635K", Icon: ArrowDown, color: "#7C3AED", bg: "#F5F3FF" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}><Icon size={18} style={{ color }} /></div>
            <div><div className="text-2xl font-extrabold text-gray-800">{value}</div><div className="text-xs text-gray-400">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Nhật ký sửa chữa</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: "#F3F4F6", color: "#6B7280" }}>
              <Download size={13} /> Xuất CSV
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
              <Plus size={14} /> Ghi nhật ký
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {logs.map(log => (
            <div key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{log.id}</span>
                    <span className="text-xs text-gray-400">{log.date} · {log.time}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: log.status === "completed" ? "#DCFCE7" : "#FEF3C7", color: log.status === "completed" ? "#166534" : "#D97706" }}>
                      {log.status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">{log.device} <span className="text-gray-400 font-normal text-sm">— {log.zone}</span></div>
                  <div className="text-sm text-gray-500 mb-2"><span className="font-medium text-gray-700">Vấn đề:</span> {log.issue}</div>
                  <div className="text-sm text-gray-500 mb-2"><span className="font-medium text-gray-700">Xử lý:</span> {log.action}</div>
                  <div className="flex items-center gap-5 text-xs text-gray-400">
                    <span><span className="font-medium text-gray-600">Linh kiện:</span> {log.parts}</span>
                    <span><span className="font-medium text-gray-600">Chi phí:</span> {log.cost}</span>
                    <span><span className="font-medium text-gray-600">Thời gian:</span> {log.duration}</span>
                    <span><span className="font-medium text-gray-600">KTV:</span> {log.tech}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"><Edit2 size={14} className="text-gray-400" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-gray-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── REMOVED: TaskScheduleScreen (merged into TasksScreen) ────────────────

function _REMOVED_TaskScheduleScreen() {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dates = ["30/06", "01/07", "02/07", "03/07", "04/07", "05/07", "06/07"];
  const tasks = [
    { day: 0, title: "Bảo trì bơm A", time: "08:00", type: "maintenance", tech: "Đăng Khoa" },
    { day: 0, title: "Kiểm tra pH Khu C", time: "10:30", type: "calibration", tech: "Thúy Ái" },
    { day: 1, title: "Thay bộ lọc bơm B", time: "09:00", type: "repair", tech: "Đăng Khoa" },
    { day: 1, title: "Vệ sinh đèn LED A", time: "14:00", type: "maintenance", tech: "Thúy Ái" },
    { day: 2, title: "Hiệu chỉnh EC Khu C", time: "08:30", type: "calibration", tech: "Đăng Khoa" },
    { day: 3, title: "Kiểm tra quạt D", time: "09:00", type: "maintenance", tech: "Đăng Khoa" },
    { day: 3, title: "Bảo trì bơm oxy", time: "13:00", type: "maintenance", tech: "Thúy Ái" },
    { day: 4, title: "Hiệu chỉnh nhiệt độ", time: "10:00", type: "calibration", tech: "Thúy Ái" },
    { day: 5, title: "Vệ sinh toàn bộ Khu A", time: "08:00", type: "maintenance", tech: "Đăng Khoa" },
    { day: 6, title: "Kiểm tra tổng tuần", time: "09:00", type: "inspection", tech: "Cả nhóm" },
  ];
  const typeColor: Record<string, { bg: string; color: string }> = {
    maintenance: { bg: "#EFF6FF", color: "#1D4ED8" },
    calibration: { bg: "#F5F3FF", color: "#7C3AED" },
    repair: { bg: "#FEE2E2", color: "#DC2626" },
    inspection: { bg: "#F0FDF4", color: "#16A34A" },
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tuần này", value: tasks.length, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "Bảo trì", value: tasks.filter(t => t.type === "maintenance").length, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "Hiệu chỉnh", value: tasks.filter(t => t.type === "calibration").length, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Sửa chữa", value: tasks.filter(t => t.type === "repair").length, color: "#DC2626", bg: "#FEE2E2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0" style={{ background: bg, color }}>{value}</div>
            <div className="text-sm font-semibold text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-800">Lịch tuần 27 — 30/06 đến 06/07/2026</h3>
          <div className="flex items-center gap-3">
            {[["maintenance", "Bảo trì"], ["calibration", "Hiệu chỉnh"], ["repair", "Sửa chữa"], ["inspection", "Kiểm tra"]].map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: typeColor[type].color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, i) => (
            <div key={day}>
              <div className="text-center mb-2">
                <div className="text-xs font-bold text-gray-500">{day}</div>
                <div className="text-xs text-gray-400">{dates[i]}</div>
              </div>
              <div className="space-y-2 min-h-[180px] p-2 rounded-xl bg-gray-50">
                {tasks.filter(t => t.day === i).map((t, j) => {
                  const tc = typeColor[t.type];
                  return (
                    <div key={j} className="p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{ background: tc.bg, borderLeft: `3px solid ${tc.color}` }}>
                      <div className="text-[11px] font-bold leading-tight" style={{ color: tc.color }}>{t.time}</div>
                      <div className="text-[11px] text-gray-700 leading-tight mt-0.5">{t.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.tech}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen: Admin Dashboard ───────────────────────────────────────────────

function AdminDashboardView() {
  const systemStats = [
    { label: "Tổng thiết bị", value: "8", sub: "6 đang hoạt động", Icon: Zap, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Người dùng", value: "6", sub: "5 đang hoạt động", Icon: Users, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Khu vực trồng", value: "6", sub: "5 khu bình thường", Icon: Map, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Cảnh báo hôm nay", value: "4", sub: "2 chưa xử lý", Icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" },
  ];

  const recentActivity = [
    { time: "10:32", user: "Huỳnh Minh Quân", action: "Bật máy bơm dinh dưỡng A", type: "device" },
    { time: "09:47", user: "Hệ thống", action: "Cảnh báo pH Khu A vượt ngưỡng 7.1", type: "alert" },
    { time: "09:15", user: "Nguyễn Thanh Tâm", action: "Xem lịch sử dữ liệu Khu B", type: "view" },
    { time: "08:30", user: "Trần Huỳnh Đăng Khoa", action: "Đăng nhập hệ thống", type: "login" },
    { time: "08:00", user: "Hệ thống", action: "Bật lịch đèn LED tất cả khu", type: "auto" },
    { time: "07:45", user: "Huỳnh Minh Quân", action: "Điều chỉnh pH tự động — Khu A", type: "device" },
  ];

  const deviceHealth = [
    { name: "Máy bơm dinh dưỡng A", status: "online", uptime: "99.2%", zone: "Khu A" },
    { name: "Đèn LED A + B", status: "online", uptime: "98.7%", zone: "Khu A, B" },
    { name: "Quạt thông gió C", status: "online", uptime: "97.4%", zone: "Khu C" },
    { name: "Máy điều chỉnh pH", status: "offline", uptime: "85.1%", zone: "Khu A" },
    { name: "Bơm oxy D", status: "online", uptime: "99.8%", zone: "Khu D" },
  ];

  const zoneStatus = [
    { name: "Khu A", crop: "Rau muống", health: 92, status: "good" },
    { name: "Khu B", crop: "Xà lách", health: 87, status: "good" },
    { name: "Khu C", crop: "Cải bó xôi", health: 74, status: "warning" },
    { name: "Khu D", crop: "Húng quế", health: 95, status: "good" },
    { name: "Khu E", crop: "Cà chua bi", health: 63, status: "danger" },
    { name: "Khu F", crop: "Dưa leo", health: 88, status: "good" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {systemStats.map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-800 mb-0.5">{value}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Hoạt động gần đây</h3>
            <span className="text-xs text-gray-400">Hôm nay, 29/06/2026</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map(({ time, user, action, type }) => {
              const typeConfig: Record<string, { color: string; bg: string }> = {
                device: { color: "#2E7D32", bg: "#E8F5E9" },
                alert: { color: "#D97706", bg: "#FEF3C7" },
                view: { color: "#2563EB", bg: "#EFF6FF" },
                login: { color: "#7C3AED", bg: "#F5F3FF" },
                auto: { color: "#0891B2", bg: "#ECFEFF" },
              };
              const cfg = typeConfig[type] || typeConfig.view;
              return (
                <div key={`${time}-${action}`} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                    {type === "alert" ? <AlertTriangle size={13} style={{ color: cfg.color }} /> :
                     type === "device" ? <Zap size={13} style={{ color: cfg.color }} /> :
                     type === "login" ? <Users size={13} style={{ color: cfg.color }} /> :
                     type === "auto" ? <Clock size={13} style={{ color: cfg.color }} /> :
                     <Eye size={13} style={{ color: cfg.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-700 truncate">{action}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{user}</div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Health Overview */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Sức khỏe khu vực</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FEF3C7", color: "#D97706" }}>1 nguy hiểm</span>
          </div>
          <div className="space-y-3">
            {zoneStatus.map(({ name, crop, health, status }) => {
              const barColor = status === "good" ? "#2E7D32" : status === "warning" ? "#D97706" : "#EF4444";
              const dotColor = status === "good" ? "#22C55E" : status === "warning" ? "#F59E0B" : "#EF4444";
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      <span className="text-xs font-semibold text-gray-700">{name}</span>
                      <span className="text-[11px] text-gray-400">{crop}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: barColor }}>{health}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${health}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Device Health Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Trạng thái thiết bị</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">8 thiết bị tổng cộng</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: "#E8F5E9", color: "#2E7D32" }}>
              <Plus size={12} /> Thêm thiết bị
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Thiết bị", "Khu vực", "Trạng thái", "Uptime", "Thao tác"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deviceHealth.map(({ name, status, uptime, zone }) => (
                <tr key={name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{zone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: status === "online" ? "#DCFCE7" : "#FEE2E2", color: status === "online" ? "#166534" : "#991B1B" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: status === "online" ? "#22C55E" : "#EF4444" }} />
                      {status === "online" ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: parseFloat(uptime) > 95 ? "#2E7D32" : "#D97706" }}>{uptime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"><Edit2 size={13} className="text-gray-400" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} className="text-gray-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Device Tech View (for DevicesScreen tech role) ─────────────────────

function DeviceTechView() {
  const [activeTab, setActiveTab] = useState<"overview" | "maintenance" | "calibration">("overview");
  const schedule = [
    { id: 1, device: "Máy bơm dinh dưỡng A", zone: "Khu A", type: "Bảo trì định kỳ", nextDate: "29/06/2026", interval: "30 ngày", status: "due", tech: "Trần Huỳnh Đăng Khoa" },
    { id: 2, device: "Máy bơm tưới B", zone: "Khu B", type: "Thay bộ lọc", nextDate: "02/07/2026", interval: "45 ngày", status: "upcoming", tech: "Trần Huỳnh Đăng Khoa" },
    { id: 3, device: "Hệ thống đèn LED A", zone: "Khu A", type: "Kiểm tra cường độ", nextDate: "05/07/2026", interval: "60 ngày", status: "upcoming", tech: "Nguyễn Thúy Ái" },
    { id: 4, device: "Máy điều chỉnh pH", zone: "Khu A", type: "Kiểm tra van bơm", nextDate: "28/06/2026", interval: "15 ngày", status: "overdue", tech: "Nguyễn Thúy Ái" },
  ];
  const sensors = [
    { id: 1, name: "Cảm biến nhiệt độ KA-01", zone: "Khu A", type: "Nhiệt độ", current: 25.8, standard: 25.3, drift: +0.5, unit: "°C", lastCal: "25/06/2026", status: "drift" },
    { id: 2, name: "Cảm biến pH KB-01", zone: "Khu B", type: "pH", current: 6.15, standard: 6.20, drift: -0.05, unit: "", lastCal: "20/06/2026", status: "ok" },
    { id: 3, name: "Cảm biến EC KC-01", zone: "Khu C", type: "EC", current: 1.62, standard: 1.85, drift: -0.23, unit: "mS/cm", lastCal: "18/06/2026", status: "critical" },
    { id: 4, name: "Cảm biến độ ẩm KA-02", zone: "Khu A", type: "Độ ẩm", current: 63.2, standard: 63.0, drift: +0.2, unit: "%", lastCal: "28/06/2026", status: "ok" },
  ];
  const statusCfg = { due: { bg: "#FEF3C7", color: "#D97706", label: "Đến hạn" }, overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Quá hạn" }, upcoming: { bg: "#F0FDF4", color: "#16A34A", label: "Sắp tới" } };
  const calSt = { ok: { bg: "#DCFCE7", color: "#166534", label: "Đạt chuẩn" }, drift: { bg: "#FEF3C7", color: "#D97706", label: "Lệch nhẹ" }, critical: { bg: "#FEE2E2", color: "#DC2626", label: "Lệch nhiều" } };

  const tabs = [{ id: "overview", l: "Tổng quan" }, { id: "maintenance", l: "Lịch bảo trì" }, { id: "calibration", l: "Hiệu chỉnh" }] as const;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === t.id ? { background: "#1D4ED8", color: "#fff" } : { background: "transparent", color: "#6B7280" }}>
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          {DEVICES_INIT.map(d => (
            <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: d.on ? "#EFF6FF" : "#F9FAFB" }}>
                <Zap size={18} style={{ color: d.on ? "#1D4ED8" : "#9CA3AF" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{d.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{d.zone} · {d.watt}W</div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                style={{ background: d.on ? "#DCFCE7" : "#F3F4F6", color: d.on ? "#166534" : "#6B7280" }}>
                {d.on ? "Online" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Thiết bị", "Khu vực", "Loại bảo trì", "Ngày tiếp theo", "Chu kỳ", "Trạng thái"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {schedule.map(s => {
                const sc = statusCfg[s.status as keyof typeof statusCfg];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.device}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.type}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{s.nextDate}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.interval}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "calibration" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Cảm biến", "Khu vực", "Loại", "Giá trị hiện tại", "Giá trị chuẩn", "Sai lệch", "Hiệu chỉnh cuối", "Tình trạng", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sensors.map(s => {
                const sc = calSt[s.status as keyof typeof calSt];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800 text-[13px]">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.zone}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{s.type}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.current}{s.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.standard}{s.unit}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: Math.abs(s.drift) > 0.15 ? "#DC2626" : "#D97706" }}>
                      {s.drift > 0 ? "+" : ""}{s.drift}{s.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.lastCal}</td>
                    <td className="px-4 py-3"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: s.status === "ok" ? "#6B7280" : "#1D4ED8" }}>
                        {s.status === "ok" ? "Chi tiết" : "Hiệu chỉnh"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Screen: Device Management (Admin view) ────────────────────────────────

function DeviceManagementView() {
  const [devices, setDevices] = useState(DEVICES_INIT.map(d => ({ ...d, firmware: "v2.1.4", ip: `192.168.1.${10 + d.id}`, signal: Math.floor(75 + Math.random() * 20) })));
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = devices.filter(d =>
    (filter === "all" || d.type === filter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.zone.toLowerCase().includes(search.toLowerCase()))
  );

  const typeLabel: Record<string, string> = { pump: "Máy bơm", light: "Đèn LED", fan: "Quạt", dosing: "Bơm châm" };
  const typeColor: Record<string, { bg: string; color: string }> = {
    pump: { bg: "#EFF6FF", color: "#2563EB" },
    light: { bg: "#FEF3C7", color: "#D97706" },
    fan: { bg: "#F0FDF4", color: "#2E7D32" },
    dosing: { bg: "#F5F3FF", color: "#7C3AED" },
  };

  const counts = {
    all: devices.length,
    pump: devices.filter(d => d.type === "pump").length,
    light: devices.filter(d => d.type === "light").length,
    fan: devices.filter(d => d.type === "fan").length,
    dosing: devices.filter(d => d.type === "dosing").length,
  };
  const pagedDevices = filtered.slice((page - 1) * 8, page * 8);
  const addLocalDevice = () => { const name = window.prompt("Tên thiết bị:"); if (!name) return; const zone = window.prompt("Khu vực:", "Khu A") || "Khu A"; const type = window.prompt("Loại: pump, light, fan hoặc dosing", "pump") || "pump"; const id = Math.max(0, ...devices.map(item => item.id)) + 1; setDevices(rows => [...rows, { id, name, zone, type, on: false, mode: "manual", watt: 50, lastRun: "Chưa chạy", firmware: "v2.1.4", ip: `192.168.1.${10 + id}`, signal: 100 }]); };
  const editLocalDevice = (device: any) => { const name = window.prompt("Tên thiết bị:", device.name); if (!name) return; const zone = window.prompt("Khu vực:", device.zone); if (!zone) return; setDevices(rows => rows.map(item => item.id === device.id ? { ...item, name, zone } : item)); };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng thiết bị", value: devices.length, Icon: Zap, color: "#2E7D32", bg: "#E8F5E9" },
          { label: "Đang hoạt động", value: devices.filter(d => d.on).length, Icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Chế độ tự động", value: devices.filter(d => d.mode === "auto").length, Icon: Activity, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Cần bảo trì", value: 1, Icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-800">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(["all", "pump", "light", "fan", "dosing"] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={filter === t
                ? { background: "#2E7D32", color: "#fff" }
                : { background: "#F3F4F6", color: "#6B7280" }}>
              {t === "all" ? `Tất cả (${counts.all})` : t === "pump" ? `Máy bơm (${counts.pump})` : t === "light" ? `Đèn LED (${counts.light})` : t === "fan" ? `Quạt (${counts.fan})` : `Bơm châm (${counts.dosing})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-52">
            <Search size={13} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" placeholder="Tìm thiết bị..." />
          </div>
          <button data-local-action="true" onClick={addLocalDevice} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#2E7D32,#388E3C)" }}>
            <Plus size={14} /> Thêm thiết bị
          </button>
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Thiết bị", "Loại", "Khu vực", "Trạng thái", "Chế độ", "Công suất", "Firmware", "IP", "Thao tác"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedDevices.map(d => {
                const tc = typeColor[d.type] || typeColor.pump;
                return (
                  <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 text-[13px]">{d.name}</div>
                      <div className="text-[11px] text-gray-400">Chạy lần cuối: {d.lastRun}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={tc}>
                        {typeLabel[d.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.zone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: d.on ? "#DCFCE7" : "#F3F4F6", color: d.on ? "#166534" : "#6B7280" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.on ? "#22C55E" : "#9CA3AF" }} />
                        {d.on ? "Đang chạy" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ background: d.mode === "auto" ? "#EFF6FF" : d.mode === "schedule" ? "#FEF3C7" : "#F3F4F6", color: d.mode === "auto" ? "#2563EB" : d.mode === "schedule" ? "#D97706" : "#6B7280" }}>
                        {d.mode === "auto" ? "Tự động" : d.mode === "schedule" ? "Lịch" : "Thủ công"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{d.watt}W</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{(d as any).firmware}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{(d as any).ip}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => editLocalDevice(d)} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Chỉnh sửa"><Edit2 size={13} className="text-gray-400 hover:text-green-600" /></button>
                        <button onClick={() => window.alert(`${d.name}\nKhu vực: ${d.zone}\nTrạng thái: ${d.on ? "Đang chạy" : "Tắt"}\nChế độ: ${d.mode}\nCông suất: ${d.watt}W\nFirmware: ${(d as any).firmware}\nIP: ${(d as any).ip}`)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Chi tiết"><Eye size={13} className="text-gray-400 hover:text-blue-600" /></button>
                        <button onClick={() => { if (window.confirm(`Xóa ${d.name}?`)) setDevices(rows => rows.filter(item => item.id !== d.id)); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Xóa"><Trash2 size={13} className="text-gray-400 hover:text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Hiển thị {filtered.length}/{devices.length} thiết bị</span>
          <div className="flex items-center gap-1">
            {[1, 2].map(p => (
              <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                style={p === page ? { background: "#2E7D32", color: "#fff" } : { background: "#F3F4F6", color: "#6B7280" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Owner Notifications ───────────────────────────────────────────

function OwnerNotificationsScreen() {
  const [settings, setSettings] = useState({
    alertPH: true, alertEC: true, alertTemp: true, alertHum: false,
    alertWater: true, alertDevice: true, alertHarvest: true,
    channelApp: true, channelEmail: true, channelSMS: false,
    quietStart: "22:00", quietEnd: "06:00",
    thresholdPH: "0.3", thresholdTemp: "3", thresholdEC: "0.2",
    digest: "daily",
  });
  const toggle = (k: string) => setSettings(s => ({ ...s, [k]: !s[k as keyof typeof s] }));
  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  const SwitchRow = ({ label, desc, k }: { label: string; desc: string; k: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
      </div>
      <Toggle on={settings[k as keyof typeof settings] as boolean} onChange={() => toggle(k)} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      {/* Alert types */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
            <Bell size={18} style={{ color: "#2E7D32" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Loại cảnh báo</h3>
            <p className="text-xs text-gray-400">Chọn các sự kiện bạn muốn được thông báo</p>
          </div>
        </div>
        <SwitchRow label="Cảnh báo pH" desc="Khi pH vượt ngưỡng trên hoặc dưới giới hạn" k="alertPH" />
        <SwitchRow label="Cảnh báo EC" desc="Khi nồng độ dinh dưỡng lệch khỏi mức cài đặt" k="alertEC" />
        <SwitchRow label="Cảnh báo nhiệt độ" desc="Khi nhiệt độ vượt ngưỡng an toàn cho cây" k="alertTemp" />
        <SwitchRow label="Cảnh báo độ ẩm" desc="Khi độ ẩm không khí thấp hoặc cao bất thường" k="alertHum" />
        <SwitchRow label="Cảnh báo mực nước" desc="Khi mức nước trong bể xuống dưới 40%" k="alertWater" />
        <SwitchRow label="Sự cố thiết bị" desc="Khi thiết bị offline hoặc hoạt động bất thường" k="alertDevice" />
        <SwitchRow label="Nhắc nhở thu hoạch" desc="Thông báo trước 3 ngày khi đến ngày thu hoạch dự kiến" k="alertHarvest" />
      </div>

      {/* Channels */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
            <Mail size={18} style={{ color: "#2563EB" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Kênh thông báo</h3>
            <p className="text-xs text-gray-400">Nơi bạn muốn nhận thông báo</p>
          </div>
        </div>
        <SwitchRow label="Thông báo trong ứng dụng" desc="Hiện badge và popup ngay trong hệ thống" k="channelApp" />
        <SwitchRow label="Email" desc={`Gửi đến: quan.hmq@greenargric.edu.vn`} k="channelEmail" />
        <SwitchRow label="SMS" desc="Tin nhắn đến số điện thoại đã đăng ký" k="channelSMS" />
      </div>

      {/* Thresholds */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
            <Sliders size={18} style={{ color: "#D97706" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Ngưỡng nhạy cảm</h3>
            <p className="text-xs text-gray-400">Độ lệch tối thiểu để kích hoạt cảnh báo</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ngưỡng pH (±)", k: "thresholdPH", unit: "pH", hint: "Ví dụ: 0.3" },
            { label: "Ngưỡng nhiệt độ (±)", k: "thresholdTemp", unit: "°C", hint: "Ví dụ: 3" },
            { label: "Ngưỡng EC (±)", k: "thresholdEC", unit: "mS/cm", hint: "Ví dụ: 0.2" },
          ].map(({ label, k, unit, hint }) => (
            <div key={k}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-50 transition-all">
                <input type="number" step="0.1" value={settings[k as keyof typeof settings] as string}
                  onChange={e => set(k, e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent w-full" placeholder={hint} />
                <span className="text-xs text-gray-400 flex-shrink-0">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet hours + digest */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F5F3FF" }}>
            <Clock size={18} style={{ color: "#7C3AED" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Giờ im lặng & Tóm tắt</h3>
            <p className="text-xs text-gray-400">Không gửi thông báo trong khung giờ nghỉ</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[{ label: "Bắt đầu im lặng", k: "quietStart" }, { label: "Kết thúc im lặng", k: "quietEnd" }].map(({ label, k }) => (
            <div key={k}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input type="time" value={settings[k as keyof typeof settings] as string}
                onChange={e => set(k, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-all" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Báo cáo tóm tắt</label>
          <div className="flex gap-3">
            {[{ v: "none", l: "Không gửi" }, { v: "daily", l: "Hàng ngày" }, { v: "weekly", l: "Hàng tuần" }].map(({ v, l }) => (
              <button key={v} onClick={() => set("digest", v)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                style={settings.digest === v
                  ? { background: "#E8F5E9", color: "#2E7D32", borderColor: "#2E7D32" }
                  : { background: "#F9FAFB", color: "#9CA3AF", borderColor: "transparent" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
        style={{ background: "linear-gradient(135deg,#2E7D32,#388E3C)" }}>
        Lưu cài đặt thông báo
      </button>
    </div>
  );
}

// ── Screen: Owner Profile ──────────────────────────────────────────────────

function OwnerProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Huỳnh Minh Quân", email: "quan.hmq@greenargric.edu.vn",
    phone: "0901 234 567", dept: "Khoa Nông học",
    garden: "Vườn thủy canh số 2 — Tòa B", bio: "Chuyên nghiên cứu canh tác thủy canh NFT và DWC. Quản lý 6 khu vực trồng với tổng diện tích 112 m².",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none transition-all ${editing ? "border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white" : "border-transparent bg-gray-50 cursor-default"}`;

  const stats = [
    { label: "Khu vực quản lý", value: "6" },
    { label: "Tổng diện tích", value: "112 m²" },
    { label: "Lứa đã thu hoạch", value: "14" },
    { label: "Ngày tham gia", value: "01/03/2025" },
  ];

  const activityLog = [
    { action: "Bật máy bơm dinh dưỡng A", time: "10:32 · 29/06/2026" },
    { action: "Điều chỉnh pH tự động Khu A", time: "07:45 · 29/06/2026" },
    { action: "Xem báo cáo tuần Khu B-C", time: "16:20 · 28/06/2026" },
    { action: "Đăng nhập hệ thống", time: "08:30 · 28/06/2026" },
    { action: "Tắt đèn LED Khu D theo lịch", time: "22:00 · 27/06/2026" },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Avatar + stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#43A047,#1B5E20)" }}>Q</div>
          <div className="flex-1">
            <div className="text-xl font-extrabold text-gray-800">{form.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Chủ vườn</span>
              <span className="text-xs text-gray-400">{form.dept}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{form.garden}</div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={editing
              ? { background: "#E8F5E9", color: "#2E7D32" }
              : { background: "#F3F4F6", color: "#6B7280" }}>
            <Edit2 size={13} /> {editing ? "Đang chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: "#F7FAF7" }}>
              <div className="text-lg font-extrabold text-gray-800">{value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Họ và tên</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} readOnly={!editing} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số điện thoại</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} readOnly={!editing} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} readOnly={!editing} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Khoa / Bộ môn</label>
              <input value={form.dept} onChange={e => set("dept", e.target.value)} readOnly={!editing} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Vị trí vườn</label>
            <input value={form.garden} onChange={e => set("garden", e.target.value)} readOnly={!editing} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Giới thiệu</label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)} readOnly={!editing} rows={2}
              className={`${inputCls} resize-none`} />
          </div>
          {editing && (
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                Hủy
              </button>
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#2E7D32,#388E3C)" }}>
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
            <Lock size={18} style={{ color: "#D97706" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h3>
            <p className="text-xs text-gray-400">Nên đổi định kỳ mỗi 3 tháng để bảo mật tài khoản</p>
          </div>
        </div>
        <div className="space-y-3">
          {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-50 transition-all">
                <Lock size={14} className="text-gray-400 flex-shrink-0" />
                <input type="password" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}>
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-2.5">
          {activityLog.map(({ action, time }) => (
            <div key={action} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                  <Activity size={13} style={{ color: "#2E7D32" }} />
                </div>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen: Owner Yield Stats ─────────────────────────────────────────────

function OwnerYieldScreen() {
  const cropData = [
    { zone: "Khu A", crop: "Cải bó xôi", planted: "01/04/2026", harvest: "01/06/2026", kg: 18.4, target: 20, status: "done" },
    { zone: "Khu B", crop: "Xà lách Butter", planted: "15/04/2026", harvest: "15/06/2026", kg: 12.1, target: 15, status: "done" },
    { zone: "Khu C", crop: "Rau muống nước", planted: "01/05/2026", harvest: "15/07/2026", kg: null, target: 22, status: "growing" },
    { zone: "Khu D", crop: "Húng quế", planted: "10/05/2026", harvest: "20/07/2026", kg: null, target: 8, status: "growing" },
    { zone: "Khu E", crop: "Cải xanh", planted: "20/05/2026", harvest: "01/08/2026", kg: null, target: 25, status: "growing" },
    { zone: "Khu F", crop: "Xà lách lô lô đỏ", planted: "25/05/2026", harvest: "10/08/2026", kg: null, target: 14, status: "growing" },
  ];

  const monthlyKg = [
    { month: "T1", kg: 0 }, { month: "T2", kg: 0 }, { month: "T3", kg: 8.2 },
    { month: "T4", kg: 14.6 }, { month: "T5", kg: 22.1 }, { month: "T6", kg: 30.5 },
    { month: "T7", kg: 12.0 }, { month: "T8", kg: 0 },
  ];

  const totalHarvested = cropData.filter(c => c.status === "done").reduce((s, c) => s + (c.kg ?? 0), 0);
  const totalTarget = cropData.reduce((s, c) => s + c.target, 0);
  const avgRate = Math.round((totalHarvested / cropData.filter(c => c.status === "done").reduce((s, c) => s + c.target, 0)) * 100);

  const summaryCards = [
    { label: "Tổng thu hoạch", value: `${totalHarvested.toFixed(1)} kg`, sub: "2 lứa hoàn thành", color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Mục tiêu tổng", value: `${totalTarget} kg`, sub: "6 khu vực · 6 lứa", color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "Tỷ lệ đạt mục tiêu", value: `${avgRate}%`, sub: "Lứa đã thu hoạch", color: "#D97706", bg: "#FEF3C7" },
    { label: "Đang tăng trưởng", value: "4 lứa", sub: "Thu hoạch dự kiến T7–T8", color: "#7C3AED", bg: "#F5F3FF" },
  ];

  const maxKg = Math.max(...monthlyKg.map(d => d.kg));

  return (
    <div className="max-w-3xl space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <BarChart2 size={16} style={{ color }} />
            </div>
            <div className="text-xl font-extrabold text-gray-800">{value}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Sản lượng theo tháng</h3>
            <p className="text-xs text-gray-400 mt-0.5">Năm 2026 — toàn bộ khu vực</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#2E7D32" }} />
            <span className="text-xs text-gray-500">kg thu hoạch</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyKg.map(({ month, kg }) => {
            const pct = maxKg > 0 ? (kg / maxKg) * 100 : 0;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                {kg > 0 && <span className="text-[10px] font-semibold text-gray-500">{kg}</span>}
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${Math.max(pct, kg > 0 ? 8 : 0)}%`,
                  background: kg > 0 ? "linear-gradient(180deg,#43A047,#2E7D32)" : "#F3F4F6",
                  minHeight: kg > 0 ? 6 : 0,
                }} />
                <span className="text-[11px] text-gray-400">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crop table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-800">Chi tiết từng lứa trồng</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {["Khu vực", "Loại cây", "Ngày trồng", "Thu hoạch DK", "Đạt / Mục tiêu", "Tỷ lệ", "Trạng thái"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cropData.map(({ zone, crop, planted, harvest, kg, target, status }) => {
              const rate = kg != null ? Math.round((kg / target) * 100) : null;
              return (
                <tr key={zone} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>{zone}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{crop}</td>
                  <td className="px-5 py-3.5 text-gray-500">{planted}</td>
                  <td className="px-5 py-3.5 text-gray-500">{harvest}</td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {kg != null ? <span className="font-semibold">{kg} kg</span> : <span className="text-gray-400">—</span>}
                    <span className="text-gray-400"> / {target} kg</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {rate != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: rate >= 90 ? "#2E7D32" : rate >= 70 ? "#D97706" : "#EF4444" }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{rate}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Đang trồng</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {status === "done"
                      ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Đã thu hoạch</span>
                      : <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>Đang tăng trưởng</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Crop recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Gợi ý lứa trồng tiếp theo</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { crop: "Cải bó xôi", cycle: "60 ngày", rate: "92%", note: "Khu A · Lứa 3 dự kiến T9/2026" },
            { crop: "Xà lách Butter", cycle: "60 ngày", rate: "81%", note: "Khu B · Lứa 3 dự kiến T9/2026" },
            { crop: "Tía tô", cycle: "45 ngày", rate: "—", note: "Khu mới — lần đầu trồng thử" },
          ].map(({ crop, cycle, rate, note }) => (
            <div key={crop} className="p-4 rounded-xl border border-gray-100 hover:border-green-200 transition-all">
              <div className="text-sm font-bold text-gray-700">{crop}</div>
              <div className="text-xs text-gray-400 mt-1">Chu kỳ: {cycle} · Đạt: {rate}</div>
              <div className="text-[11px] text-gray-400 mt-2 leading-relaxed">{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared: Role Profile Base ──────────────────────────────────────────────

type ProfileData = {
  initial: string; name: string; email: string; phone: string; dept: string;
  role: string; roleColor: string; roleBg: string; accentColor: string;
  location: string; bio: string; stats: { label: string; value: string }[];
  activityLog: { action: string; time: string }[];
};

function RoleProfileScreen({ data }: { data: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: data.name, email: data.email, phone: data.phone, dept: data.dept, location: data.location, bio: data.bio });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none transition-all ${editing ? "border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white" : "border-transparent bg-gray-50 cursor-default"}`;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${data.accentColor}CC,${data.accentColor})` }}>{data.initial}</div>
          <div className="flex-1">
            <div className="text-xl font-extrabold text-gray-800">{form.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: data.roleBg, color: data.roleColor }}>{data.role}</span>
              <span className="text-xs text-gray-400">{form.dept}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{form.location}</div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={editing ? { background: "#E8F5E9", color: "#2E7D32" } : { background: "#F3F4F6", color: "#6B7280" }}>
            <Edit2 size={13} />{editing ? "Đang chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {data.stats.map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: "#F7FAF7" }}>
              <div className="text-lg font-extrabold text-gray-800">{value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Họ và tên</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} readOnly={!editing} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số điện thoại</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} readOnly={!editing} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} readOnly={!editing} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Khoa / Bộ môn</label>
              <input value={form.dept} onChange={e => set("dept", e.target.value)} readOnly={!editing} className={inputCls} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Vị trí / Phòng ban</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} readOnly={!editing} className={inputCls} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Giới thiệu</label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)} readOnly={!editing} rows={2}
              className={`${inputCls} resize-none`} /></div>
          {editing && (
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Hủy</button>
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#2E7D32,#388E3C)" }}>Lưu thay đổi</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
            <Lock size={18} style={{ color: "#D97706" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h3>
            <p className="text-xs text-gray-400">Nên đổi định kỳ mỗi 3 tháng để bảo mật tài khoản</p>
          </div>
        </div>
        <div className="space-y-3">
          {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-50 transition-all">
                <Lock size={14} className="text-gray-400 flex-shrink-0" />
                <input type="password" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}>Cập nhật mật khẩu</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-2.5">
          {data.activityLog.map(({ action, time }) => (
            <div key={action} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                  <Activity size={13} style={{ color: "#2E7D32" }} />
                </div>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminProfileScreen() {
  return <RoleProfileScreen data={{
    initial: "N", name: "Phạm Phước Nguyên", email: "nguyen.ppn@greenargric.edu.vn",
    phone: "0912 345 678", dept: "Khoa CNTT", role: "Quản trị viên",
    roleColor: "#B45309", roleBg: "#FEF3C7", accentColor: "#D97706",
    location: "Phòng Thí nghiệm IoT — Tòa A, Tầng 3",
    bio: "Quản trị hệ thống IoT thủy canh tại trường. Chịu trách nhiệm cấu hình ngưỡng, quản lý người dùng và báo cáo định kỳ cho Ban Giám hiệu.",
    stats: [
      { label: "Thiết bị quản lý", value: "24" },
      { label: "Người dùng hệ thống", value: "8" },
      { label: "Cảnh báo xử lý", value: "47" },
      { label: "Ngày tham gia", value: "15/01/2025" },
    ],
    activityLog: [
      { action: "Thêm người dùng Nguyễn Văn Đức", time: "14:22 · 29/06/2026" },
      { action: "Cập nhật ngưỡng pH Khu A-B", time: "09:15 · 29/06/2026" },
      { action: "Xuất báo cáo tháng 6/2026", time: "16:40 · 28/06/2026" },
      { action: "Phê duyệt công việc bảo trì KTV", time: "11:05 · 28/06/2026" },
      { action: "Kiểm tra log hệ thống", time: "08:00 · 27/06/2026" },
    ],
  }} />;
}

function TechProfileScreen() {
  return <RoleProfileScreen data={{
    initial: "K", name: "Trần Huỳnh Đăng Khoa", email: "khoa.thdk@greenargric.edu.vn",
    phone: "0978 901 234", dept: "Sinh viên K21", role: "Kỹ thuật viên",
    roleColor: "#1D4ED8", roleBg: "#EFF6FF", accentColor: "#2563EB",
    location: "Nhóm KTV · Khu vực A, B, C",
    bio: "Kỹ thuật viên phụ trách bảo trì và hiệu chỉnh cảm biến. Thực tập tốt nghiệp ngành Công nghệ thông tin, chuyên hướng IoT nhúng.",
    stats: [
      { label: "Công việc hoàn thành", value: "31" },
      { label: "Thiết bị đã hiệu chỉnh", value: "18" },
      { label: "Sự cố đã xử lý", value: "12" },
      { label: "Ngày tham gia", value: "01/02/2026" },
    ],
    activityLog: [
      { action: "Hiệu chỉnh pH sensor Khu C", time: "11:30 · 29/06/2026" },
      { action: "Vệ sinh bơm nước Khu A", time: "08:15 · 29/06/2026" },
      { action: "Ghi nhật ký sửa chữa van điện", time: "15:40 · 28/06/2026" },
      { action: "Kiểm tra EC sensor toàn hệ thống", time: "09:00 · 27/06/2026" },
      { action: "Cập nhật lịch bảo trì định kỳ", time: "14:20 · 26/06/2026" },
    ],
  }} />;
}

// ── Screen: Zone Detail ───────────────────────────────────────────────────

const ZONE_DETAIL_DATA: Record<number, {
  variety: string; startDate: string; harvestDate: string;
  growthStage: string; growthPct: number; notes: string;
  devices: { name: string; type: string; status: string }[];
  envHistory: { param: string; value: string; trend: "up" | "down" | "stable" }[];
}> = {
  1: {
    variety: "Rau muống nước (Ipomoea aquatica)", startDate: "15/05/2026", harvestDate: "30/06/2026",
    growthStage: "Thu hoạch", growthPct: 95,
    notes: "Lứa phát triển tốt, dự kiến thu hoạch đúng hạn. Cần giảm EC xuống 1.6 trong 3 ngày tới.",
    devices: [
      { name: "Máy bơm dinh dưỡng A", type: "pump", status: "on" },
      { name: "Hệ thống đèn LED A", type: "light", status: "on" },
      { name: "Cảm biến pH KA-01", type: "sensor", status: "ok" },
      { name: "Cảm biến EC KA-02", type: "sensor", status: "ok" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "25.8°C", trend: "stable" },
      { param: "Độ ẩm", value: "63%", trend: "down" },
      { param: "pH", value: "6.2", trend: "stable" },
      { param: "EC", value: "1.88 mS/cm", trend: "up" },
    ],
  },
  2: {
    variety: "Xà lách xanh (Lactuca sativa)", startDate: "01/06/2026", harvestDate: "15/07/2026",
    growthStage: "Phát triển lá", growthPct: 60,
    notes: "Tăng trưởng bình thường. Theo dõi nhiệt độ — dự báo nắng nóng cuối tuần.",
    devices: [
      { name: "Máy bơm tưới B", type: "pump", status: "off" },
      { name: "Hệ thống đèn LED B", type: "light", status: "on" },
      { name: "Cảm biến nhiệt độ KB-01", type: "sensor", status: "ok" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "24.7°C", trend: "up" },
      { param: "Độ ẩm", value: "67%", trend: "stable" },
      { param: "pH", value: "6.1", trend: "stable" },
      { param: "EC", value: "1.82 mS/cm", trend: "stable" },
    ],
  },
  3: {
    variety: "Cải bó xôi (Spinacia oleracea)", startDate: "20/05/2026", harvestDate: "04/07/2026",
    growthStage: "Ra lá thật", growthPct: 72,
    notes: "Mực nước bể thấp hơn tiêu chuẩn. Đã cảnh báo — cần bổ sung nước và dinh dưỡng.",
    devices: [
      { name: "Quạt thông gió C", type: "fan", status: "on" },
      { name: "Cảm biến EC KC-01", type: "sensor", status: "warning" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "26.3°C", trend: "up" },
      { param: "Độ ẩm", value: "62%", trend: "down" },
      { param: "pH", value: "6.3", trend: "up" },
      { param: "EC", value: "1.62 mS/cm", trend: "down" },
    ],
  },
  4: {
    variety: "Húng quế Thái (Ocimum basilicum)", startDate: "10/06/2026", harvestDate: "25/07/2026",
    growthStage: "Nảy chồi", growthPct: 35,
    notes: "Lứa mới, phát triển rất tốt. Ánh sáng và nhiệt độ ổn định.",
    devices: [
      { name: "Bơm oxy D", type: "pump", status: "on" },
      { name: "Cảm biến ánh sáng KD-01", type: "sensor", status: "warning" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "25.5°C", trend: "stable" },
      { param: "Độ ẩm", value: "64%", trend: "stable" },
      { param: "pH", value: "6.0", trend: "stable" },
      { param: "EC", value: "1.84 mS/cm", trend: "stable" },
    ],
  },
  5: {
    variety: "Cà chua bi (Solanum lycopersicum)", startDate: "01/05/2026", harvestDate: "15/07/2026",
    growthStage: "Ra hoa — Đậu quả", growthPct: 65,
    notes: "EC thấp bất thường — cần bổ sung dinh dưỡng khẩn. pH đang dần vượt ngưỡng trên.",
    devices: [
      { name: "Máy điều chỉnh pH", type: "dosing", status: "off" },
      { name: "Cảm biến pH KE-01", type: "sensor", status: "warning" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "27.2°C", trend: "up" },
      { param: "Độ ẩm", value: "59%", trend: "down" },
      { param: "pH", value: "6.8", trend: "up" },
      { param: "EC", value: "1.1 mS/cm", trend: "down" },
    ],
  },
  6: {
    variety: "Dưa leo Nhật (Cucumis sativus)", startDate: "05/06/2026", harvestDate: "20/07/2026",
    growthStage: "Leo giàn — Phát triển thân", growthPct: 50,
    notes: "Cần kiểm tra giàn leo và điều chỉnh khoảng cách chiếu sáng.",
    devices: [
      { name: "Quạt làm mát D", type: "fan", status: "off" },
      { name: "Cảm biến độ ẩm KF-01", type: "sensor", status: "ok" },
    ],
    envHistory: [
      { param: "Nhiệt độ", value: "26.5°C", trend: "stable" },
      { param: "Độ ẩm", value: "61%", trend: "stable" },
      { param: "pH", value: "6.2", trend: "stable" },
      { param: "EC", value: "1.89 mS/cm", trend: "up" },
    ],
  },
};

const GROWTH_STAGES = ["Gieo hạt", "Nảy mầm", "Ra lá thật", "Phát triển lá", "Ra hoa — Đậu quả", "Leo giàn — Phát triển thân", "Thu hoạch"];

function ZoneDetailScreen({ zoneId, onBack }: { zoneId: number; onBack: () => void }) {
  const zone = ZONES.find(z => z.id === zoneId) || ZONES[0];
  const detail = ZONE_DETAIL_DATA[zone.id] || ZONE_DETAIL_DATA[1];
  const stageIdx = GROWTH_STAGES.indexOf(detail.growthStage);
  const statusColor = { good: { bg: "#DCFCE7", color: "#166534", label: "Tốt" }, warning: { bg: "#FEF3C7", color: "#D97706", label: "Cần chú ý" }, danger: { bg: "#FEE2E2", color: "#DC2626", label: "Nguy hiểm" } }[zone.status] || { bg: "#F3F4F6", color: "#6B7280", label: "—" };
  const healthColor = zone.health >= 80 ? "#2E7D32" : zone.health >= 65 ? "#D97706" : "#EF4444";
  const deviceTypeIcon = { pump: Droplets, light: Sun, fan: Wind, sensor: Activity, dosing: Gauge };
  const trendIcon = { up: ArrowUp, down: ArrowDown, stable: ArrowRight };

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors font-medium">
          <ChevronRight size={16} className="rotate-180" /> Quay lại danh sách khu vực
        </button>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-gray-800">{zone.name}</h2>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: statusColor.bg, color: statusColor.color }}>{statusColor.label}</span>
            </div>
            <p className="text-gray-500 font-medium">{detail.variety}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold mb-0.5" style={{ color: healthColor }}>{zone.health}%</div>
            <div className="text-xs text-gray-400">Sức khỏe cây trồng</div>
          </div>
        </div>

        {/* Health bar */}
        <div className="h-2.5 bg-gray-100 rounded-full mb-6">
          <div className="h-full rounded-full transition-all" style={{ width: `${zone.health}%`, background: healthColor }} />
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Diện tích", value: zone.area, Icon: Map },
            { label: "Ngày bắt đầu", value: detail.startDate, Icon: Clock },
            { label: "Thu hoạch dự kiến", value: detail.harvestDate, Icon: CheckCircle },
            { label: "Cảm biến gắn kết", value: `${zone.sensors} cảm biến`, Icon: Activity },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: "#F7FAF7" }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className="text-green-600" />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <div className="text-sm font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Growth stage */}
        <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Giai đoạn sinh trưởng</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>{detail.growthStage}</span>
              <span className="text-sm font-bold text-gray-600">{detail.growthPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${detail.growthPct}%`, background: "linear-gradient(90deg,#43A047,#2E7D32)" }} />
            </div>
          </div>
          <div className="flex items-center gap-0 mb-5">
            {GROWTH_STAGES.map((stage, i) => (
              <div key={stage} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-center">
                  {i > 0 && <div className="flex-1 h-0.5" style={{ background: i <= stageIdx ? "#2E7D32" : "#E5E7EB" }} />}
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                    style={{ background: i < stageIdx ? "#2E7D32" : i === stageIdx ? "#43A047" : "#fff", borderColor: i <= stageIdx ? "#2E7D32" : "#E5E7EB" }} />
                  {i < GROWTH_STAGES.length - 1 && <div className="flex-1 h-0.5" style={{ background: i < stageIdx ? "#2E7D32" : "#E5E7EB" }} />}
                </div>
                <span className="text-[9px] text-center mt-1.5 leading-tight" style={{ color: i === stageIdx ? "#2E7D32" : "#9CA3AF", fontWeight: i === stageIdx ? 700 : 400 }}>
                  {stage.split("—")[0].trim()}
                </span>
              </div>
            ))}
          </div>

          {/* Env snapshot */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Chỉ số môi trường hiện tại</h4>
          <div className="grid grid-cols-2 gap-3">
            {detail.envHistory.map(({ param, value, trend }) => {
              const TrendIcon = trendIcon[trend];
              const trendColor = trend === "up" ? "#EF4444" : trend === "down" ? "#3B82F6" : "#6B7280";
              return (
                <div key={param} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500">{param}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                    <TrendIcon size={12} style={{ color: trendColor }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="mt-4 p-3 rounded-xl border border-yellow-100" style={{ background: "#FFFBEB" }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">{detail.notes}</p>
            </div>
          </div>
        </div>

        {/* Linked devices */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Thiết bị liên kết</h3>
          <div className="space-y-3">
            {detail.devices.map(({ name, type, status }) => {
              const Icon = deviceTypeIcon[type as keyof typeof deviceTypeIcon] || Zap;
              const sColor = status === "on" ? { bg: "#DCFCE7", color: "#166534", dot: "#22C55E", label: "Đang chạy" }
                : status === "off" ? { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF", label: "Tắt" }
                : status === "warning" ? { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B", label: "Cần chú ý" }
                : { bg: "#DCFCE7", color: "#166534", dot: "#22C55E", label: "Bình thường" };
              return (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                    <Icon size={16} style={{ color: "#2E7D32" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700 truncate">{name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: sColor.dot }} />
                      <span className="text-xs" style={{ color: sColor.color }}>{sColor.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dates timeline */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mốc thời gian lứa trồng</h4>
            <div className="space-y-2.5">
              {[
                { label: "Ngày bắt đầu", date: detail.startDate, done: true },
                { label: "Thu hoạch dự kiến", date: detail.harvestDate, done: false },
              ].map(({ label, date, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: done ? "#2E7D32" : "#D1D5DB" }} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-700">{date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Maintenance Form ───────────────────────────────────────────────

function MaintenanceFormScreen({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    zone: "", device: "", tech: "", date: "2026-07-05", type: "Bảo trì định kỳ", priority: "medium", interval: "30", notes: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const TECHS = ["Trần Huỳnh Đăng Khoa", "Nguyễn Thúy Ái", "Trần Thị Nhi", "Nguyễn Văn Đức"];
  const TYPES = ["Bảo trì định kỳ", "Thay linh kiện", "Hiệu chỉnh cảm biến", "Vệ sinh thiết bị", "Kiểm tra tổng quát", "Sửa chữa khẩn"];
  const DEVICES_BY_ZONE: Record<string, string[]> = {
    "Khu A": ["Máy bơm dinh dưỡng A", "Hệ thống đèn LED A", "Máy điều chỉnh pH", "Cảm biến pH KA-01"],
    "Khu B": ["Máy bơm tưới B", "Hệ thống đèn LED B", "Cảm biến nhiệt độ KB-01"],
    "Khu C": ["Quạt thông gió C", "Cảm biến EC KC-01"],
    "Khu D": ["Bơm oxy D", "Quạt làm mát D", "Cảm biến ánh sáng KD-01"],
    "Khu E": ["Máy điều chỉnh pH KE", "Cảm biến pH KE-01"],
    "Khu F": ["Quạt làm mát F", "Cảm biến độ ẩm KF-01"],
  };
  const prioOpts = [
    { v: "low", label: "Thấp", color: "#16A34A", bg: "#DCFCE7" },
    { v: "medium", label: "Trung bình", color: "#D97706", bg: "#FEF3C7" },
    { v: "high", label: "Khẩn cấp", color: "#DC2626", bg: "#FEE2E2" },
  ];

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium">
        <ChevronRight size={16} className="rotate-180" /> Quay lại bảo trì
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
          <h2 className="text-base font-bold text-white">Tạo công việc bảo trì mới</h2>
          <p className="text-blue-200 text-xs mt-0.5">Điền đầy đủ thông tin để lên lịch bảo trì thiết bị</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Zone + Device */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Khu vực <span className="text-red-500">*</span></label>
              <select value={form.zone} onChange={e => { set("zone", e.target.value); set("device", ""); }} className={inputCls}>
                <option value="">— Chọn khu vực —</option>
                {ZONES.map(z => <option key={z.id} value={z.name}>{z.name} — {z.crop}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Thiết bị <span className="text-red-500">*</span></label>
              <select value={form.device} onChange={e => set("device", e.target.value)} className={inputCls} disabled={!form.zone}>
                <option value="">— Chọn thiết bị —</option>
                {(DEVICES_BY_ZONE[form.zone] || []).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Type + Tech */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Loại bảo trì <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Kỹ thuật viên <span className="text-red-500">*</span></label>
              <select value={form.tech} onChange={e => set("tech", e.target.value)} className={inputCls}>
                <option value="">— Chọn KTV —</option>
                {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Interval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ngày thực hiện <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Chu kỳ lặp lại (ngày)</label>
              <input type="number" value={form.interval} onChange={e => set("interval", e.target.value)}
                min={1} max={365} className={inputCls} placeholder="Để trống nếu không lặp" />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className={labelCls}>Mức ưu tiên <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {prioOpts.map(({ v, label, color, bg }) => (
                <button key={v} onClick={() => set("priority", v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={form.priority === v
                    ? { background: bg, color, borderColor: color }
                    : { background: "#F9FAFB", color: "#9CA3AF", borderColor: "transparent" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Ghi chú / Mô tả công việc</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={3} className={`${inputCls} resize-none`}
              placeholder="Mô tả chi tiết công việc cần thực hiện, vật tư cần chuẩn bị..." />
          </div>

          {/* Preview */}
          {form.zone && form.device && form.tech && (
            <div className="p-4 rounded-xl border border-blue-100" style={{ background: "#EFF6FF" }}>
              <p className="text-xs font-bold text-blue-700 mb-1">Xem trước lịch bảo trì</p>
              <p className="text-xs text-blue-600">
                <span className="font-semibold">{form.device}</span> tại {form.zone} —
                {" "}{form.type} · {form.date.split("-").reverse().join("/")} ·
                {" "}KTV: {form.tech} ·
                {" "}Ưu tiên: {prioOpts.find(p => p.v === form.priority)?.label}
                {form.interval && ` · Lặp mỗi ${form.interval} ngày`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onBack}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              Hủy
            </button>
            <button
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: form.zone && form.device && form.tech ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "#D1D5DB" }}
              disabled={!form.zone || !form.device || !form.tech}>
              Lưu lịch bảo trì
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Logo SVG Component ────────────────────────────────────────────────────

function GreenGardenLogo({ variant = "light", size = "md" }: {
  variant?: "light" | "dark" | "mono-dark" | "mono-light";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const uid = React.useId().replace(/:/g, "");
  const scales = { sm: 0.5, md: 1, lg: 1.5, xl: 2.2 };
  const sc = scales[size];
  const W = 370 * sc, H = 72 * sc;
  const iconSize = 52 * sc;
  const isOnDark = variant === "dark" || variant === "mono-light";
  const wordmarkColor = isOnDark ? "#ffffff" : "#1B5E20";
  const taglineColor = isOnDark ? "rgba(255,255,255,0.65)" : "#6B7280";
  const iconBg = variant === "mono-dark" ? "#1B5E20" : variant === "mono-light" ? "rgba(255,255,255,0.2)" : `url(#${uid}ig)`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}ig`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id={`${uid}lg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Icon mark */}
      <rect x={0} y={(H - iconSize) / 2} width={iconSize} height={iconSize} rx={12 * sc} fill={iconBg} />

      {/* Leaf shape inside icon */}
      <g transform={`translate(${iconSize * 0.5}, ${H / 2})`}>
        {/* Main leaf */}
        <path
          d={`M${-10 * sc},${8 * sc} C${-10 * sc},${-14 * sc} ${10 * sc},${-18 * sc} ${10 * sc},${-18 * sc} C${10 * sc},${-18 * sc} ${14 * sc},${-2 * sc} ${6 * sc},${8 * sc} C${2 * sc},${14 * sc} ${-10 * sc},${14 * sc} ${-10 * sc},${8 * sc} Z`}
          fill={`url(#${uid}lg)`} opacity={0.95}
        />
        {/* Leaf vein */}
        <path
          d={`M${-2 * sc},${10 * sc} C${-1 * sc},${-2 * sc} ${6 * sc},${-10 * sc} ${8 * sc},${-16 * sc}`}
          fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2 * sc} strokeLinecap="round"
        />
        {/* Water drop */}
        <ellipse cx={0} cy={14 * sc} rx={3.5 * sc} ry={4 * sc} fill="rgba(255,255,255,0.8)" />
        {/* IoT dots */}
        <circle cx={12 * sc} cy={-10 * sc} r={1.5 * sc} fill="rgba(255,255,255,0.7)" />
        <circle cx={14 * sc} cy={-5 * sc} r={1 * sc} fill="rgba(255,255,255,0.5)" />
        <circle cx={13 * sc} cy={0 * sc} r={0.8 * sc} fill="rgba(255,255,255,0.3)" />
      </g>

      {/* Wordmark */}
      <text
        x={iconSize + 12 * sc}
        y={H / 2 - 4 * sc}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={18 * sc}
        fontWeight="800"
        letterSpacing={0.5 * sc}
        fill={wordmarkColor}
      >
        GREEN ARGRIC
      </text>
      <text
        x={iconSize + 12 * sc}
        y={H / 2 + 14 * sc}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={9 * sc}
        fontWeight="500"
        letterSpacing={0.3 * sc}
        fill={taglineColor}
      >
        Hệ thống giám sát vườn thủy canh thông minh
      </text>
    </svg>
  );
}

function GGIconMark({ bg = "gradient", size = 64 }: { bg?: "gradient" | "white" | "dark"; size?: number }) {
  const uid = React.useId().replace(/:/g, "");
  const iconBg = bg === "gradient" ? `url(#${uid}ig)` : bg === "white" ? "#ffffff" : "#1B5E20";
  const leafFill = `url(#${uid}lg)`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}ig`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id={`${uid}lg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8E6C9" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width={52} height={52} rx={12} fill={iconBg} />
      <g transform="translate(26, 26)">
        <path
          d="M-10,8 C-10,-14 10,-18 10,-18 C10,-18 14,-2 6,8 C2,14 -10,14 -10,8 Z"
          fill={bg === "white" ? "#2E7D32" : leafFill} opacity={0.95}
        />
        <path
          d="M-2,10 C-1,-2 6,-10 8,-16"
          fill="none" stroke={bg === "white" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)"} strokeWidth={1.4} strokeLinecap="round"
        />
        <ellipse cx={0} cy={14} rx={3.5} ry={4} fill={bg === "white" ? "#43A047" : "rgba(255,255,255,0.8)"} />
        <circle cx={12} cy={-10} r={1.5} fill={bg === "white" ? "#43A047" : "rgba(255,255,255,0.7)"} />
        <circle cx={14} cy={-5} r={1} fill={bg === "white" ? "#66BB6A" : "rgba(255,255,255,0.5)"} />
        <circle cx={13} cy={0} r={0.8} fill={bg === "white" ? "#81C784" : "rgba(255,255,255,0.3)"} />
      </g>
    </svg>
  );
}

function LogoScreen() {
  const PALETTE = [
    { name: "Xanh chính", hex: "#2E7D32", desc: "Primary — nút CTA, icon active" },
    { name: "Xanh đậm", hex: "#1B5E20", desc: "Dark — sidebar, nền icon" },
    { name: "Xanh nhạt", hex: "#43A047", desc: "Accent — gradient, highlight" },
    { name: "Xanh lá nhạt", hex: "#A5D6A7", desc: "Soft — hover, badge BG" },
    { name: "Nền trắng xanh", hex: "#F7FAF7", desc: "Background — toàn trang" },
    { name: "Cảnh báo đỏ", hex: "#EF4444", desc: "Danger — alert, badge" },
  ];

  return (
    <div className="space-y-8">
      {/* Section 1 — Logo chính */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Logo chính — Horizontal</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Light */}
          <div className="rounded-xl border border-gray-100 p-8 flex flex-col items-center gap-3">
            <GreenGardenLogo variant="light" size="md" />
            <span className="text-xs text-gray-400 mt-2">Trên nền sáng · Dùng chính</span>
          </div>
          {/* Dark */}
          <div className="rounded-xl p-8 flex flex-col items-center gap-3" style={{ background: "#1B5E20" }}>
            <GreenGardenLogo variant="dark" size="md" />
            <span className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>Trên nền tối · Sidebar, header tối</span>
          </div>
        </div>
      </section>

      {/* Section 2 — Kích thước */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Thang kích thước</h2>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-gray-400 font-mono">XL · 2.2×</div>
            <GreenGardenLogo variant="light" size="xl" />
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-gray-400 font-mono">LG · 1.5×</div>
            <GreenGardenLogo variant="light" size="lg" />
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-gray-400 font-mono">MD · 1.0×</div>
            <GreenGardenLogo variant="light" size="md" />
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-gray-400 font-mono">SM · 0.5×</div>
            <GreenGardenLogo variant="light" size="sm" />
          </div>
        </div>
      </section>

      {/* Section 3 — Icon mark */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Icon mark — Dùng độc lập</h2>
        <div className="flex flex-wrap gap-8 items-end">
          <div className="flex flex-col items-center gap-3">
            <GGIconMark bg="gradient" size={96} />
            <span className="text-xs text-gray-400">Gradient · 96px</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GGIconMark bg="gradient" size={64} />
            <span className="text-xs text-gray-400">Gradient · 64px</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GGIconMark bg="gradient" size={48} />
            <span className="text-xs text-gray-400">Gradient · 48px</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GGIconMark bg="gradient" size={32} />
            <span className="text-xs text-gray-400">Gradient · 32px</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: "#1B5E20" }}>
              <GGIconMark bg="dark" size={48} />
            </div>
            <span className="text-xs text-gray-400">Tối · 48px</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl border border-gray-100">
              <GGIconMark bg="white" size={48} />
            </div>
            <span className="text-xs text-gray-400">Trắng · 48px</span>
          </div>
        </div>
      </section>

      {/* Section 4 — Bảng màu */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Bảng màu hệ thống</h2>
        <div className="grid grid-cols-3 gap-4">
          {PALETTE.map(({ name, hex, desc }) => (
            <div key={hex} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm" style={{ background: hex }} />
              <div>
                <div className="text-sm font-semibold text-gray-800">{name}</div>
                <div className="text-xs font-mono text-gray-500 mt-0.5">{hex}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5 — Typography */}
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Typography — Inter</h2>
        <div className="space-y-5">
          {[
            { label: "Display / 800", cls: "text-4xl font-extrabold", text: "GREEN ARGRIC" },
            { label: "Heading / 700", cls: "text-2xl font-bold", text: "Hệ thống giám sát thủy canh thông minh" },
            { label: "Subheading / 600", cls: "text-lg font-semibold", text: "Chỉ số môi trường hiện tại" },
            { label: "Body / 500", cls: "text-base font-medium", text: "Nhiệt độ không khí đang ở mức tối ưu cho cây trồng." },
            { label: "Caption / 400", cls: "text-xs font-normal text-gray-500", text: "Cập nhật: 29/06/2026 · 10:45:22 · Khu A" },
          ].map(({ label, cls, text }) => (
            <div key={label} className="flex items-baseline gap-6 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="w-36 text-xs text-gray-400 font-mono flex-shrink-0">{label}</div>
              <div className={`text-gray-800 ${cls}`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6 — Usage on card */}
      <section className="rounded-2xl p-8 shadow-sm" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #43A047 100%)" }}>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Ứng dụng thực tế — Login / Banner</h2>
        <div className="flex items-center justify-between">
          <GreenGardenLogo variant="dark" size="lg" />
          <div className="text-right">
            <div className="text-white text-opacity-70 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Phiên bản 2.4.1</div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>© 2026 Green Argric Lab</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MessagesScreen() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const headers = () => ({ "content-type": "application/json", authorization: `Bearer ${localStorage.getItem("greenArgricToken")}` });
  const [mode, setMode] = useState<"people" | "ai">("people"), [contacts, setContacts] = useState<any[]>([]), [selected, setSelected] = useState<any>(null), [items, setItems] = useState<any[]>([]), [text, setText] = useState(""), [loading, setLoading] = useState(false);
  let myId = 0; try { const payload = (localStorage.getItem("greenArgricToken") || "..").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"); myId = Number(JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")))?.id || 0); } catch { myId = 0; }
  const loadConversation = async (contact: any) => { setSelected(contact); const response = await fetch(`${apiUrl}/message/conversation/${contact.id}`, { headers: headers() }); if (response.ok) setItems(await response.json()); };
  useEffect(() => { fetch(`${apiUrl}/message/contacts`, { headers: headers() }).then(r => r.ok ? r.json() : []).then(rows => { setContacts(rows); if (rows[0]) void loadConversation(rows[0]); }); }, []);
  useEffect(() => { if (mode !== "people" || !selected) return; const timer = window.setInterval(() => void loadConversation(selected), 3000); return () => window.clearInterval(timer); }, [mode, selected?.id]);
  const changeMode = (next: "people" | "ai") => { setMode(next); if (next === "ai") setItems([{ sender_id: -1, content: "Xin chào! Bạn có thể hỏi tự do về vận hành vườn, cảnh báo, thiết bị hoặc xử lý sự cố.", created_at: new Date().toISOString() }]); else if (selected) void loadConversation(selected); };
  const send = async () => { const content = text.trim(); if (!content || loading) return; setText(""); setLoading(true);
    if (mode === "ai") { setItems(rows => [...rows, { sender_id: myId, content, created_at: new Date().toISOString() }]); const history = items.slice(-10).map(item => ({ role: item.sender_id === myId ? "user" : "assistant", content: item.content })); const response = await fetch(`${apiUrl}/ai/chat`, { method: "POST", headers: headers(), body: JSON.stringify({ message: content, history }) }); const result = await response.json(); const errorText = result.code === "AI_NOT_CONFIGURED" ? `${result.message}. Hãy cấu hình OPENAI_API_KEY trong backend/.env.` : result.message || "Dịch vụ AI hiện không phản hồi."; setItems(rows => [...rows, { sender_id: -1, content: response.ok ? result.reply : errorText, created_at: new Date().toISOString() }]); }
    else if (selected) { const response = await fetch(`${apiUrl}/message`, { method: "POST", headers: headers(), body: JSON.stringify({ receiver_id: selected.id, content }) }); const result = await response.json(); if (response.ok) setItems(rows => [...rows, result]); else window.alert(result.message); }
    setLoading(false); };
  return <div className="grid grid-cols-[300px_1fr] bg-white rounded-2xl shadow-sm overflow-hidden min-h-[680px]"><aside className="border-r border-gray-100"><div className="p-4 grid grid-cols-2 gap-2 border-b"><button onClick={() => changeMode("people")} className={`py-2 rounded-xl text-xs font-bold ${mode === "people" ? "bg-green-700 text-white" : "bg-gray-50 text-gray-500"}`}>Mọi người</button><button onClick={() => changeMode("ai")} className={`py-2 rounded-xl text-xs font-bold ${mode === "ai" ? "bg-green-700 text-white" : "bg-gray-50 text-gray-500"}`}>Trợ lý AI</button></div>{mode === "people" ? <div className="p-2 space-y-1">{contacts.map(contact => <button key={contact.id} onClick={() => void loadConversation(contact)} className={`w-full text-left p-3 rounded-xl ${selected?.id === contact.id ? "bg-green-50" : "hover:bg-gray-50"}`}><div className="text-sm font-semibold text-gray-800">{contact.full_name}</div><div className="text-xs text-gray-400">{contact.role === "owner" ? "Chủ vườn" : contact.role === "admin" ? "Quản trị viên" : "Kỹ thuật viên"}</div></button>)}</div> : <div className="p-5 text-sm text-gray-500"><Bot size={28} className="text-green-700 mb-3"/><b className="block text-gray-800 mb-1">AI GREEN ARGRIC</b>Hội thoại tự do dựa trên dữ liệu vườn.</div>}</aside><section className="flex flex-col min-w-0"><div className="h-16 px-5 border-b flex items-center justify-between"><div><div className="font-bold text-gray-800">{mode === "ai" ? "Trợ lý AI" : selected?.full_name || "Chọn người nhận"}</div><div className="text-xs text-green-600">{mode === "ai" ? "Trợ lý thông minh GREEN ARGRIC" : "Nhắn tin hai chiều · tự cập nhật mỗi 3 giây"}</div></div>{mode === "people" && selected && <button onClick={() => void loadConversation(selected)} className="text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 font-semibold">Làm mới</button>}</div><div className="flex-1 overflow-auto p-5 space-y-3 bg-gray-50/50">{items.map((item, index) => <div key={item.message_id || index} className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${item.sender_id === myId ? "ml-auto bg-green-700 text-white" : "bg-white border text-gray-700"}`}>{item.content}</div>)}</div><div className="p-4 border-t flex gap-3"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && void send()} className="flex-1 border rounded-xl px-4 outline-none focus:border-green-500" placeholder="Nhập tin nhắn..."/><button onClick={() => void send()} disabled={loading} className="px-5 rounded-xl bg-green-700 text-white font-semibold flex items-center gap-2"><Send size={16}/>{loading ? "Đang gửi" : "Gửi"}</button></div></section></div>;
}

function HelpScreen({ role, onNavigate }: { role: Role; onNavigate: (screen: Screen) => void }) {
  const items = role === "admin" ? ["Quản lý tài khoản và phân quyền", "Thêm và cấu hình thiết bị", "Theo dõi trạng thái hệ thống"] : role === "tech" ? ["Nhận và cập nhật công việc", "Ghi nhật ký sửa chữa", "Hiệu chỉnh cảm biến"] : ["Theo dõi môi trường", "Điều khiển thiết bị", "Xem năng suất và cảnh báo"];
  return <div className="grid grid-cols-3 gap-5"><div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm"><h2 className="text-xl font-bold">Hướng dẫn nhanh</h2><p className="text-sm text-gray-500 mt-1 mb-5">Nội dung quan trọng cho vai trò hiện tại.</p>{items.map((item,index) => <div key={item} className="flex gap-4 p-4 rounded-xl bg-gray-50 mb-3"><div className="w-8 h-8 rounded-full bg-green-700 text-white grid place-items-center font-bold">{index+1}</div><div><b>{item}</b><p className="text-sm text-gray-500 mt-1">Mở mục tương ứng trên thanh điều hướng và thực hiện theo các nút trên màn hình.</p></div></div>)}</div><div className="bg-green-800 rounded-2xl p-6 text-white"><HelpCircle size={32}/><h3 className="text-lg font-bold mt-4">Cần hỗ trợ?</h3><p className="text-sm text-green-100 mt-2">Dùng Trung tâm tin nhắn để liên hệ trực tiếp các vai trò khác.</p><button onClick={() => onNavigate("messages")} className="mt-5 w-full py-2.5 rounded-xl bg-white text-green-800 font-semibold text-sm">Mở trung tâm tin nhắn</button></div></div>;
}

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  // URL param support for Figma design capture: ?screen=X&role=Y
  const params = new URLSearchParams(window.location.search);
  const urlScreen = params.get("screen") as Screen | null;
  const urlRole = params.get("role") as Role | null;

  const [screen, setScreen] = useState<Screen>(
    urlScreen && urlRole ? urlScreen : "login"
  );
  const [role, setRole] = useState<Role | null>(
    urlScreen && urlRole ? urlRole : null
  );

  const handleLogin = async (r: Role, _username: string, password: string) => {
    const emailByRole: Record<Role, string> = { owner: "owner@greenargric.edu.vn", admin: "admin@greenargric.edu.vn", tech: "tech@greenargric.edu.vn" };
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: emailByRole[r], password }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Đăng nhập thất bại");
    localStorage.setItem("greenArgricToken", result.token);
    setRole(r); setScreen("dashboard");
  };
  const handleLogout = () => { localStorage.removeItem("greenArgricToken"); setRole(null); setScreen("login"); };
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const download = (filename: string, content: string, type = "text/csv;charset=utf-8") => {
      const blob = new Blob([type.includes("csv") ? "\uFEFF" + content : content], { type });
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
    };
    const makePdf = (title: string) => {
      const safe = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").replace(/[()\\]/g, "\\$&");
      const stream = `BT /F1 20 Tf 72 760 Td (${safe}) Tj /F1 11 Tf 0 -32 Td (GREEN ARGRIC - ${new Date().toLocaleDateString("vi-VN")}) Tj 0 -24 Td (Bao cao duoc xuat tu he thong quan ly vuon.) Tj ET`;
      const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      ];
      let pdf = "%PDF-1.4\n"; const offsets = [0];
      objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
      const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
      return pdf + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    };
    const handler = async (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button"); if (!button) return;
      const label = button.textContent?.trim() || "";
      if (button.dataset.localAction === "true") return;
      if (label === "Xuất" || label.includes("Xuất CSV") || label.includes("Xuất báo cáo")) {
        const rows = screen === "users" ? USERS_INIT.map((item) => [item.name,item.email,item.role,item.dept,item.status,item.lastLogin]) : screen === "alerts" ? ALERTS_INIT.map((item) => [item.date,item.time,item.zone,item.sensor,item.msg,item.resolved?"Đã xử lý":"Chưa xử lý"]) : screen === "devices" ? DEVICES_INIT.map((item) => [item.name,item.zone,item.type,item.on?"ON":"OFF",item.mode,item.watt]) : HOURLY.map((item) => [item.t,item.tmp,item.hum,item.ph,item.ec,item.lux]);
        const header = screen === "users" ? ["Người dùng","Email","Vai trò","Bộ phận","Trạng thái","Đăng nhập cuối"] : screen === "alerts" ? ["Ngày","Giờ","Khu vực","Cảm biến","Nội dung","Trạng thái"] : screen === "devices" ? ["Thiết bị","Khu vực","Loại","Trạng thái","Chế độ","Công suất"] : ["Thời gian","Nhiệt độ","Độ ẩm","pH","EC","Ánh sáng"];
        download(`green-argric-${screen}-${new Date().toISOString().slice(0,10)}.csv`, [header,...rows].map((row)=>row.map((cell)=>`"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n"));
      }
      if (label.includes("Xuất PDF")) {
        download(`green-argric-${screen}-${new Date().toISOString().slice(0,10)}.pdf`, makePdf(`Bao cao ${PAGE_TITLES[screen]}`), "application/pdf");
      }
      if (label.includes("Cập nhật mật khẩu")) {
        const card = button.closest(".bg-white"); const inputs = card?.querySelectorAll<HTMLInputElement>('input[type="password"]');
        if (!inputs || inputs.length < 3) return;
        if (inputs[1].value !== inputs[2].value) return window.alert("Xác nhận mật khẩu mới không khớp");
        const response = await fetch(`${apiUrl}/user/password`, { method:"PUT", headers:{"content-type":"application/json",authorization:`Bearer ${localStorage.getItem("greenArgricToken")}`}, body:JSON.stringify({current_password:inputs[0].value,new_password:inputs[1].value}) });
        const result = await response.json(); window.alert(result.message || (response.ok ? "Cập nhật thành công" : "Cập nhật thất bại")); if(response.ok) inputs.forEach((input)=>{input.value="";});
      }
      if (label.includes("Thêm thiết bị")) {
        const device_name = window.prompt("Tên thiết bị:"); if(!device_name) return;
        const device_code = window.prompt("Mã thiết bị:",`DEVICE-${Date.now().toString().slice(-5)}`); if(!device_code) return;
        const device_type = window.prompt("Loại thiết bị: circulation_pump, grow_light, fan hoặc dosing_pump","fan"); if(!device_type) return;
        const area_id = Number(window.prompt("ID khu vực:","1"));
        const response = await fetch(`${apiUrl}/device`, {method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${localStorage.getItem("greenArgricToken")}`},body:JSON.stringify({device_name,device_code,device_type,area_id,status:"OFF",mode:"MANUAL"})});
        const result = await response.json(); window.alert(response.ok ? "Đã thêm thiết bị thành công" : result.message || "Không thể thêm thiết bị");
      }
      if (label.includes("Lưu cài đặt thông báo")) {
        const values = Array.from(document.querySelectorAll<HTMLInputElement>('main input, main select')).map((input) => ({ name: input.name || input.type, value: input.value, checked: input.checked }));
        localStorage.setItem("greenArgricNotificationSettings", JSON.stringify(values)); window.alert("Đã lưu cài đặt thông báo");
      }
      if (screen === "profile" && label.includes("Lưu thay đổi")) window.alert("Đã lưu thay đổi hồ sơ");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [screen]);

  if (!role || screen === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F7FAF7]">
      <Sidebar active={screen} role={role} onNavigate={setScreen} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header screen={screen} role={role} onNavigate={setScreen} />
        <main className="flex-1 p-6">
          {screen === "dashboard"     && <DashboardScreen role={role} />}
          {screen === "environment"   && <EnvironmentScreen />}
          {screen === "devices"       && <DevicesScreen role={role} />}
          {screen === "history"       && <HistoryScreen />}
          {screen === "alerts"        && <AlertsScreen role={role} />}
          {screen === "thresholds"    && <ThresholdsScreen />}
          {screen === "zones"         && <ZonesScreen />}
          {screen === "tasks"         && <TasksScreen role={role} />}
          {screen === "users"         && <UsersScreen />}
          {screen === "notifications" && <OwnerNotificationsScreen />}
          {screen === "profile"       && (role === "admin" ? <AdminProfileScreen /> : role === "tech" ? <TechProfileScreen /> : <OwnerProfileScreen />)}
          {screen === "owner-yield"   && <OwnerYieldScreen />}
          {screen === "messages"      && <MessagesScreen />}
          {screen === "reports"       && <ReportsScreen />}
          {screen === "help"          && <HelpScreen role={role} onNavigate={setScreen} />}
          {screen === "logo"          && <LogoScreen />}
        </main>
      </div>
    </div>
  );
}
