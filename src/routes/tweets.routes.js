import { Router } from "express";
import { 
     
} from "../controllers/tweets.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

export default router
