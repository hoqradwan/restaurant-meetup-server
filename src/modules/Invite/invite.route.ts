import express from 'express';
import { createInvite } from './invite.controller';

const router = express.Router();

router.post("/",createInvite)