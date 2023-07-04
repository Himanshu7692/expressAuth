import mongoose from "mongoose";
const connectDB=async (DATABASE_URL) =>{
    try {
        const DB_Options={
            dbName:"geekshop"
        }
        await mongoose.connect(DATABASE_URL,DB_Options)
        console.log('connected sucessfully......')
    } catch (error) {
         console.log(error)
    }
}

export default connectDB