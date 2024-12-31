import { Router } from "express";
import { 
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweets.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();
router.route("/createTweet").post(
    verifyJWT,
    createTweet
)
router.route("/getUserTweets/:userId").get(
    verifyJWT,
    getUserTweets
)
router.route("/updateTweet/:tweetId").patch(
    verifyJWT,
    updateTweet
)
router.route("/deleteTweet/:tweetId").get(
    verifyJWT,
    deleteTweet
)
export default router
