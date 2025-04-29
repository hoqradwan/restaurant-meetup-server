import express from 'express';
import { adminMiddleware } from '../../middlewares/auth';
import { createMenu } from './menu.controller';
const router = express.Router();

router.post("/", adminMiddleware("restaurant"), createMenu);

export const MenuRoutes = router;