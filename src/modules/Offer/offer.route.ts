import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { acceptOffer, createOffer } from "./offer.controller";
import upload from "../../middlewares/fileUploadNormal";

const router = express.Router();

router.post("/", adminMiddleware("user"), upload.single("image"), createOffer);
router.post("/accept", adminMiddleware("user"), acceptOffer);
export const offerRoutes = router;