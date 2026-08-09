const baseUrl = process.env.TEST_API_URL || 'http://127.0.0.1:3101';
const login = await fetch(`${baseUrl}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'admin@greenargric.edu.vn', password: 'greenargric2026' }),
});
if (!login.ok) throw new Error(`Login failed: ${login.status}`);
const auth = await login.json();
const headers = { 'content-type': 'application/json', authorization: `Bearer ${auth.token}` };
const initialUsers = await fetch(`${baseUrl}/user`, { headers });
const initialUserRows = await initialUsers.json();
if (!initialUsers.ok || initialUserRows.length !== 8) {
  throw new Error(`Expected 8 seeded users, received ${initialUserRows.length}`);
}
const response = await fetch(`${baseUrl}/user`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ full_name: 'Tài khoản kiểm thử', email: `ui-test-${Date.now()}@greenargric.local`, password: 'greenargric2026', role: 'technician', status: 'active' }),
});
const body = await response.json();
if (response.status !== 201 || body.role !== 'technician') {
  throw new Error(`Create user failed: ${response.status} ${JSON.stringify(body)}`);
}
const deviceResponse = await fetch(`${baseUrl}/device`, {
  method: 'POST', headers,
  body: JSON.stringify({ area_id: 1, device_code: `TEST-${Date.now()}`, device_name: 'Thiết bị kiểm thử', device_type: 'fan' }),
});
if (deviceResponse.status !== 201) throw new Error(`Create device failed: ${deviceResponse.status} ${await deviceResponse.text()}`);

const changedPassword = 'greenargric-test-2026';
const passwordResponse = await fetch(`${baseUrl}/user/password`, {
  method: 'PUT', headers,
  body: JSON.stringify({ current_password: 'greenargric2026', new_password: changedPassword }),
});
if (!passwordResponse.ok) throw new Error(`Change password failed: ${passwordResponse.status} ${await passwordResponse.text()}`);
const changedLogin = await fetch(`${baseUrl}/auth/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'admin@greenargric.edu.vn', password: changedPassword }),
});
if (!changedLogin.ok) throw new Error(`Login with changed password failed: ${changedLogin.status}`);
const changedAuth = await changedLogin.json();
const restoreResponse = await fetch(`${baseUrl}/user/password`, {
  method: 'PUT', headers: { 'content-type': 'application/json', authorization: `Bearer ${changedAuth.token}` },
  body: JSON.stringify({ current_password: changedPassword, new_password: 'greenargric2026' }),
});
if (!restoreResponse.ok) throw new Error(`Restore password failed: ${restoreResponse.status}`);
const ownerLogin = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'owner@greenargric.edu.vn', password: 'greenargric2026' }) });
const ownerAuth = await ownerLogin.json();
const ownerHeaders = { 'content-type': 'application/json', authorization: `Bearer ${ownerAuth.token}` };
const ownerMessage = await fetch(`${baseUrl}/message`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ receiver_id: 1, content: 'Tin nhắn smoke test từ chủ vườn' }) });
if (ownerMessage.status !== 201) throw new Error(`Owner send message failed: ${ownerMessage.status}`);
const adminConversation = await fetch(`${baseUrl}/message/conversation/2`, { headers });
const adminMessages = await adminConversation.json();
if (!adminMessages.some((message) => message.content === 'Tin nhắn smoke test từ chủ vườn')) throw new Error('Admin did not receive owner message');
const techLogin = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'tech@greenargric.edu.vn', password: 'greenargric2026' }) });
const techAuth = await techLogin.json();
const techHeaders = { 'content-type': 'application/json', authorization: `Bearer ${techAuth.token}` };
const adminToTech = await fetch(`${baseUrl}/message`, { method: 'POST', headers, body: JSON.stringify({ receiver_id: 3, content: 'Tin nhắn smoke test từ quản trị viên' }) });
if (adminToTech.status !== 201) throw new Error(`Admin send to technician failed: ${adminToTech.status}`);
const techConversation = await fetch(`${baseUrl}/message/conversation/1`, { headers: techHeaders });
const techMessages = await techConversation.json();
if (!techMessages.some((message) => message.content === 'Tin nhắn smoke test từ quản trị viên')) throw new Error('Technician did not receive admin message');
const techToOwner = await fetch(`${baseUrl}/message`, { method: 'POST', headers: techHeaders, body: JSON.stringify({ receiver_id: 2, content: 'Tin nhắn smoke test từ kỹ thuật viên' }) });
if (techToOwner.status !== 201) throw new Error(`Technician send to owner failed: ${techToOwner.status}`);
const ownerConversation = await fetch(`${baseUrl}/message/conversation/3`, { headers: ownerHeaders });
const ownerMessages = await ownerConversation.json();
if (!ownerMessages.some((message) => message.content === 'Tin nhắn smoke test từ kỹ thuật viên')) throw new Error('Owner did not receive technician message');
const aiResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers, body: JSON.stringify({ message: 'Tình trạng vườn?' }) });
const aiResult = await aiResponse.json();
if (!aiResponse.ok || aiResult.provider !== 'ollama' || !aiResult.reply.includes('Phản hồi Ollama kiểm thử') || !aiResult.reply.includes('Nguồn tham khảo đã đối chiếu:') || !aiResult.reply.includes('https://example.com/bai-viet-kiem-chung')) throw new Error(`Grounded Ollama chat failed: ${aiResponse.status} ${JSON.stringify(aiResult)}`);
if (aiResult.reply.includes('**') || /^\s*\*/m.test(aiResult.reply)) throw new Error(`Markdown cleanup failed: ${JSON.stringify(aiResult)}`);
if (/[\u3400-\u9FFF]/u.test(aiResult.reply)) throw new Error(`Foreign script cleanup failed: ${JSON.stringify(aiResult)}`);
const cookingResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers, body: JSON.stringify({ message: 'Cách nấu rau muống ngon?' }) });
const cookingResult = await cookingResponse.json();
if (!cookingResponse.ok || cookingResult.provider !== 'system' || cookingResult.source !== 'verified-food-guide' || cookingResult.reply.includes('rau muống nướng') || !cookingResult.reply.includes('Rau muống xào tỏi:') || !cookingResult.reply.includes('dienmayxanh.com/vao-bep/')) throw new Error(`Grounded cooking answer failed: ${cookingResponse.status} ${JSON.stringify(cookingResult)}`);
const groundedAdminResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Quản trị viên tên gì?' }) });
const groundedAdmin = await groundedAdminResponse.json();
if (!groundedAdminResponse.ok || groundedAdmin.provider !== 'system' || !groundedAdmin.reply.includes('Phạm Phước Nguyên') || groundedAdmin.reply.includes('Nguồn tham khảo') || groundedAdmin.reply.includes('http')) throw new Error(`Admin contact exception failed: ${groundedAdminResponse.status} ${JSON.stringify(groundedAdmin)}`);
const ownerFollowUpResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Còn chủ vườn?', history: [{ role: 'user', content: 'Kỹ thuật viên gồm những ai?' }] }) });
const ownerFollowUp = await ownerFollowUpResponse.json();
if (!ownerFollowUpResponse.ok || ownerFollowUp.provider !== 'system' || !ownerFollowUp.reply.includes('Huỳnh Minh Quân') || ownerFollowUp.reply.includes('Nguồn tham khảo') || ownerFollowUp.reply.includes('http')) throw new Error(`Owner follow-up failed: ${ownerFollowUpResponse.status} ${JSON.stringify(ownerFollowUp)}`);
if (!ownerFollowUp.reply.includes('Nguyễn Thúy Ái') || !ownerFollowUp.reply.includes('Trần Thị Nhi')) throw new Error(`Owner cannot see other owners in closed system: ${JSON.stringify(ownerFollowUp)}`);
const ownerContactsResponse = await fetch(`${baseUrl}/message/contacts`, { headers: ownerHeaders });
const ownerContacts = await ownerContactsResponse.json();
if (!ownerContactsResponse.ok || !ownerContacts.some((contact) => contact.role === 'owner') || !ownerContacts.some((contact) => contact.role === 'admin') || !ownerContacts.some((contact) => contact.role === 'technician')) throw new Error(`Owner contact ACL failed: ${JSON.stringify(ownerContacts)}`);
const adminContactsResponse = await fetch(`${baseUrl}/message/contacts`, { headers });
const adminContacts = await adminContactsResponse.json();
if (!adminContactsResponse.ok || !adminContacts.some((contact) => contact.role === 'owner') || !adminContacts.some((contact) => contact.role === 'technician')) throw new Error(`Admin contact ACL failed: ${JSON.stringify(adminContacts)}`);
const techContactsResponse = await fetch(`${baseUrl}/message/contacts`, { headers: techHeaders });
const techContacts = await techContactsResponse.json();
if (!techContactsResponse.ok || !techContacts.some((contact) => contact.role === 'admin') || !techContacts.some((contact) => contact.role === 'owner') || !techContacts.some((contact) => contact.role === 'technician' && contact.id !== techAuth.user.id)) throw new Error(`Technician contact ACL failed: ${JSON.stringify(techContacts)}`);
const areaStatusResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Tình hình các khu vực trồng hôm nay như thế nào?' }) });
const areaStatus = await areaStatusResponse.json();
if (!areaStatusResponse.ok || areaStatus.source !== 'green-argric-data' || !['Khu A','Khu B','Khu C','Khu D','Khu E','Khu F'].every((area) => areaStatus.reply.includes(area)) || areaStatus.reply.includes('chưa có dữ liệu cảm biến') || areaStatus.reply.includes('Nguồn tham khảo') || areaStatus.reply.includes('http')) throw new Error(`Area status AI query failed: ${areaStatusResponse.status} ${JSON.stringify(areaStatus)}`);
if (!areaStatus.reply.includes('Nhiệt độ 25.8') || !areaStatus.reply.includes('Nhiệt độ 24.7') || !areaStatus.reply.includes('pH 6.8')) throw new Error(`Area readings are not distinct: ${JSON.stringify(areaStatus)}`);
const managerResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Ai quản lý khu nào?' }) });
const managers = await managerResponse.json();
if (!managerResponse.ok || managers.source !== 'green-argric-data' || !managers.reply.includes('Huỳnh Minh Quân') || !managers.reply.includes('Nguyễn Thúy Ái') || !managers.reply.includes('Trần Thị Nhi') || managers.reply.includes('Trần Huỳnh Đăng Khoa') || managers.reply.includes('Nguồn tham khảo')) throw new Error(`Area manager query failed: ${JSON.stringify(managers)}`);
const technicianTasksResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: techHeaders, body: JSON.stringify({ message: 'Công việc của tôi là gì?' }) });
const technicianTasks = await technicianTasksResponse.json();
if (!technicianTasksResponse.ok || technicianTasks.source !== 'green-argric-data' || !technicianTasks.reply.includes('Kiểm tra đầu dò pH') || !technicianTasks.reply.includes('Bảo trì bơm tuần hoàn F') || technicianTasks.reply.split('\n').length !== 10 || technicianTasks.reply.includes('Nguồn tham khảo')) throw new Error(`Technician task AI query failed: ${technicianTasksResponse.status} ${JSON.stringify(technicianTasks)}`);
const technicianTaskListResponse = await fetch(`${baseUrl}/task`, { headers: techHeaders });
const technicianTaskList = await technicianTaskListResponse.json();
if (!technicianTaskListResponse.ok || technicianTaskList.length !== 10 || technicianTaskList.some((task) => task.assigned_to !== techAuth.user.id)) throw new Error(`Technician task privacy failed: ${technicianTaskListResponse.status} ${JSON.stringify(technicianTaskList)}`);
const ownerAppointmentsResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Lịch hẹn và công việc kỹ thuật viên sẽ làm cho vườn của tôi?' }) });
const ownerAppointments = await ownerAppointmentsResponse.json();
if (!ownerAppointmentsResponse.ok || ownerAppointments.reply.split('\n').length !== 4 || !ownerAppointments.reply.includes('Khu A') || !ownerAppointments.reply.includes('Khu B') || /Khu [C-F]/.test(ownerAppointments.reply)) throw new Error(`Owner appointment ACL failed: ${JSON.stringify(ownerAppointments)}`);
const deleteConversation = await fetch(`${baseUrl}/message/conversation/2`, { method: 'DELETE', headers });
const deletedConversation = await deleteConversation.json();
if (!deleteConversation.ok || deletedConversation.deleted < 1) throw new Error(`Delete conversation failed: ${deleteConversation.status} ${JSON.stringify(deletedConversation)}`);
const emptyConversation = await fetch(`${baseUrl}/message/conversation/2`, { headers });
if (!emptyConversation.ok || (await emptyConversation.json()).length !== 0) throw new Error('Conversation was not deleted');
console.log('users(8), device/password, messaging/delete conversation, grounded roles and Ollama chat smoke test: PASS');
