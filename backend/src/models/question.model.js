import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    interviewer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    testCases: [{
        input: { type: String, default: "" },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false }
    }]
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);
