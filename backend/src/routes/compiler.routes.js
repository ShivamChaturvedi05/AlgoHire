import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { executeCode, executeTests } from "../controllers/compiler.controller.js";

const router = Router();

router.route("/execute").post(executeCode);
router.route("/run-tests").post(executeTests);

export default router;