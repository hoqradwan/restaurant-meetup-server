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
import { offerRoutes } from "../modules/Offer/offer.route";
import { RestaurantRoutes } from "../modules/Restaurant/restaurant.route";
import { RestaurantBookingRoutes } from "../modules/RestaurantBooking/restaurantBooking.route";

const router = express.Router();

router.use("/user", UserRoutes);
router.use("/menu", MenuRoutes); 
router.use("/invite", inviteRoutes); 
router.use("/offer", offerRoutes); 
router.use("/restaurant", RestaurantRoutes); 
router.use("/restaurantBooking", RestaurantBookingRoutes); 
router.use("/post", PostRoutes);
router.use("/terms", TermsRoutes);
router.use("/about", AboutRoutes);
router.use("/privacy", PrivacyRoutes);
router.use("/notification", NotificationRoutes);
router.use("/feedback", feedBackRoutes);
router.use("/purchase", paymentRoutes);

export default router;
