import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiRespose.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false })

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "Could not generate access or refresh token")
    }
}

const registerUser = asyncHandler( async (req , res) => {
    /* 
    1.Take inputs from user
    2.Check all fields not empty
    3.Check if user already exists
    4.File upload
    5.Create user in db
    6.Remove password and refresh token from response
    7.Check if user successfully created or not
    */

    const {fullname , username , email , password } = req.body
    // console.log("email : " , email);
    if(
        [fullname , username , email , password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields should be non empty")
    }

    const existedUser = await User.findOne({
        $or : [ {username} , {email} ] 
    })
    if(existedUser){
        throw new ApiError(409 , "User with the same username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is compulsary")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage = ""
    if(coverImageLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400 , "Avatar file not uploaded properly")
    }

    const user = await User.create({
        fullname ,
        avatar : avatar.url ,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser) {
        throw new ApiError(500 , "Internal Server Error :: Could not register user")
    }
    
    return res.status(201).json(
        new ApiResponse(201 , createdUser , "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    // console.log(username);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password")
    // console.log(refreshToken);
    
    const options = {
        httpOnly: true,
        secure: true
    }
    console.log(refreshToken);
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined 
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true, 
        secure : true
    };

    return res
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User logged Out successfully"))
})

const refreshAccessToken = asyncHandler(async (req , res) => {
    // console.log("hello");
    
    try {
        // console.log(req.cookies)
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!refreshToken || typeof refreshToken !== 'string') {
            throw new ApiError(401, "Unauthorized request - Refresh token missing or invalid");
        }
        // console.log(refreshToken);
        
        const decodedToken = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET)
        if(!decodedToken){
            throw new ApiError(401 , "Invalid Refresh Token")
        }
        const user = await User.findById(decodedToken._id)
        if(refreshToken !== user.refreshToken) {
            throw new ApiError(401 , "Refresh Token has expired or already used")
        }
        const {newRefreshToken , accessToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken)
        .cookie("refreshToken" , newRefreshToken)
        .json(
            new ApiResponse(
                200 , 
                {accessToken , refreshToken : newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(201 , error?.message || "Something went wrong")
    }
})

const changePassword = asyncHandler ( async (req , res) => {
    const {oldPassword , newPassword} = req.body
    console.log(oldPassword , newPassword);
    
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(401 , "Unauthorized Request");
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401 , "Password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler( async (req,res) => {
    return res.status(200).json(
        new ApiResponse(200 , {user : req.user} , "User details fetched successfully")
    )
})

const changeUserDetails = asyncHandler ( async (req , res) => {
    const {fullname , email} = req.body;
    if(!(fullname || email)){
        throw new ApiError(400 , "Nothing to change")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname , 
                email
            }
        },
        {new : true}
    ).select("-password");
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "User details updated Successfully")
    )
})

const changeUserAvatar = asyncHandler ( async (req , res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path
    if(!avatarLocalPath) {
        throw new ApiError(400 , "No image to change")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400 , "Avatar file not uploaded properly")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Updated avatar successfully")
    )
})

const changeUserCoverImage = asyncHandler ( async (req , res) => {
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400 , "No image to change")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(400 , "coverImage file not uploaded properly")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Updated coverImage successfully")
    )
})

const getUserChannelProfile = asyncHandler( async (req , res) => {
    const {username} = req.params
    if(!username?.trim()){
        return new ApiError(404 , "No username found")
    }
    const channel = await User.aggregate([
        {
            $match : {
                username : username.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "Subscription",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "Subscription",
                localField : "_id",
                foreignField : "subscriber",
                as : "channelsSubscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribedTo : {
                    $size : "$channelsSubscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : { $in : [req.users?._id , "$subscribers.subscriber"] },
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                subscribersCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                subscribedTo : 1
            }
        }
    ])
    if(!channel?.length){
        return new ApiError(404 , "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0], "Channel details fetched successfully")
    )
})

const getWatchHistory = asyncHandler( async (req , res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "Video",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "User",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullname : 1,
                                        username : 1,
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
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200 , user[0].watchHistory , "Watch History fetched successfully")
    )
})

export {registerUser , loginUser , logoutUser , refreshAccessToken , getCurrentUser , changePassword , changeUserDetails , changeUserAvatar ,changeUserCoverImage , getUserChannelProfile , getWatchHistory}