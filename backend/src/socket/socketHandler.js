import { Interview } from "../models/interview.model.js";

const interviewers = {}; 

const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", ({ roomId, userId, role }) => {
            socket.join(roomId);

            if (role === "interviewer") {
                interviewers[roomId] = socket.id;
                
                socket.emit("room-joined", { status: "approved" });
            } else {
                const interviewerSocketId = interviewers[roomId];

                if (interviewerSocketId) {
                    io.to(interviewerSocketId).emit("user-waiting", {
                        userId,
                        socketId: socket.id
                    });
                } else {
                    console.log("No interviewer found for room:", roomId);
                }
            }
        });

        socket.on("admit-candidate", ({ socketId }) => {
            io.to(socketId).emit("room-joined", { status: "approved" });
        });

        socket.on("code-change", ({ roomId, code }) => {
            //console.log(`🎨 CodeChange ${code} from ${socket.id}`);
            socket.to(roomId).emit("code-update", code);
        });

        socket.on("language-change", ({ roomId, language }) => {
            io.to(roomId).emit("language-update", language);
        });

        socket.on("whiteboard-draw", ({ roomId, data }) => {
            // console.log(`🎨 WB Draw in ${roomId} from ${socket.id}`);
            socket.to(roomId).emit("whiteboard-update", data);
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