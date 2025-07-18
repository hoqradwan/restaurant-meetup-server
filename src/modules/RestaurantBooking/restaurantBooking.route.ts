import express from 'express';
import { adminMiddleware } from '../../middlewares/auth';
import { bookRestaurant, getAllRestaurantBookings, getAllRestaurantBookingsByUser } from './restaurantBooking.controller';

const router = express.Router();
router.get("/", adminMiddleware("restaurant"), getAllRestaurantBookings)
router.get("/user", adminMiddleware("user"), getAllRestaurantBookingsByUser)
router.post("/", adminMiddleware("user"), bookRestaurant)
export const RestaurantBookingRoutes = router;

// accept ivite
// entry into offer

