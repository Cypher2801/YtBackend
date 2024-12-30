import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        return new ApiError(400 , "Please provide valid video id")
    }
    const comments = await Comment.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
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
            }
        },{
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "comment",
                as : "likes"
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$ownerDetails"
                },
                likes : {
                    $size : "$likes"
                }
            }
        },
        {
            $skip  : (page - 1) * limit
        },
        {
            $limit : limit
        }
    ])
    
    if(!comments || !(comments?.length)){
        return new ApiError(404 , "No comments found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {comments : comments[0]} , "Success")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    if(!isValidObjectId(videoId)){
        return new ApiError(400 , "Please provide valid video id")
    }
    if(!content){
        return new ApiError(400 , "Please provide content")
    }

    const comment = await Comment.create(
        {
            video : videoId,
            owner : req.user?._id,
            content
        }
    )
    if(!comment){
        return new ApiError(500 , "Could not add comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {commentId} = req.params
    if(!isValidObjectId(commentId)) return new ApiError(400 , "Please provide valid comment id")
    if(!content) return new ApiError(400 , "Please provide content")
    const comment = await Comment.findByIdAndUpdate(commentId , 
        {
            $set : {
                content
            }
        },
        {new : true}
    )
    if(!comment){
        return new ApiError(500 , "Could not update comment")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)) return new ApiError(400 , "Please provide valid comment id")
    const comment = await Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId))
// console.log(comment);
    if(!comment){
        return new ApiError(500 , "Could not delete comment")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }