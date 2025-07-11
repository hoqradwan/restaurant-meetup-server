import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { getGroupChats } from "./groupChat.controller";
const router = express.Router();

router.get("/",adminMiddleware(),getGroupChats );

export const GroupChatRoutes = router;