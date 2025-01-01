import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
// import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req , res) => {
    let {page = 1, limit = 10 ,query = "" , sortBy = "createdAt" , sortType = -1 , userId = ""} = req.query;
    page = Number(page)
    limit = Number(limit)
    const allVideos = await Video.aggregate([
        {
            $match : {
                $or : [
                    {title : {$regex : query , $options : "i"},},
                    {description : {$regex : query , $options : "i"},}
                ]   
                
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
        },
        {
            $addFields : {
                owner : {
                    $first : "$ownerDetails"
                }
            }
        },
        {
            $sort : {
                [sortBy] : sortType,
            }
        },
        {
            $skip : Number((page - 1) * limit)    
        },
        {
            $limit : Number(limit)
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {Videos : allVideos} , "Success")
    )
} );

const publishVideo = asyncHandler(async (req , res) => {
    const {title , description} = req.body;
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400 , "Please upload video and thumbnail")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video || !thumbnail){
        throw new ApiError(400 , "Could not upload video or thumbnail")
    }
    // console.log(video);
    const videoData = await Video.create({
        videoFile : video.url,
        thumbnail : thumbnail.url,
        title : title,
        description : description,
        duration : video.duration,
        owner : req.user._id
    })
    if(!videoData){
        throw new ApiError(400 , "Could not publish video")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {Video : videoData} , "Success")
    )
})

const getVideoById = asyncHandler(async (req , res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400 , "Please provide video id")
    }
    const video = await Video.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(videoId)
            },
        },
        {
            $lookup : {
                from : "User",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
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
        },
        {
            $lookup : { 
                from : "Like",
                localField : "_id",
                foreignField : "video",
                as : "likes"
            }
        },
        {
            $lookup : {
                from :"Comment",
                localField : "_id",
                foreignField : "video",
                as : "comments"
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                },
                likes : {
                    $size : "$likes"
                },
                commentsCount : {
                    $size : "$comments"
                },
                comments : "$comments",
                views : {
                    $sum : ["$views" , 1]
                }
            }
        }
    ])
    if(!video?.length){
        throw new ApiError(404 , "Video not found")
    }
    await Video.findByIdAndUpdate(videoId , {
        $set : {
            views : video[0].views
        }
    },  {new : true})
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {Video : video[0]} , "Success")
    )
})

const updateVideo = asyncHandler(async (req , res) => {
    const {videoId} = req.params;
    const {title , description} = req.body;
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400 , "Please provide video id")
    }
    
    if(!title && !description){
        throw new ApiError(400 , "Please provide title or description")
    }
    
    const response = await Video.findByIdAndUpdate(videoId , {
                $set : {
                    title ,
                    description
                },
            },
            {
                new : true
            }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {Video : response} , "Success")
    )
})

// const deleteVideo = asyncHandler(async (req , res) => {
//     const {videoId} = req.params;
//     if(!videoId){
//         throw new ApiError(400 , "Please provide video id")
//     }

// })

export {getAllVideos , publishVideo , getVideoById , updateVideo }