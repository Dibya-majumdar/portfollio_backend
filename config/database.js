const connecetion_String=process.env.DB_SECREAT;

const mongoose=require("mongoose")

const connectDb=async ()=>{
    await mongoose.connect(connecetion_String)
}
module.exports=connectDb