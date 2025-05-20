import express  from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { createOffer } from "./offer.controller";

const router = express.Router();

router.post("/", adminMiddleware("user"),createOffer)
export const offerRoutes = router;