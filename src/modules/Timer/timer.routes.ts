import express from 'express';
import { adminMiddleware } from '../../middlewares/auth';
import { startMeetup, stopMeetup } from './timer.controller';
const router =  express.Router();

router.post("/start",adminMiddleware("user"), startMeetup);
router.post("/stop",adminMiddleware("user"), stopMeetup);

export const TimerRoutes = router;
