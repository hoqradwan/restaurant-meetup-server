import express from 'express';
import { acceptInvite, createInvite } from './invite.controller';
import { adminMiddleware } from '../../middlewares/auth';
import upload from '../../middlewares/fileUploadNormal';

const router = express.Router();

// router.post("/", adminMiddleware("user"), upload.fields([
//     { name: "media", maxCount: 1 },
// ]), createInvite);
router.post("/", 
    adminMiddleware("user"), 
    upload.fields([{ name: "media", maxCount: 1 }]), // Use general upload that handles both
    createInvite
);
router.post("/accept", adminMiddleware("user"), acceptInvite);
export const inviteRoutes = router;