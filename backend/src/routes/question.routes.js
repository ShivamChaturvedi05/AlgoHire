import { Router } from "express";
import { createQuestion, getQuestions, deleteQuestion } from "../controllers/question.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route("/").post(createQuestion).get(getQuestions);
router.route("/:questionId").delete(deleteQuestion);

export default router;
