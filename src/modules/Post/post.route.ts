import express from "express";

const router = express.Router();

import {
  commentAPost,
  createPost,
  getAllPosts,
  likeAPost,

} from "./post.controller";

import upload from "../../middlewares/fileUploadNormal";
import { adminMiddleware } from "../../middlewares/auth";
router.post('/', adminMiddleware("user"), upload.fields([
  { name: "image", maxCount: 1 },
]), createPost);
router.get('/', adminMiddleware("user"), getAllPosts);
router.post('/like/:postId', adminMiddleware("user"), likeAPost);
router.post('/comment/:postId', adminMiddleware("user"), commentAPost);

export const PostRoutes = router;