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
    candidateNames: { 
        type: [String],
        default: [] 
    },
    activeQuestion: {
        type: Schema.Types.Mixed, // Can hold {title, description}
        default: null
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