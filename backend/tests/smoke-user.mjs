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
if (response.status !== 201 || body.role !== 'technician' || !body.created_at) {
  throw new Error(`Create user failed: ${response.status} ${JSON.stringify(body)}`);
}
const ownerAccountResponse = await fetch(`${baseUrl}/user`, {
  method: 'POST', headers,
  body: JSON.stringify({ full_name: `Chủ vườn kiểm thử ${Date.now()}`, email: `owner-test-${Date.now()}@greenargric.local`, password: 'greenargric2026', role: 'owner', status: 'active' }),
});
const ownerAccount = await ownerAccountResponse.json();
if (ownerAccountResponse.status !== 201 || ownerAccount.role !== 'owner') throw new Error(`Create owner failed: ${ownerAccountResponse.status} ${JSON.stringify(ownerAccount)}`);
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
const newAreaResponse = await fetch(`${baseUrl}/area`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ area_name: 'Khu smoke', crop_type: 'Rau thử nghiệm', location: '20 m²', description: 'Kiểm thử thêm khu vực' }) });
const newArea = await newAreaResponse.json();
if (newAreaResponse.status !== 201 || newArea.owner_id !== ownerAuth.user.id) throw new Error(`Owner create area failed: ${newAreaResponse.status} ${JSON.stringify(newArea)}`);
const newAreaThresholdsResponse = await fetch(`${baseUrl}/threshold/${newArea.area_id}`, { headers: ownerHeaders });
const newAreaThresholds = await newAreaThresholdsResponse.json();
if (!newAreaThresholdsResponse.ok || !newAreaThresholds.some((item) => item.sensor_type === 'dissolved_oxygen')) throw new Error(`New area threshold defaults missing: ${JSON.stringify(newAreaThresholds)}`);
const saveThresholdResponse = await fetch(`${baseUrl}/threshold`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ area_id: newArea.area_id, sensor_type: 'co2', min_value: 450, max_value: 1100, is_activated: true }) });
const savedThreshold = await saveThresholdResponse.json();
if (!saveThresholdResponse.ok || savedThreshold.min_value !== 450 || savedThreshold.max_value !== 1100) throw new Error(`Save threshold failed: ${saveThresholdResponse.status} ${JSON.stringify(savedThreshold)}`);
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
const { enforceQuestionScope } = await import('../routes/ai.js');
const scopedVegetableAnswer = enforceQuestionScope('Rau gì chứa nhiều vitamin D?', '- Cải xoăn: là một loại rau.\n- Lòng đỏ trứng: chứa vitamin D.\n- Cá hồi: chứa vitamin D.');
if (!scopedVegetableAnswer.includes('Cải xoăn') || scopedVegetableAnswer.includes('trứng') || scopedVegetableAnswer.includes('Cá hồi')) throw new Error(`Question scope validation failed: ${scopedVegetableAnswer}`);
const preciseRecipeAnswer = enforceQuestionScope('Cách nấu gà hấp cải bẹ xanh', '- Nguyên liệu: gà và cải bẹ xanh.\n- Ướp với 2m hạt nêm trong 30 phút.\n- Hấp gà cho đến khi chín.');
if (preciseRecipeAnswer.includes('2m') || !preciseRecipeAnswer.includes('Nguyên liệu') || !preciseRecipeAnswer.includes('Hấp gà')) throw new Error(`Recipe precision validation failed: ${preciseRecipeAnswer}`);
const { selectSourcesForQuestion } = await import('../routes/ai.js');
if (selectSourcesForQuestion('Cách nấu canh rau', [{ score: 0.9 }, { score: 0.8 }]).length !== 1) throw new Error('Recipe must use one primary source');
const { isFollowUpQuestion } = await import('../routes/ai.js');
if (isFollowUpQuestion('Mùi vị của hành tây từ đâu mà ra?') || !isFollowUpQuestion('Còn chủ vườn?')) throw new Error('Conversation follow-up detection failed');
const mismatchedIntentAnswer = enforceQuestionScope('Mùi vị của hành tây từ đâu mà ra?', 'Nguyên liệu: hành tây\nSơ chế: rửa sạch\nCác bước thực hiện: thái hành');
if (!mismatchedIntentAnswer.startsWith('Chưa có đủ nguồn')) throw new Error(`Intent mismatch was not blocked: ${mismatchedIntentAnswer}`);
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
if (!areaStatusResponse.ok || areaStatus.source !== 'green-argric-data' || !'ABCDEFGHIJKL'.split('').every((code) => areaStatus.reply.includes(`Khu ${code}`)) || areaStatus.reply.includes('Nguồn tham khảo') || areaStatus.reply.includes('http')) throw new Error(`Area status AI query failed: ${areaStatusResponse.status} ${JSON.stringify(areaStatus)}`);
if (!areaStatus.reply.includes('Nhiệt độ 25.8') || !areaStatus.reply.includes('Nhiệt độ 24.7') || !areaStatus.reply.includes('pH 6.8')) throw new Error(`Area readings are not distinct: ${JSON.stringify(areaStatus)}`);
const cropResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Khu E đang trồng gì?' }) });
const cropResult = await cropResponse.json();
if (!cropResponse.ok || cropResult.source !== 'green-argric-data' || !cropResult.reply.includes('Khu E: đang trồng Cà chua bi') || cropResult.reply.includes('Nguồn tham khảo') || cropResult.reply.includes('http')) throw new Error(`Area crop query failed: ${JSON.stringify(cropResult)}`);
const managerResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Ai quản lý khu nào?' }) });
const managers = await managerResponse.json();
if (!managerResponse.ok || managers.source !== 'green-argric-data' || !managers.reply.includes('Huỳnh Minh Quân') || !managers.reply.includes('Nguyễn Thúy Ái') || !managers.reply.includes('Trần Thị Nhi') || managers.reply.includes('Trần Huỳnh Đăng Khoa') || managers.reply.includes('Nguồn tham khảo')) throw new Error(`Area manager query failed: ${JSON.stringify(managers)}`);
const technicianTasksResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: techHeaders, body: JSON.stringify({ message: 'Công việc của tôi là gì?' }) });
const technicianTasks = await technicianTasksResponse.json();
if (!technicianTasksResponse.ok || technicianTasks.source !== 'green-argric-data' || !technicianTasks.reply.includes('Kiểm tra cảm biến pH Khu A') || !technicianTasks.reply.includes('Kiểm tra cảm biến pH Khu J') || technicianTasks.reply.split('\n').length !== 4 || technicianTasks.reply.includes('Nguồn tham khảo')) throw new Error(`Technician task AI query failed: ${technicianTasksResponse.status} ${JSON.stringify(technicianTasks)}`);
const technicianTaskListResponse = await fetch(`${baseUrl}/task`, { headers: techHeaders });
const technicianTaskList = await technicianTaskListResponse.json();
if (!technicianTaskListResponse.ok || technicianTaskList.length !== 4 || technicianTaskList.some((task) => task.assigned_to !== techAuth.user.id)) throw new Error(`Technician task privacy failed: ${technicianTaskListResponse.status} ${JSON.stringify(technicianTaskList)}`);
const ownerAppointmentsResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Lịch hẹn và công việc kỹ thuật viên sẽ làm cho vườn của tôi?' }) });
const ownerAppointments = await ownerAppointmentsResponse.json();
if (!ownerAppointmentsResponse.ok || ownerAppointments.reply.split('\n').length !== 4 || !['A','B','C','D'].every((code) => ownerAppointments.reply.includes(`Khu ${code}`)) || /Khu [E-L]/.test(ownerAppointments.reply)) throw new Error(`Owner appointment ACL failed: ${JSON.stringify(ownerAppointments)}`);
const repairTechniciansResponse = await fetch(`${baseUrl}/ai/chat`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ message: 'Kỹ thuật viên nào sẽ đến sửa?' }) });
const repairTechnicians = await repairTechniciansResponse.json();
if (!repairTechniciansResponse.ok || repairTechnicians.source !== 'green-argric-data' || !repairTechnicians.reply.includes('Trần Huỳnh Đăng Khoa') || !repairTechnicians.reply.includes('Nguyễn Thanh Tâm') || !repairTechnicians.reply.includes('Nguyễn Văn Đức') || repairTechnicians.reply.includes('Nguồn tham khảo') || repairTechnicians.reply.includes('http')) throw new Error(`Internal repair query failed: ${JSON.stringify(repairTechnicians)}`);
const deleteConversation = await fetch(`${baseUrl}/message/conversation/2`, { method: 'DELETE', headers });
const deletedConversation = await deleteConversation.json();
if (!deleteConversation.ok || deletedConversation.deleted < 1) throw new Error(`Delete conversation failed: ${deleteConversation.status} ${JSON.stringify(deletedConversation)}`);
const emptyConversation = await fetch(`${baseUrl}/message/conversation/2`, { headers });
if (!emptyConversation.ok || (await emptyConversation.json()).length !== 0) throw new Error('Conversation was not deleted');
console.log('users(8), device/password, messaging/delete conversation, grounded roles and Ollama chat smoke test: PASS');
