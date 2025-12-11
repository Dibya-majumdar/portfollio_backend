const jwt=require("jsonwebtoken")
const adminModel=require("../DbSchema/adminSchema")


const AuthRouter=async(req,res,next)=>{
    try{
        const token = req.cookies.token;
        // console.log(token)
         const user_id=await jwt.verify(token,"portfollio");
    if(! user_id){
        throw new Error("pls login first ")
    }
    const data=adminModel.findOne({_id:user_id});
    if(!data){
        throw new Error("admin not found");
    }
    req.user=user_id;
    return next(); 
    }catch(err){
        res.status(401).json({
            "custom error message":err.message}
        )
    }
   
// next();
}
module.exports=AuthRouter