import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { executeCode } from "../controllers/compiler.controller.js";

const router = Router();

router.route("/execute").post(executeCode);

export default router;