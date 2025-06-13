import express from 'express';

import { adminMiddleware } from '../../middlewares/auth';
import { bookRestaurant } from './restaurantBooking.controller';

const router = express.Router();
router.post("/book", adminMiddleware("user"), bookRestaurant)
export const RestaurantBookingRoutes = router;

