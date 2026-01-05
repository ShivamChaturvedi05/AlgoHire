import mongoose, {Schema} from "mongoose";

const interviewSchema = new Schema({
    roomId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    interviewer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    candidateName: { 
        type: String,
        default: "Guest Candidate" 
    },
    codeState: { 
        type: String, 
        default: "" 
    },
    language: {     //code
        type: String, 
        default: "javascript" 
    },
    whiteboardState: { 
        type: Array, // Excdraw elements
        default: [] 
    },
    status: { 
        type: String, 
        enum: ['active', 'completed'], 
        default: 'active' 
    }
}, {timestamps: true});

export const Interview = mongoose.model("Interview", interviewSchema);