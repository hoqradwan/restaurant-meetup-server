import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { createOffer } from "./offer.controller";
import upload from "../../middlewares/fileUploadNormal";

const router = express.Router();

router.post("/", adminMiddleware("user"), upload.single("image"), createOffer)
export const offerRoutes = router;