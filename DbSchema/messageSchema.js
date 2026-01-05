const mongoose=require("mongoose");
const messageSchema=mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    emailId:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
})
const messageModal=mongoose.model("message",messageSchema);
module.exports=messageModal