import express from 'express';
import { acceptInvite, createInvite } from './invite.controller';
import { adminMiddleware } from '../../middlewares/auth';
import upload from '../../middlewares/fileUploadNormal';

const router = express.Router();

router.post("/", adminMiddleware("user"), upload.single("image"), createInvite);
router.post("/accept", adminMiddleware("user"),  acceptInvite);
export const inviteRoutes = router;