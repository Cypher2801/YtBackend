import { Router } from "express";
import { 
    registerUser , 
    loginUser , 
    logoutUser ,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    changeUserDetails,
    changeUserAvatar,
    changeUserCoverImage, 
    getUserChannelProfile,
    getWatchHistory    
} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ])
    ,registerUser
)
router.route("/login").post(
    loginUser
)
router.route("/logout").post(
    verifyJWT,
    logoutUser
)
router.route("/refresh-token").post(
    refreshAccessToken
)
router.route("/change-password").post(
    verifyJWT,
    changePassword
)
router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)
router.route("/change-details").patch(
    verifyJWT,
    changeUserDetails
)
router.route("/change-avatar").patch(
    verifyJWT,
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    changeUserAvatar
)
router.route("/change-coverImage").patch(
    verifyJWT,
    upload.fields([
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    changeUserCoverImage
)
router.route("/c/:username").get(
    verifyJWT,
    getUserChannelProfile
)
router.route("/watch-history").get(
    verifyJWT,
    getWatchHistory
)
export default router
