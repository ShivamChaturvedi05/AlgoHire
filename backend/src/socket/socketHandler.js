import { Interview } from "../models/interview.model.js";
import * as roomStore from "./roomStore.js";

const interviewers = {}; 

const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", async ({ roomId, userId, username, role }) => {
            socket.join(roomId);

            if (role === "interviewer") {
                interviewers[roomId] = socket.id;
                
                socket.emit("room-joined", { status: "approved" });
            } else {
                const interviewerSocketId = interviewers[roomId];

                if (interviewerSocketId) {
                    io.to(interviewerSocketId).emit("user-waiting", {
                        userId,
                        socketId: socket.id,
                        username
                    });
                } else {
                    console.log("No interviewer found for room:", roomId);
                }
            }

            // Send the current room state from Redis to the joining user
            try {
                const state = await roomStore.getRoom(roomId);
                if (state) {
                    socket.emit("room-state", state);
                    console.log(`📤 Sent room state to ${socket.id} for room ${roomId}`);
                }
            } catch (err) {
                console.error("Failed to get room state from Redis:", err.message);
            }
        });

        socket.on("admit-candidate", async ({ socketId, roomId, username }) => {
            io.to(socketId).emit("room-joined", { status: "approved" });
            io.to(roomId).emit("candidate-joined", { username });
            try {
                if (username) {
                    await roomStore.updateCandidateName(roomId, username);
                }
            } catch (err) {
                console.error("Failed to update candidate name in Redis:", err.message);
            }
        });

        // Broadcast incremental changes to other users (real-time collab)
        socket.on("code-change", ({ roomId, changes }) => {
            socket.to(roomId).emit("code-update", { changes });
        });

        // Full code sync — save to Redis for persistence
        socket.on("code-sync", async ({ roomId, code }) => {
            try {
                await roomStore.updateCode(roomId, code);
            } catch (err) {
                console.error("Failed to sync code to Redis:", err.message);
            }
        });

        socket.on("language-change", async ({ roomId, language }) => {
            io.to(roomId).emit("language-update", language);
            try {
                await roomStore.updateLanguage(roomId, language);
            } catch (err) {
                console.error("Failed to update language in Redis:", err.message);
            }
        });

        socket.on("whiteboard-draw", async ({ roomId, data }) => {
            console.log(`🎨 WB Draw in ${roomId} from ${socket.id}`);
            socket.to(roomId).emit("whiteboard-update", data);
            try {
                await roomStore.updateWhiteboard(roomId, data);
            } catch (err) {
                console.error("Failed to update whiteboard in Redis:", err.message);
            }
        });

        socket.on("send-question", async ({ roomId, question }) => {
            io.to(roomId).emit("active-question-update", question);
            try {
                await roomStore.updateActiveQuestion(roomId, question);
            } catch (err) {
                console.error("Failed to update active question in Redis:", err.message);
            }
        });

        socket.on("test-results", ({ roomId, results }) => {
            socket.to(roomId).emit("test-results", { results });
        });

        // End Interview — save final state from Redis to MongoDB, then cleanup
        socket.on("end-interview", async ({ roomId }) => {
            console.log(`🛑 End interview requested for room: ${roomId}`);

            try {
                // 1. Get final state from Redis
                const state = await roomStore.getRoom(roomId);

                // 2. Save to MongoDB
                const updateData = {
                    status: "completed"
                };
                if (state) {
                    updateData.codeState = state.codeState;
                    updateData.language = state.language;
                    updateData.whiteboardState = state.whiteboardState;
                    if (state.candidateName) {
                        updateData.candidateName = state.candidateName;
                    }
                    if (state.activeQuestion) {
                        updateData.activeQuestion = state.activeQuestion;
                    }
                }

                await Interview.findOneAndUpdate(
                    { roomId },
                    updateData,
                    { new: true }
                );
                console.log(`💾 Interview saved to MongoDB: ${roomId}`);

                // 3. Cleanup Redis
                await roomStore.deleteRoom(roomId);

                // 4. Notify all users in the room
                io.to(roomId).emit("interview-ended", {
                    message: "The interview has been ended by the host."
                });

            } catch (err) {
                console.error("Failed to end interview:", err);
                socket.emit("end-interview-error", { 
                    message: "Failed to save interview. Please try again." 
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);

            for (const roomId in interviewers) {
                if (interviewers[roomId] === socket.id) {
                    delete interviewers[roomId];
                    console.log(`Interviewer left room: ${roomId}`);
                    break;
                }
            }
        });
    });
};

export default setupSocket;