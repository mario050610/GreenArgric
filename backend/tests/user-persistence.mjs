import assert from 'node:assert/strict';
import { store } from '../data/store.js';
import { hydrateStoreFromDatabase, persistUser } from '../db.js';

const originalUsers = [...store.users];
const created = {
  user_id: Math.max(...store.users.map((user) => user.user_id)) + 1,
  role_id: 2,
  full_name: 'Chủ vườn lưu bền vững',
  email: 'persistent-owner@greenargric.test',
  password_hash: 'plain:test-password',
  status: 'active',
};

await persistUser(created);
store.users.splice(0, store.users.length, ...originalUsers);
await hydrateStoreFromDatabase();
assert.ok(store.users.some((user) => user.email === created.email));
console.log('memory user persistence: PASS');
