import { Router } from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken ,changePassword , getCurrentUser , changeUserDetails , changeUserAvatar } from "../controllers/user.controller.js";
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
    ,registerUser)

router.route("/login").post(loginUser)
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
router.route("change-details").post(
    verifyJWT,
    changeUserDetails
)
router.route("change-avatar").post(
    verifyJWT,
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    changeUserAvatar
)
export default router