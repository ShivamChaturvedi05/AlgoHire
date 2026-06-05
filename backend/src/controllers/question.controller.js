import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Question } from "../models/question.model.js";

const createQuestion = asyncHandler(async (req, res) => {
    const { title, description, testCases } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const question = await Question.create({
        interviewer: req.user._id,
        title,
        description,
        testCases: testCases || []
    });

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );
});

const getQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find({ interviewer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, questions, "Questions fetched successfully")
    );
});

const deleteQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const question = await Question.findOneAndDelete({ _id: questionId, interviewer: req.user._id });

    if (!question) {
        throw new ApiError(404, "Question not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );
});

export { createQuestion, getQuestions, deleteQuestion };
