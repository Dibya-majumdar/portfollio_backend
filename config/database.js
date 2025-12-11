const connecetion_String="mongodb+srv://majumdardibya700:VyPPvjRH9XXKueEu@cluster0.4cwur.mongodb.net/Portfollio"

const mongoose=require("mongoose")

const connectDb=async ()=>{
    await mongoose.connect(connecetion_String)
}
module.exports=connectDb