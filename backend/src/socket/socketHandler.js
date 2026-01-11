import { Interview } from "../models/interview.model.js";

const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", async ({ roomId, userId, role }) => {
            socket.join(roomId);
            
            if (role === 'interviewer') {
                socket.emit("room-joined", { status: "approved" });
            } else {
                socket.to(roomId).emit("user-waiting", { 
                    userId, 
                    socketId: socket.id 
                });
            }
        });

        socket.on("admit-candidate", ({ socketId }) => {
    
            io.to(socketId).emit("room-joined", { status: "approved" });

        });

        
    });
};

export default setupSocket;