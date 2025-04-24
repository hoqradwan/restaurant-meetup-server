import express from 'express';
import { adminMiddleware } from '../../middlewares/auth';
import { createMenu } from './menu.controller';
const router = express.Router();

router.post("/", adminMiddleware("resturant"), createMenu);

export const MenuRoute = router;