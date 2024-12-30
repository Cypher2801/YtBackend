import mongoose  from "mongoose";

const playlistSchema = new mongoose.Schema({
    videos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    description : {
        type : String
    },
    name : {
        type : String,
        required : true 
    }
} , {timestamps : true})

export const Playlist = mongoose.model("Playlist" , playlistSchema)
