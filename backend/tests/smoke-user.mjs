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
if (!groundedAdminResponse.ok || groundedAdmin.provider !== 'system' || !groundedAdmin.reply.includes('Phạm Phước Nguyên') || groundedAdmin.reply.includes('Huỳnh Minh Quân') || groundedAdmin.reply.includes('Nguồn tham khảo') || groundedAdmin.reply.includes('http')) throw new Error(`Grounded role answer failed: ${groundedAdminResponse.status} ${JSON.stringify(groundedAdmin)}`);
const ownerFollowUpResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Còn chủ vườn?', history: [{ role: 'user', content: 'Kỹ thuật viên gồm những ai?' }] }) });
const ownerFollowUp = await ownerFollowUpResponse.json();
if (!ownerFollowUpResponse.ok || ownerFollowUp.provider !== 'system' || !ownerFollowUp.reply.includes('Huỳnh Minh Quân') || ownerFollowUp.reply.includes('Nguồn tham khảo') || ownerFollowUp.reply.includes('http')) throw new Error(`Owner follow-up failed: ${ownerFollowUpResponse.status} ${JSON.stringify(ownerFollowUp)}`);
const areaStatusResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Tình hình các khu vực trồng hôm nay như thế nào?' }) });
const areaStatus = await areaStatusResponse.json();
if (!areaStatusResponse.ok || areaStatus.source !== 'green-argric-data' || !areaStatus.reply.includes('Khu A') || !areaStatus.reply.includes('Khu B') || !areaStatus.reply.includes('Khu C') || areaStatus.reply.includes('Nguồn tham khảo') || areaStatus.reply.includes('http')) throw new Error(`Area status AI query failed: ${areaStatusResponse.status} ${JSON.stringify(areaStatus)}`);
const technicianTasksResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: techHeaders, body: JSON.stringify({ message: 'Công việc của tôi là gì?' }) });
const technicianTasks = await technicianTasksResponse.json();
if (!technicianTasksResponse.ok || technicianTasks.source !== 'green-argric-data' || !technicianTasks.reply.includes('Kiểm tra đầu dò pH') || technicianTasks.reply.includes('Nguồn tham khảo')) throw new Error(`Technician task AI query failed: ${technicianTasksResponse.status} ${JSON.stringify(technicianTasks)}`);
const deleteConversation = await fetch(`${baseUrl}/message/conversation/2`, { method: 'DELETE', headers });
const deletedConversation = await deleteConversation.json();
if (!deleteConversation.ok || deletedConversation.deleted < 1) throw new Error(`Delete conversation failed: ${deleteConversation.status} ${JSON.stringify(deletedConversation)}`);
const emptyConversation = await fetch(`${baseUrl}/message/conversation/2`, { headers });
if (!emptyConversation.ok || (await emptyConversation.json()).length !== 0) throw new Error('Conversation was not deleted');
console.log('users(8), device/password, messaging/delete conversation, grounded roles and Ollama chat smoke test: PASS');
