import { Router } from "express";
import { createRoom, getRoom, deactivateRoom } from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createRoom);

router.route("/:roomId/end").post(verifyJWT, deactivateRoom);

router.route("/:roomId").get(getRoom);

export default router;