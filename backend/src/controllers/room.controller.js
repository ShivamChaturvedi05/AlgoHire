import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.model.js";
import { v4 as uuidv4 } from 'uuid';

const createRoom = asyncHandler(async (req, res) => {
    const interviewerId = req.user._id;

    const roomId = uuidv4();

    const room = await Interview.create({
        roomId,
        interviewer: interviewerId,
        status: "active",
        codeState: "// Start coding here...",
        language: "javascript"
    });

    if (!room) {
        throw new ApiError(500, "Something went wrong while creating the room");
    }

    return res.status(201).json(
        new ApiResponse(200, room, "Interview room created successfully")
    );
});

const getRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Interview.findOne({ roomId });

    if (!room) {
        throw new ApiError(404, "Room not found or invalid ID");
    }
    if (room.status === "completed") {
        throw new ApiError(403, "This interview has ended.");
    }

    return res.status(200).json(
        new ApiResponse(200, room, "Room data fetched successfully")
    );
});

const deactivateRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    
    const room = await Interview.findOne({ roomId, interviewer: req.user._id });    //rn, only interviwer can end the meet

    if (!room) {
        throw new ApiError(403, "You are not authorized to end this interview");
    }

    room.status = "completed";
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, room, "Interview ended successfully")
    );
});

const getUserInterviews = asyncHandler(async (req, res) => {
    const interviews = await Interview.find({ 
        interviewer: req.user._id 
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, interviews, "Interview history fetched successfully")
    );
});

export { createRoom, getRoom, deactivateRoom, getUserInterviews };