import { Router } from "express"
import {
    getAllVideos,
    getVideoById,
    publishVideo,
    updateVideo
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/getAllVideos").get(
    verifyJWT,
    getAllVideos
)
router.route("/getVideoById/:videoId").get(
    verifyJWT,
    getVideoById
)
router.route("/publishVideo").post(
    verifyJWT,
    upload.fields([
        {
            name : "video",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    publishVideo
)
router.route("/updateVideo/:videoId").post(
    verifyJWT,
    updateVideo
)
export default router