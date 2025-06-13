import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
const router = express.Router();

router.get("/",adminMiddleware());

export const GroupChatRoutes = router;