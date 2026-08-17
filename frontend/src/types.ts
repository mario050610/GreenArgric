export type Role = 'admin' | 'owner' | 'technician';

export type User = {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  role: Role;
  status?: string;
};

export type Area = {
  area_id: number;
  area_name: string;
  location: string;
  crop_type: string;
  description: string;
  status: string;
};

export type Sensor = {
  sensor_id: number;
  area_id: number;
  sensor_code: string;
  sensor_type: string;
  unit: string;
  status: string;
  value: number | null;
  reading_time: string | null;
};

export type Device = {
  device_id: number;
  area_id: number;
  device_code: string;
  device_name: string;
  device_type: string;
  status: 'ON' | 'OFF';
  mode: 'AUTO' | 'MANUAL';
  area_name?: string;
  last_seen?: string | null;
  scheduled_off_at?: string | null;
};

export type Alert = {
  alert_id: number;
  area_id: number;
  area_name?: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  created_at: string;
};

export type Threshold = {
  threshold_id: number;
  area_id: number;
  sensor_type: string;
  min_value: number;
  max_value: number;
  warning_level: string;
  is_activated: boolean;
};

export type Task = {
  task_id: number;
  area_id: number;
  area_name?: string;
  assigned_to: number;
  assignee?: string;
  title: string;
  description: string;
  task_type: string;
  scheduled_at: string;
  status: string;
};
