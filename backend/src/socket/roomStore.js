import redis from "../db/redisClient.js";

const ROOM_PREFIX = "room:";

/**
 * Initialize a room's state in Redis when an interview is created.
 */
export const initRoom = async (roomId, { codeState = "// Start coding here...", language = "javascript" }) => {
    const key = ROOM_PREFIX + roomId;
    await redis.hset(key, {
        codeState,
        language,
        whiteboardState: JSON.stringify([])
    });
    console.log(`📦 Room state initialized in Redis: ${roomId}`);
};

/**
 * Get the full state of a room from Redis.
 * Returns null if the room doesn't exist in Redis.
 */
export const getRoom = async (roomId) => {
    const key = ROOM_PREFIX + roomId;
    const data = await redis.hgetall(key);

    // hgetall returns {} if key doesn't exist
    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    return {
        codeState: data.codeState || "",
        language: data.language || "javascript",
        whiteboardState: data.whiteboardState ? JSON.parse(data.whiteboardState) : [],
        candidateNames: data.candidateNames ? JSON.parse(data.candidateNames) : [],
        activeQuestion: data.activeQuestion ? JSON.parse(data.activeQuestion) : null
    };
};

/**
 * Update the full code content for a room.
 */
export const updateCode = async (roomId, fullCode) => {
    const key = ROOM_PREFIX + roomId;
    await redis.hset(key, "codeState", fullCode);
};

/**
 * Update the language for a room.
 */
export const updateLanguage = async (roomId, language) => {
    const key = ROOM_PREFIX + roomId;
    await redis.hset(key, "language", language);
};

/**
 * Update the whiteboard elements for a room.
 */
export const updateWhiteboard = async (roomId, elements) => {
    const key = ROOM_PREFIX + roomId;
    await redis.hset(key, "whiteboardState", JSON.stringify(elements));
};

/**
 * Delete a room's state from Redis (cleanup after saving to MongoDB).
 */
export const deleteRoom = async (roomId) => {
    const key = ROOM_PREFIX + roomId;
    await redis.del(key);
    console.log(`🗑️ Room state removed from Redis: ${roomId}`);
};

/**
 * Add a candidate name for a room.
 */
export const addCandidateName = async (roomId, candidateName) => {
    const key = ROOM_PREFIX + roomId;
    const existing = await redis.hget(key, "candidateNames");
    let names = [];
    if (existing) {
        names = JSON.parse(existing);
    }
    if (!names.includes(candidateName)) {
        names.push(candidateName);
        await redis.hset(key, "candidateNames", JSON.stringify(names));
    }
};

/**
 * Update the active question for a room.
 */
export const updateActiveQuestion = async (roomId, question) => {
    const key = ROOM_PREFIX + roomId;
    if (question) {
        await redis.hset(key, "activeQuestion", JSON.stringify(question));
    } else {
        await redis.hdel(key, "activeQuestion");
    }
};
