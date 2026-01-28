require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');

(async () => {
  try {
    await connectDB();

    const email = process.argv[2] || 'admin@supermall.com';
    const username = process.argv[3] || 'admin';
    const password = process.argv[4] || 'admin123';
    const role = process.argv[5] || 'superadmin';

    let existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const admin = await Admin.create({ email, username, password, role, isActive: true });
    console.log('Admin created:', { id: admin._id.toString(), email: admin.email, username: admin.username, role: admin.role });
    process.exit(0);
  } catch (e) {
    console.error('Create admin error:', e.message);
    process.exit(1);
  }
})();
