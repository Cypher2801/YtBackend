import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/likes.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/video/:videoId").get(
    verifyJWT,
    toggleVideoLike
)
router.route("/comment/:commentId").get(
    verifyJWT,
    toggleCommentLike
)
router.route("/tweet/:tweetId").get(
    verifyJWT,
    toggleTweetLike
)
router.route("/getLikedVideos").get(
    verifyJWT,
    getLikedVideos
)

export default router
