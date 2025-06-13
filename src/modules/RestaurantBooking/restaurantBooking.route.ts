import express from 'express';

import { adminMiddleware } from '../../middlewares/auth';
import { bookRestaurant, getAllRestaurantBookings } from './restaurantBooking.controller';

const router = express.Router();
router.get("/", adminMiddleware("restaurant"), getAllRestaurantBookings)
router.post("/", adminMiddleware("user"), bookRestaurant)
export const RestaurantBookingRoutes = router;

