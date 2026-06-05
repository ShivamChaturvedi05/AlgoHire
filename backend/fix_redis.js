import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

async function fix() {
    const keys = await redis.keys('room:*');
    console.log("Rooms found:", keys);
    for (const key of keys) {
        await redis.hdel(key, 'activeQuestion');
        console.log("Cleared activeQuestion for", key);
    }
    redis.quit();
}

fix().catch(console.error);
