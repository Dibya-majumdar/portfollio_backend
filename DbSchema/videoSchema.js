const mongoose=require("mongoose");
const videoSchema=new mongoose.Schema({
    videoUrl:{
        type:String
    },
    Like:{
        type:Number
    },
    DisLike:{
        type:Number
    },
    Comments:{
        type:[String]
    }
})
const videoModel=new mongoose.model("video",videoSchema);
module.exports=videoModel;