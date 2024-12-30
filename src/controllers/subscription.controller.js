import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) return new ApiError(400 , "Please provide valid channel id")
    const isSubscribed = await Subscription.aggregate([
        {
            $match : {
                $and : [
                    {subscriber : new mongoose.Types.ObjectId(req.user._id)},
                    {channel : new mongoose.Types.ObjectId(channelId)}
                ]
            },
        }
    ])
    if(isSubscribed?.length > 0){
        await Subscription.findByIdAndDelete(isSubscribed[0]._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Unsubscribed" , "Success")
        )
    }
    else{
        await Subscription.create({
            subscriber : req.user?._id,
            channel : channelId
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200 , "Subscribed" , "Success")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) return new ApiError(400 , "Please provide valid channel id")
    const subscribers = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    if(!subscribers?.length > 0) return new ApiError(404 , "No subscribers found")
    console.log(subscribers);
    
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {subscribersCount : subscribers.length} , "Success")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)) return new ApiError(400 , "Please provide valid channel id")
        const subscribers = await Subscription.aggregate([
            {
                $match : {
                    subscriber : new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "channel",
                    foreignField : "_id",
                    as : "channel",
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
                    channel : {
                        $first : "$channel"
                    }
                }
            }
        ])
    
        if(!subscribers?.length > 0) return new ApiError(404 , "No subscribers found")
    
        return res
        .status(200)
        .json(
            new ApiResponse(200 , {
                subscribedChannels : subscribers , 
                subscribedChannelCount : subscribers.length
            } , "Success")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}