import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({limit : "16kb"}))
app.use(urlencoded({limit : "16kb" , extended : true}))
app.use(express.static("public"));
app.use(cookieParser())

//router import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/likes.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import commentRouter from "./routes/comments.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweets.routes.js"
//routes

app.use("/api/v1/users" , userRouter)
app.use("/api/v1/videos" , videoRouter)
app.use("/api/v1/likes" , likeRouter)
app.use("/api/v1/playlists" , playlistRouter)
app.use("/api/v1/comments" , commentRouter)
app.use("/api/v1/subscriptions" , subscriptionRouter)
app.use("/api/v1/tweets" , tweetRouter)

export {app};