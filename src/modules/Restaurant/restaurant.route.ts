import express from 'express';

import { adminMiddleware } from '../../middlewares/auth';
import { createRestaurant } from './restaurant.controller';

const router = express.Router();
router.post("/", adminMiddleware("admin"), createRestaurant);
export const RestaurantRoutes = router;

