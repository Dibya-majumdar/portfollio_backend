const express=require("express")
const connecetDb=require("./config/database")
const adminModel=require("./DbSchema/adminSchema")
const projectModel=require("./DbSchema/projectSchema")
const videoModel=require("./DbSchema/videoSchema");
const jwt=require("jsonwebtoken")
const AuthRouter=require("./jwt/verify")
const cookieParser = require("cookie-parser");
const validator=require("validator");
const bcrypt=require("bcrypt");
const cors= require("cors");
require("dotenv").config();

require("dotenv").config();

const app=express()

app.use(cors({origin:process.env.FRONTEND_KEY,credentials:true}))

app.use(express.json());//for this stuff i stuck for more than 30 min

app.use(cookieParser());
async function func(){
    try{
        await connecetDb()
        app.listen(3000)
        console.log("databse connected")
    }catch(err){
        console.log("mongodb not connected ",err)
    }

}
func()

//full complete signup
app.post("/admin/signup",async (req,res)=>{
    try{
        
         const {emailId,key,password}=req.body;
        //  console.log(emailId);
         const mustdata=["emailId","key","password"];
        //  console.log(Object.keys(req.body));
        
         const checkAllKeys=mustdata.every((val)=>Object.keys(req.body).includes(val));
         if(!checkAllKeys){throw new Error("pls Fill all vlaues...")}

    if(key!=process.env.KEY){
        throw new Error("invalid credentials")
        
    }
    //validate the email
    if(!validator.isEmail(emailId)){throw new Error("Enter a valid gmail")}
    //checking the user is already presnt or not?
    const arr=await adminModel.findOne({emailId:emailId});
    console.log(arr);
  

    if(arr){ throw new Error("user exist with this gmail")}
    //checking pass length validation
    if(password==""){throw new Error("password must not be empty")}
    if(password.trim().length<4 || password.trim().length>10){throw new Error("password must be a 5 digit to 10 digit characters")}

    //password----->hashing
    const passwordHash=await bcrypt.hash(password,10);

    //saving data to database
    const admin=new adminModel({emailId:emailId,password:passwordHash})
    await admin.save()
    res.json({
        "message":"signup sussesfull"
    })
    
    }catch(err){
        res.json({"message":err.message})
    }
   })

   //login also done..........
app.post("/admin/login",async (req,res)=>{
try{
     const {emailId,password}=req.body //key not imp
     const requiredKeys=["emailId","password"]
     if(!Object.keys(req.body).every((val)=>requiredKeys.includes(val))){throw new Error("fill email and pass if you are a admin")}
     if(emailId=="" || password==""){throw new Error("input box is empty 😅")}
    const isemail=await adminModel.findOne({emailId:emailId})
    if(!isemail){
        throw new Error("you are not admin🔫")
    }
    //using bcrypt
    const pass=await bcrypt.compare(password,isemail.password)
    if(!pass){ throw new Error("invalid credentials")}
  //add jwt token here
  const token=await jwt.sign({_id:isemail._id},"portfollio")
  res.cookie("token",token)
    res.json({
        "message":"sucessfully loged in",
        "data":isemail
    })
 }catch(err){
    res.json({"message": err.message})
 }
   
})
app.get("/user",AuthRouter,(req,res)=>{
    try{
        const user=req.user;
        const validUser=adminModel.findOne({_id:user});
        // console.log(validUser);
        res.json({
        "message":"user is there!",
        
    })
    }catch(err){console.log(err.message)}
    

})
//working perfectly✅
app.post("/projects",AuthRouter,async (req,res)=>{
    try{
        const requiredKeys =["title","description","image","video","liveLink","github","usedTechs"]
    const {title,description,image,video,liveLink,github,usedTechs}=req.body
    const incomingKeys =Object.keys(req.body)//["val,val,val"]
    console.log(incomingKeys)
    const ischeck=incomingKeys.every((val)=>requiredKeys.includes(val))
    console.log(ischeck)
    if(!ischeck){
        throw new Error("keys not matched")
    }
    if(title && description&& image){
    if(title?.trim()==""&& description?.trim()==""){
        throw new Error("title ,description should be filled")
    }
    if(image.trim()==""){image="https://i.ibb.co/xqjVkBKT/Screenshot-2025-12-10-214903.png"}
    if(description?.trim().length>=200 || description?.trim().length<20 ){
        throw new Error("write description within 20 to 110 words")
    }
    if( title?.trim().length>25 ){
        throw new Error("write title within 25 words")
    }
}else{
    throw new Error("pls add description,title,image")
}
let videoId=null;
if(video && video?.trim()!=""){
  const videoData=new videoModel({
        videoUrl:video?.trim()
    })
   const savedVideo = await videoData.save();
   videoId=savedVideo._id;
}
  
    const final={
        title:title?.trim(),description:description?.trim(),image:image?.trim(),video:videoId,liveLink:liveLink?.trim(),usedTechs:usedTechs,github:github?.trim()
    }
    const project_data=new projectModel(final);
    await project_data.save()
    res.status(200).json({
        "message":"data saved",
        "data":final
    })
    }catch(err){
        console.log(err.message)
        res.status(401).json({
             "message":err.message,
        })
    }
    
})

