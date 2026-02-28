// Quick connection test — tries multiple password formats
const mongoose = require('mongoose');

const HOST = 'cluster0.qpe7ew1.mongodb.net';
const USER = 'returf2026';

const uris = [
    // Original password as-is (may have been reset to no special chars)
    `mongodb+srv://${USER}:REturf2026@${HOST}/returff?appName=Cluster0`,
    `mongodb+srv://${USER}:REturf2026@${HOST}/?appName=Cluster0`,
    // Original password percent-encoded
    `mongodb+srv://${USER}:%40Z%40REturf2026@${HOST}/returff?appName=Cluster0`,
    // Password with literal @ (if Atlas auto-encoded it)
    `mongodb+srv://${USER}:@Z@REturf2026@${HOST}/returff?appName=Cluster0`,
    // Common reset patterns
    `mongodb+srv://${USER}:returf2026@${HOST}/returff?appName=Cluster0`,
    `mongodb+srv://${USER}:REturf@2026@${HOST}/returff?appName=Cluster0`,
];

async function test(uri, label) {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
        console.log(`\n✅✅✅ CONNECTED! [${label}]`);
        console.log(`   URI: ${uri}\n`);
        await mongoose.disconnect();
        return true;
    } catch (e) {
        const msg = e.message.includes('bad auth') ? 'Wrong password' : e.message.substring(0, 50);
        console.log(`❌ [${label}]: ${msg}`);
        return false;
    }
}

(async () => {
    console.log('Testing MongoDB connection formats...\n');
    for (let i = 0; i < uris.length; i++) {
        const ok = await test(uris[i], `Format ${i + 1}`);
        if (ok) break;
    }
    console.log('\nDone.');
})();
