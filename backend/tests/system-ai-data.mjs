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

const highestWaterGrowingArea = answerSystemDataQuestion('Khu vực trồng nào đang có mực nước cao nhất?', owner);
assert.match(highestWaterGrowingArea, /Khu [A-L].*mực nước cao nhất:.*%/);
assert.equal(highestWaterGrowingArea.split('\n').length, 1);

const mostProblematicArea = answerSystemDataQuestion('Khu nào đang có vấn đề nhất?', owner);
assert.match(mostProblematicArea, /Khu E.*sức khỏe 63%.*nguy hiểm/);
assert.equal(mostProblematicArea.split('\n').length, 1);

assert.match(answerSystemDataQuestion('Khu A trồng gì?', owner), /Khu A: đang trồng Rau muống/);
assert.match(answerSystemDataQuestion('Rau muống trồng ở khu nào?', owner), /Rau muống đang được trồng tại Khu A/);
assert.match(answerSystemDataQuestion('Khu nào trồng Dâu tây?', owner), /Dâu tây đang được trồng tại Khu H/);
assert.match(answerSystemDataQuestion('Cải kale hiện được trồng tại đâu?', owner), /Cải kale đang được trồng tại Khu I/);
assert.match(answerSystemDataQuestion('Chủ vườn nào đang phụ trách Khu I?', owner), /Khu I: chủ vườn quản lý là Trần Thị Nhi/);
const nhiAreas = answerSystemDataQuestion('Trần Thị Nhi đang quản lý những khu nào?', owner);
for (const code of ['I', 'J', 'K', 'L']) assert.match(nhiAreas, new RegExp(`Khu ${code}`));
assert.doesNotMatch(nhiAreas, /Khu [A-H]/);
assert.match(answerSystemDataQuestion('Kỹ thuật viên nào phụ trách công việc tại Khu F?', { id: 1, role: 'admin' }), /Nguyễn Văn Đức.*Khu F/);
assert.equal(answerSystemDataQuestion('Công việc bảo trì tại Khu J được lên lịch khi nào?', { id: 1, role: 'admin' }).split('\n').length, 1);
assert.match(answerSystemDataQuestion('Ngưỡng nhiệt độ của Khu C đang được cấu hình thế nào?', owner), /Khu C - Nhiệt độ: từ 22 đến 30/);
assert.match(answerSystemDataQuestion('Có bao nhiêu thiết bị đang được lắp tại Khu A?', owner), /Khu A: có 4 thiết bị/);
const offDevices = answerSystemDataQuestion('Những thiết bị nào trong hệ thống hiện đang tắt?', owner);
assert.doesNotMatch(offDevices, /đang bật/);
assert.match(answerSystemDataQuestion('Khu L có bao nhiêu cảm biến?', owner), /Khu L: có 6 cảm biến/);
assert.match(answerSystemDataQuestion('Cho tôi thông tin tổng quan của Khu G.', owner), /Khu G: trồng Cải thìa/);

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
