import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { TermsRoutes } from "../modules/Terms/Terms.route";
import { AboutRoutes } from "../modules/About/About.route";
import { PrivacyRoutes } from "../modules/privacy/Privacy.route";
import { NotificationRoutes } from "../modules/notifications/notification.route";
import { feedBackRoutes } from "../modules/Feedback/feedback.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { PostRoutes } from "../modules/Post/post.route";
import { MenuRoutes } from "../modules/Menu/menu.route";
import { inviteRoutes } from "../modules/Invite/invite.route";

const router = express.Router();

router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/menu", MenuRoutes); 
router.use("/api/v1/invite", inviteRoutes); 
router.use("/api/v1/post", PostRoutes);
router.use("/api/v1/terms", TermsRoutes);
router.use("/api/v1/about", AboutRoutes);
router.use("/api/v1/privacy", PrivacyRoutes);
router.use("/api/v1/notification", NotificationRoutes);
router.use("/api/v1/feedback", feedBackRoutes);
router.use("/api/v1/purchase", paymentRoutes);

export default router;
