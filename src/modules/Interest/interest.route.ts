import express from 'express';
import { adminMiddleware } from '../../middlewares/auth';
import { createInterest } from './interest.controller';

const router = express.Router();
router.post("/", adminMiddleware("admin"), createInterest);

export const InterestRoute = router;