/**
 * seed.js — Admin + User dono create karta hai MongoDB mein
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const USERS_TO_SEED = [
    {
        name: 'Admin User',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Test User',
        phone: '8888888888',
        password: 'user1234',
        role: 'user',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');

        for (const u of USERS_TO_SEED) {
            const existing = await User.findOne({ phone: u.phone });

            if (existing) {
                // Already exists — role update karo
                existing.role = u.role;
                await existing.save();
                console.log(`🔄 Updated  [${u.role.toUpperCase()}]  ${u.name}  (${u.phone})`);
            } else {
                // Naya user banao — pre-save hook password hash karega
                await User.create({
                    name: u.name,
                    phone: u.phone,
                    passwordHash: u.password,
                    role: u.role,
                });
                console.log(`✅ Created  [${u.role.toUpperCase()}]  ${u.name}  (${u.phone})  pass: ${u.password}`);
            }
        }

        console.log('\n🎉 Seeding complete!');
        console.log('─────────────────────────────────');
        console.log('ADMIN  → phone: 9999999999  pass: admin123');
        console.log('USER   → phone: 8888888888  pass: user1234');
        console.log('─────────────────────────────────');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
