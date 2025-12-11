const mongoose=require("mongoose")
const adminSchema=new mongoose.Schema({
emailId:{
    type:String,
    required:true,
    unique:true
},
// key:{
//     type:String,
//     required:true
// },
password:{
    type:String,
    required:true
}
})

const adminModel=mongoose.model("admin",adminSchema)
module.exports=adminModel