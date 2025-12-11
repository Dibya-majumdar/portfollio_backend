const express=require("express")
const connecetDb=require("./config/database")
const adminModel=require("./DbSchema/adminSchema")
const projectModel=require("./DbSchema/projectSchema")
const jwt=require("jsonwebtoken")
const AuthRouter=require("./jwt/verify")
const cookieParser = require("cookie-parser");
const validator=require("validator");
const bcrypt=require("bcrypt");
const cors= require("cors");


const app=express()

app.use(cors({origin:"http://localhost:3001",credentials:true}))

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

    if(key!="gourHari"){
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

//working perfectly.....
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
    if(title && description && image){
    if(title.trim()==""&& description.trim()==""){
        throw new Error("title ,description should be filled")
    }
    if(image.trim()==""){image="https://i.ibb.co/xqjVkBKT/Screenshot-2025-12-10-214903.png"}
    if(description.length>=110 || description.lengt<20 ){
        throw new Error("write within 20 to 110 words")
    }
    if( title.length>=20 ){
        throw new Error("write within 20 words")
    }
}else{
    throw new Error("pls add image,description,title")
}

    const final={
        title:title,description:description,image:image,video:video,liveLink:liveLink,usedTechs:usedTechs,github:github
    }
    const project_data=new projectModel(final);
    await project_data.save()
    res.json({
        "message":"data saved",
        "data":final
    })
    }catch(err){
        console.log(err.message)
        res.send(err.message)
    }
    
})

//done
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

//done
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
    if(Object.keys(req.body).includes("description")){
        if(description.length>=110){
            throw new Error("description should be within 40 characters");
        }
    }
     
        const data=await projectModel.findByIdAndUpdate({_id:unique_id},{
            title:title,
            image:image,
            video:video,
            description:description,
            liveLink:liveLink,
            github:github,
            usedTechs:usedTechs



        })
        res.json(data)
    }catch(err){
        console.log(err.message)
        res.send(err.message)
    }
    

})


//done
app.get("/projectsWithoutAuth",async (req,res)=>{  //no need of authentication here 
const data=await projectModel.find({});
res.json(data)
})
app.get("/projects",AuthRouter,async (req,res)=>{  //no need of authentication here 
const data=await projectModel.find({});
res.json(data)
})

//newly done
app.get("/projects/:id",AuthRouter,async (req,res)=>{  //no need of authentication here 
    const{ id}=req.params;
const data=await projectModel.find({_id:id});
res.send(data)
})




app.use("/",(req,res)=>{
    res.send("lets statrt")
})
