import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/createPlaylist").post(
    verifyJWT,
    createPlaylist
)
router.route("/getUserPlaylists/:userId").get(
    verifyJWT,
    getUserPlaylists
)
router.route("/getPlaylistById/:playlistId").get(
    verifyJWT,
    getPlaylistById
)
router.route("/addVideoToPlaylist/:playlistId/:videoId").get(
    verifyJWT,
    addVideoToPlaylist
)
router.route("/removeVideoFromPlaylist/:playlistId/:videoId").get(
    verifyJWT,
    removeVideoFromPlaylist
)
router.route("/deletePlaylist/:playlistId").get(
    verifyJWT,
    deletePlaylist
)
router.route("/updatePlaylist/:playlistId").patch(
    verifyJWT,
    updatePlaylist
)


export default router
