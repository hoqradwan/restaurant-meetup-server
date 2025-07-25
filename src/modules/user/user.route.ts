import express from "express";

import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  verifyForgotPasswordOTP,
  changePassword,
  updateUser,
  getSelfInfo,
  getAllUsers,
  deleteUser,
  adminloginUser,

  resturantloginUser,
} from "./user.controller";
import upload from "../../middlewares/fileUploadNormal";
import { adminMiddleware } from "../../middlewares/auth";

const router = express.Router();
router.post(
  "/register",
  upload.fields([{ name: "media", maxCount: 1 }, { name: "idPhoto[front]", maxCount: 1 }, { name: "idPhoto[back]", maxCount: 1 }]),
  registerUser,
);
router.post("/login", loginUser);
router.post("/admin-login", adminloginUser);
router.post("/restaurant-login", resturantloginUser);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend", resendOTP);
router.post("/verify-forget-otp", verifyForgotPasswordOTP);
router.post("/change-password", changePassword);
router.post("/update", upload.single("image"), updateUser);

router.get("/my-profile", getSelfInfo);
router.get("/all", adminMiddleware("admin"), getAllUsers);

router.post("/delete", adminMiddleware("admin"), deleteUser);

export const UserRoutes = router;
