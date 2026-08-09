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

const tasks = answerSystemDataQuestion('Công việc của tôi là gì?', technician);
assert.match(tasks, /Kiểm tra đầu dò pH/);
assert.match(tasks, /Bảo trì bơm tuần hoàn F/);
assert.equal(tasks.split('\n').length, 10);

const ownerAppointments = answerSystemDataQuestion('Lịch hẹn và công việc kỹ thuật viên sẽ làm cho vườn của tôi?', owner);
assert.equal(ownerAppointments.split('\n').length, 4);
assert.match(ownerAppointments, /Khu A/);
assert.match(ownerAppointments, /Khu B/);
assert.doesNotMatch(ownerAppointments, /Khu C|Khu D|Khu E|Khu F/);

console.log('system AI data queries: PASS');
