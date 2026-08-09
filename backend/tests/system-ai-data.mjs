import assert from 'node:assert/strict';
import { answerSystemDataQuestion } from '../routes/ai.js';

const owner = { id: 2, role: 'owner' };
const technician = { id: 3, role: 'technician' };

const areas = answerSystemDataQuestion('Tình hình các khu vực trồng hôm nay như thế nào?', owner);
assert.match(areas, /Khu A/);
assert.match(areas, /Khu B/);
assert.match(areas, /Khu C/);
assert.match(areas, /Khu D/);
assert.match(areas, /Khu E/);
assert.match(areas, /Khu F/);
assert.doesNotMatch(areas, /chưa có dữ liệu cảm biến/);
assert.doesNotMatch(areas, /https?:\/\//);
assert.match(areas, /Khu A:[^\n]*Nhiệt độ 25\.8/);
assert.match(areas, /Khu B:[^\n]*Nhiệt độ 24\.7/);
assert.match(areas, /Khu E:[^\n]*pH 6\.8/);

const managers = answerSystemDataQuestion('Ai quản lý khu nào?', owner);
assert.match(managers, /Khu A: chủ vườn quản lý là Huỳnh Minh Quân/);
assert.match(managers, /Khu C: chủ vườn quản lý là Nguyễn Thúy Ái/);
assert.match(managers, /Khu E: chủ vườn quản lý là Trần Thị Nhi/);
assert.doesNotMatch(managers, /Trần Huỳnh Đăng Khoa|https?:\/\//);

const myAreas = answerSystemDataQuestion('Tôi quản lý khu nào?', owner);
assert.match(myAreas, /Khu A, Khu B/);
assert.doesNotMatch(myAreas, /Khu C/);

const tasks = answerSystemDataQuestion('Công việc của tôi là gì?', technician);
assert.match(tasks, /Kiểm tra đầu dò pH/);
assert.match(tasks, /Bảo trì bơm tuần hoàn F/);
assert.equal(tasks.split('\n').length, 4);

const ownerAppointments = answerSystemDataQuestion('Lịch hẹn và công việc kỹ thuật viên sẽ làm cho vườn của tôi?', owner);
assert.equal(ownerAppointments.split('\n').length, 4);
assert.match(ownerAppointments, /Khu A/);
assert.match(ownerAppointments, /Khu B/);
assert.doesNotMatch(ownerAppointments, /Khu C|Khu D|Khu E|Khu F/);

console.log('system AI data queries: PASS');
