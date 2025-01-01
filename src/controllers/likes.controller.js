import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Please provide valid video id")        
    }
    const isVideoLiked = await Like.aggregate([
        {
            $match : {
                $and : [
                    {video : new mongoose.Types.ObjectId(videoId)},
                    {likedBy : new mongoose.Types.ObjectId(req.user._id)}
                ]
            }
        }
    ])
    if(isVideoLiked?.length > 0){
        await Like.findByIdAndDelete(isVideoLiked[0]._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Video unliked" , "Success")
        )
    }
    else{
        const like = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Video Liked" , "Success")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Please provide valid comment id")        
    }
    const isCommentLiked = await Like.aggregate([
        {
            $match : {
                $and : [
                    {comment : new mongoose.Types.ObjectId(commentId)},
                    {likedBy : new mongoose.Types.ObjectId(req.user._id)}
                ]
            }
        }
    ])
    if(isCommentLiked?.length > 0){
        await Like.findByIdAndDelete(isCommentLiked[0]._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Comment unliked" , "Success")
        )
    }
    else{
        const like = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Comment Liked" , "Success")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "Please provide valid tweet id")        
    }
    const isTweetLiked = await Like.aggregate([
        {
            $match : {
                $and : [
                    {tweet : new mongoose.Types.ObjectId(tweetId)},
                    {likedBy : new mongoose.Types.ObjectId(req.user._id)}
                ]
            }
        }
    ])
    if(isTweetLiked?.length > 0){
        await Like.findByIdAndDelete(isTweetLiked[0]._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "tweet unliked" , "Success")
        )
    }
    else{
        const like = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "tweet Liked" , "Success")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match : {
                $and : [
                    {likedBy : new mongoose.Types.ObjectId(req.user._id)},
                    {video : {$exists : true}}
                ]
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "video",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "ownerDetails",
                            pipeline : [
                                {
                                    $project : {
                                        username : 1,
                                        fullname : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$ownerDetails"
                            }
                        }
                    }
                ]
            }
        }
    ])
    if(!likedVideos && likedVideos?.length < 1){
        throw new ApiError(404 , "No liked videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {likedVideos} , "Success")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}