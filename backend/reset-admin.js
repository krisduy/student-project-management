const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function reset() {
  await mongoose.connect('mongodb://127.0.0.1:27017/student_project_management');
  const hash = await bcrypt.hash('Admin@2026', 10);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@fbu.edu.vn' },
    { $set: { password: hash } }
  );
  console.log('Password reset done!');
  const valid = await bcrypt.compare('Admin@2026', hash);
  console.log('Verify:', valid);
  await mongoose.disconnect();
}

reset();
