import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content){
        return new ApiError(400 , "Please provide content")
    }

    const tweet = await Tweet.create(
        {
            owner : req.user?._id,
            content
        }
    )
    if(!tweet){
        return new ApiError(500 , "Could not add tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Tweet added successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        return new ApiError(400 , "Please provide valid user id")
    }

    const allTweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "tweet",
                as : "likes"
            }
        },
        {
            $addFields : {
                likeCount : {
                    $size : "$likes"
                }
            }
        }
    ])

    if(!allTweets){
        return new ApiError(500 , "Could not fetch tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , allTweets , "Tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {tweetId} = req.params
    if(!isValidObjectId(userId)){
        return new ApiError(400 , "Please provide valid user id")
    }
    if(!content){
        return new ApiError(400 , "Please provide content")
    }  
    const Updated = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content
            }
        },
        {
            new : true
        }
    )
    if(!Updated){
        return new ApiError(500 , "Could not update tweet")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , Updated , "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        return new ApiError(400 , "Please provide valid user id")
    } 
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        return new ApiError(500 , "Could not delete tweet")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}