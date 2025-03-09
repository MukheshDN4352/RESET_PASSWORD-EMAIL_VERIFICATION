import jwt from "jsonwebtoken";

const userAuth=async(req,res,next)=>{
  
    const {token}=req.cookies;
    if(!token){
       return  res.json({sucess:false, message:"not Authorized login again"})
    }
    try {
      
      const tokenDecoded=jwt.verify(token, process.env.JWT_SCERET);
      
      if(tokenDecoded.id){
        req.body.userId=tokenDecoded.id;
      }else{
        return res.json({sucess:false, message:"not Authorized login again"})
      }
      next();
        
    } catch (error) {
       return res.json({sucess:false, message:error.message})
        
    }
}

export default userAuth;
