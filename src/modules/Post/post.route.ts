import express from "express";

const router = express.Router();

import {
  createPost,

} from "./post.controller";

import upload from "../../middlewares/fileUploadNormal";
import { adminMiddleware } from "../../middlewares/auth";
router.post('/', adminMiddleware("user"), upload.single("image"), createPost);

export const PostRoutes = router;