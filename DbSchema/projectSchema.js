const mongoose=require("mongoose");

const projectSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    liveLink:{
        type:String
    },
    image:{
        type:String,
     
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"video",
        
    },
    github:{
        type:String,
       
    },
    usedTechs:{
        type:[String],
        required:true
    }
})

const projectModel=mongoose.model("project",projectSchema)
   module.exports=projectModel 
