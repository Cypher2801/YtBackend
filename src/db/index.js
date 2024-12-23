import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import dotenv from "dotenv"
// dotenv.config()

const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
        console.log("Connected to DB");
    } catch (error) {
        console.log("Mongo Connection Error :: Error :: " , error)
        process.exit(1)
    }
} 
export default connectDb