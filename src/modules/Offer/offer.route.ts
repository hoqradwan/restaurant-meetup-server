import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { acceptOffer, createOffer, getOffers } from "./offer.controller";
import upload from "../../middlewares/fileUploadNormal";

const router = express.Router();

router.post("/", adminMiddleware("user"), upload.single("image"), createOffer);
router.post("/accept", adminMiddleware("user"), acceptOffer);
router.get("/", adminMiddleware("user"), getOffers);
export const offerRoutes = router;