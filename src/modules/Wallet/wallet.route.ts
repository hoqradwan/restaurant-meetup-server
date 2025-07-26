import express from "express";
import { adminMiddleware } from "../../middlewares/auth";
import { getMyWallet, rechargeBalance, withdrawBalance } from "./wallet.controller";

const router = express.Router();

router.get('/',adminMiddleware("user","restaurant"), getMyWallet);
router.post('/recharge',adminMiddleware("user","restaurant"), rechargeBalance);
router.post('/withdraw',adminMiddleware("user","restaurant"), withdrawBalance);

export const walletRoutes = router;




