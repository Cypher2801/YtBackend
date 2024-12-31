import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespose.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400 , "Name and description are required")
    }
    
    const playlist = await Playlist.create({
        name,
        description,
        user : req.user?._id
    })
    if(!playlist){
        throw new ApiError(500 , "Could not create playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , playlist , "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400 , "Please provide valid user id")
    }

    const allPlaylists = await Playlist.aggregate([
        {
            $match : {
                user : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "user",
                foreignField : "_id",
                as : "user",
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
                user : {
                    $first : "$user"
                }
            }
        }
    ])

    if(!allPlaylists){
        throw new ApiError(500 , "Could not get playlists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , allPlaylists , "Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400 , "Please provide valid playlist id")
    }
    
    const playlist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup :{
                from : "users",
                localField : "user",
                foreignField : "_id",
                as : "user",
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
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "videos",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
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
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                user : {
                    $first : "$user"
                }
            }
        }
    ])

    if(!playlist){
        throw new ApiError(500 , "Could not get playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , playlist[0] , "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    console.log(!isValidObjectId(playlistId) || !isValidObjectId(videoId));
    
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400 , "Please provide valid playlist id and video id")
    }
    // console.log(playlistId , videoId);
    
    const playlistExists = await Playlist.findById(playlistId)
    // console.log(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id)))
    if(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id))){
        throw new ApiError(403 , "You are not authorized to access this playlist")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }
    if(!playlist.videos.includes(videoId)){
    playlist.videos.push(videoId)
    }
    const isVideoAdded = await playlist.save({validateBeforeSave : false})

    if(!isVideoAdded){
        throw new ApiError(500 , "Could not add video to playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , isVideoAdded , "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400 , "Please provide valid playlist id and video id")
    }
    const playlistExists = await Playlist.findById(playlistId)
    // console.log(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id)))
    if(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id))){
        throw new ApiError(403 , "You are not authorized to access this playlist")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }
    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId)
    const isVideoRemoved = await playlist.save({validateBeforeSave : false})

    if(!isVideoRemoved){
        throw new ApiError(500 , "Could not remove video from playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , isVideoRemoved , "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400 , "Please provide valid playlist id")
    }
    const playlistExists = await Playlist.findById(playlistId)
    console.log(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id)))
    if(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id))){
        throw new ApiError(403 , "You are not authorized to access this playlist")
    }
    const isPlaylistDeleted = await Playlist.findByIdAndDelete(playlistId)
    if(!isPlaylistDeleted){
        throw new ApiError(500 , "Could not delete playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const playlistExists = await Playlist.findById(playlistId)
    console.log(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id)))
    if(playlistExists && req.user && (String(playlistExists?.user) !== String(req.user?._id))){
        throw new ApiError(403 , "You are not authorized to access this playlist")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400 , "Please provide valid playlist id")
    }

    if(!name && !description){
        throw new ApiError(400 , "Please provide name or description")
    }

    let isNameUpdated = false
    let isDescriptionUpdated = false
    if(name){
        isNameUpdated = await Playlist.findByIdAndUpdate(playlistId , {
            $set :{
                name
            }
        } , {new : true})
    }
    if(description){
        isDescriptionUpdated =  await Playlist.findByIdAndUpdate(playlistId , {
            $set :{
                description
            }
        } , {new : true})
    }
    const isPlaylistUpdated = isNameUpdated || isDescriptionUpdated
    if(!isPlaylistUpdated){
        throw new ApiError(500 , "Could not update playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , isPlaylistUpdated , "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}