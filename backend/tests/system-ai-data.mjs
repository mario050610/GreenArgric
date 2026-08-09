import assert from 'node:assert/strict';
import { answerSystemDataQuestion } from '../routes/ai.js';

const owner = { id: 2, role: 'owner' };
const technician = { id: 3, role: 'technician' };

const areaCount = answerSystemDataQuestion('Có bao nhiêu khu vườn?', owner);
assert.match(areaCount, /12 khu vực trồng/);
for (const code of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) assert.match(areaCount, new RegExp(`Khu ${code}`));

const highestWaterGarden = answerSystemDataQuestion('Vườn nào đang có mực nước cao nhất?', owner);
assert.match(highestWaterGarden, /Khu [A-L].*mực nước cao nhất:.*%/);
assert.doesNotMatch(highestWaterGarden, /https?:\/\//);
assert.equal(highestWaterGarden.split('\n').length, 1);

const areas = answerSystemDataQuestion('Tình hình các khu vực trồng hôm nay như thế nào?', owner);
assert.match(areas, /Khu A/);
assert.match(areas, /Khu B/);
assert.match(areas, /Khu C/);
assert.match(areas, /Khu D/);
assert.match(areas, /Khu E/);
assert.match(areas, /Khu F/);
for (const code of ['G', 'H', 'I', 'J', 'K', 'L']) assert.match(areas, new RegExp(`Khu ${code}`));
assert.doesNotMatch(areas, /chưa có dữ liệu cảm biến/);
assert.doesNotMatch(areas, /https?:\/\//);
assert.match(areas, /Khu A:[^\n]*Nhiệt độ 25\.8/);
assert.match(areas, /Khu B:[^\n]*Nhiệt độ 24\.7/);
assert.match(areas, /Khu E:[^\n]*pH 6\.8/);

const managers = answerSystemDataQuestion('Ai quản lý khu nào?', owner);
assert.match(managers, /Khu A: chủ vườn quản lý là Huỳnh Minh Quân/);
assert.match(managers, /Khu D: chủ vườn quản lý là Huỳnh Minh Quân/);
assert.match(managers, /Khu E: chủ vườn quản lý là Nguyễn Thúy Ái/);
assert.match(managers, /Khu I: chủ vườn quản lý là Trần Thị Nhi/);
assert.doesNotMatch(managers, /Trần Huỳnh Đăng Khoa|https?:\/\//);

const myAreas = answerSystemDataQuestion('Tôi quản lý khu nào?', owner);
assert.match(myAreas, /Khu A, Khu B, Khu C, Khu D/);
assert.doesNotMatch(myAreas, /Khu E/);

const tasks = answerSystemDataQuestion('Công việc của tôi là gì?', technician);
assert.match(tasks, /Kiểm tra cảm biến pH Khu A/);
assert.match(tasks, /Kiểm tra cảm biến pH Khu J/);
assert.equal(tasks.split('\n').length, 4);

const ownerAppointments = answerSystemDataQuestion('Lịch hẹn và công việc kỹ thuật viên sẽ làm cho vườn của tôi?', owner);
assert.equal(ownerAppointments.split('\n').length, 4);
assert.match(ownerAppointments, /Khu A/);
assert.match(ownerAppointments, /Khu B/);
assert.match(ownerAppointments, /Khu C/);
assert.match(ownerAppointments, /Khu D/);
assert.doesNotMatch(ownerAppointments, /Khu E|Khu F|Khu G|Khu H|Khu I|Khu J|Khu K|Khu L/);

console.log('system AI data queries: PASS');
