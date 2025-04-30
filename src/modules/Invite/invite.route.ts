import express from 'express';
import { createInvite } from './invite.controller';
import { adminMiddleware } from '../../middlewares/auth';
import upload from '../../middlewares/fileUploadNormal';

const router = express.Router();

router.post("/", adminMiddleware("user"), upload.single("image"), createInvite);
export const inviteRoutes = router;