//done✅
app.delete("/projects/:id",AuthRouter,async(req,res)=>{
    try{
        const unique_id=req.params.id;
      
const checkDb=await projectModel.findById({_id:unique_id});
console.log(checkDb);
if(!checkDb){
    throw new Error("project not found")
}
const del=await projectModel.findByIdAndDelete({_id:unique_id});
console.log(del)
res.json({
    "message":"project deleted",
    "data":del
})

    }catch(err){
        res.json({
            "message":err.message
        })
    }

})

//done✅
app.patch("/projects/:id",AuthRouter,async(req,res)=>{
    try{
        // const {title,image,video,description,liveLink,usedTechs,github}=req.body;
        const requiredKeys =["title","description","image","video","liveLink","github","usedTechs"]
  
    const incomingKeys =Object.keys(req.body)//["val,val,val"]
    // console.log(incomingKeys)
    const ischeck=incomingKeys.every((val)=>requiredKeys.includes(val))
    // console.log(ischeck)
    if(!ischeck){
        throw new Error("keys not matched")
    }

          const unique_id=req.params.id;
        const checkDb=await projectModel.findById({_id:unique_id});
        // console.log(checkDb);
        if(!checkDb){
        throw new Error("project not found")
        }
        // console.log(req.body)
     Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
    }
});
    const {title,image,video,description,liveLink,usedTechs,github}=req.body;
    if(title?.trim().length>25){throw new Error("title should be in 25 words ")}
    if(image?.trim()==""){throw new Error("image should not be empty")}
    if(Object.keys(req.body).includes("description")){
        if(description?.trim().length>=200 || description?.trim().length<20 ){
            throw new Error("description should be within 20 to 200 characters");
        }
    }
    
   
    
    //     let videoId;
    //    let videoEdit=await projectModel.findById({_id:unique_id}).populate("video","videoUrl _id");  //if video id is not presnt or videourl is not presnt then throw error
          
    //             const videoEditData=await videoModel.findById({id:videoEdit.video._id});
    //             if(!videoEditData){
    //                 if(video && video?.trim()!=""){  
    //                     const videoData=new videoModel({
    //                     videoUrl:video?.trim()
    //                     })
    //                     const savedVideo=await videoData.save();
    //                      videoId=savedVideo._id;
    //                 }
    //             }else{
    //                 videoId=videoEdit.video._id
    //             }
        
        const project = await projectModel.findById(unique_id);

    if (!project) {
      throw new Error("project not found");
    }

    let videoId = project.video;  //why proejct.video ? cause it stores id of video.


    if (video && video.trim() !== "") {

        // CASE A: video already exists → update
        if (project.video) {
            await videoModel.findByIdAndUpdate(
                project.video,                            
                { videoUrl: video.trim() }
            );
        }
        // CASE B: no video exists → create
        else {
            const videoData = new videoModel({
                videoUrl: video.trim()
            });
            const savedVideo = await videoData.save();
            videoId = savedVideo._id;
        }
    }else{
        if(project.video){
            await videoModel.findByIdAndUpdate(
                project.video,                            
                { videoUrl: video.trim() }
            );
        }
    }
  
         


 


     
        const data=await projectModel.findByIdAndUpdate({_id:unique_id},{
            title:title?.trim(),   //so if tile is null or undefined then it->(.trim()) will not give error.cause on null or undefined we can not use .trim() method
            image:image?.trim(),
            video:videoId,
            description:description?.trim(),
            liveLink:liveLink?.trim(),
            github:github?.trim(),
            usedTechs:usedTechs



        })
        res.json(data)
    }catch(err){
        console.log(err.message)
        res.status(401).json({
           "message":err.message 
        })
    }
    

})


//done
app.get("/projectsWithoutAuth",async (req,res)=>{  //no need of authentication here 
const data=await projectModel.find({}).populate("video","videoUrl _id Comments Like DisLike");
res.json(data)
})
app.get("/projects",AuthRouter,async (req,res)=>{   
const data=await projectModel.find({}).populate("video","videoUrl _id Comments Like DisLike");
res.json(data)
})

//newly done
app.get("/projects/:id",AuthRouter,async (req,res)=>{ 
    const{ id}=req.params;
const data=await projectModel.find({_id:id}).populate("video","videoUrl _id Comments Like DisLike");
res.send(data)
})
app.get("/projectsWithoutAuth/:id",async (req,res)=>{ 
    const{ id}=req.params;
const data=await projectModel.find({_id:id}).populate("video","videoUrl _id Comments Like DisLike");
res.send(data)
})

app.post("/logout",AuthRouter,(req,res)=>{
res.cookie("token",null,{expires:new Date (Date.now())})
res.json("logout");
})


app.get("/video/:id",async(req,res)=>{
    try{
        const {id}=req.params;
        const videoDaata=await videoModel.findById(id);
        if(!videoDaata){
            throw new Error("video is not present right now !");
        }
        res.status(200).json(videoDaata);
    }catch(err){
        res.status(401).json(err.message);
    }
   
})

app.post("/video/comments/:id",async(req,res)=>{
    try{
        console.log("hi")   ;
        const {id}=req.params; 
        const {comment}=req.body;
            if(comment?.trim()==""){
                throw new Error("empty can not be submitted")
            }
            const data=await videoModel.findById(id);
            if(!data){
                throw new Error("video not exist!");
            }
            
            const commentAdded=await videoModel.findByIdAndUpdate(id,
           {
            $push: { Comments: comment.trim() }
            },{ new: true })
            res.status(200).json(commentAdded);
        }catch(err){
            res.status(401).json(err.message);
        }
    
})
app.use("/",(req,res)=>{
    res.send("lets statrt")
})
