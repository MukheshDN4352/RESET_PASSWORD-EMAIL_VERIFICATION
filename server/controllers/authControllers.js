import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js";


export const register=async (req,res)=>{
    const {name,email,password} =req.body;
    if(!name || !email || !password){
        return res.json({success:false, message : " missing details"})
    }
    
    try {
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.json({success :false,message :"User already exists"});
        }

      const hashedPassword =await bcrypt.hash(password,10);
      const user=new userModel({name,email,password:hashedPassword});
      await user.save();
      
      const token =jwt.sign({id: user._id},process.env.JWT_SCERET, { expiresIn:'7d'});
      res.cookie("token",token ,{
        httpOnly:true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:process.env.NODE_ENV ==='production' ? 'none' : 'strict',
        maxAge:7*24*60*60*1000

      });

      //sending welcome email
      const mailOption = {
        from: "mukeshdn2005@gmail.com",
        to: email,
        subject: "Testing the welcome message email",
        text: `Your account has been created with email ID: ${email}`,
        html: `<h1>Welcome to our website</h1>
               <p>Your account has been created with email ID: <strong>${email}</strong></p>`
      };
      
      await transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
    });

      return res.json({success :true});


    } catch (error) {
        return res.json({success:false, message : error.message})
    
    }
}


export const login =async(req,res)=>{
    const {email, password} =req.body;
    if(!email || !password){
        return res.json({success :false,message :"email and password is required"});
    }
    try {
        const user =await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message : "user not found"})
        }
        const isMatch =await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false, message : "invalid credentials"})
        }
      const token =jwt.sign({id: user._id},process.env.JWT_SCERET, { expiresIn:'7d'});
      res.cookie("token",token ,{
        httpOnly:true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:process.env.NODE_ENV ==='production' ? 'none' : 'strict',
        maxAge:7*24*60*60*1000

      });
      return res.json({success :true});

        
        
    } catch (error) {
        return res.json({success:false, message : error.message})
    }
}

export const logout=async(req,res)=>{
    try{
        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV ==='production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none' : 'strict',
            
        })
        return res.json({success :true,message:"logged out"})

    }catch(error){
        return res.json({success:false, message : error.message})
    }
}


//send verification otp to the User's email
export const sendVerifyOtp=async (req,res)=>{
    try {
        const {userId}=req.body;
        const user=await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false, message:"account is already verified"})
        }

      const opt=String(Math.floor( 100000+ Math.random()*900000))
      user.verifyOtp=opt;
      user.verifyOtpExprireAt=Date.now()+24*60*60*1000;
      await user.save();
      
      const mailOption = {
        from: "mukeshdn2005@gmail.com",
        to: user.email,
        subject: "account verification OTP",
        // text: `Your otp is ${user.verifyOtp}. Verify your account using this OTP`,
        html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",user.verifyOtp ).replace("{{email}}",user.email)
        
      };
      
      await transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
    });
    return res.json({success :true,message:"verification OTP has been succesfully sent to your email"})   
    } catch (error) {
        return res.json({success:false, message : error.message})
    }

}
//email verification
export const verifyEmail=async(req,res)=>{
    const {userId, otp}=req.body;

    if(!userId || !otp ){
        return res.json({success:false, message : "missing the Details"})
    }

    try {

        const user=await userModel.findById(userId);
        if(!user){
            return res.json({success:false, message : "user not found"})
        }
        if(user.verifyOtp ===""|| user.verifyOtp !==otp){
            return res.json({success:false, message : "invalid otp"})
        }
        if(user.verifyOtpExprireAt <Date.now){
            return res.json({success:false, message : "otp exprired"})
        }
        user.isAccountVerified=true;
        user.verifyOtp ="";
        user.verifyOtpExprireAt=0;
        await user.save();
        return res.json({success:true, message : "email verified succesfully"})
    

    } catch (error) {
        return res.json({success:false, message : error.message})
    }
}

//cheking user is authenticated
export const isAuthenticated=async(req,res)=>{
    try {

        return res.json({success:true})
        
    } catch (error) {
        return res.json({success:false, message : error.message})
    }

}

//send password reset OTP
export const sendResetOtp =async(req,res)=>{

    
    const {email}=req.body;
    if(!email ){
        return res.json({success :false,message:"email is required to reset the password"});

    }
    try {

        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"user not found"})
        }
        const opt=String(Math.floor( 100000+ Math.random()*900000));
        user.resetOtp=opt;
        user.resetOtpExpireAt=Date.now()+15*60*1000;
        await user.save();
        
        const mailOption = {
          from: "mukeshdn2005@gmail.com",
          to: user.email,
          subject: " Password reset OTP",
        //   text: `Your otp is ${user.resetOtp}. Use this otp to proceed with resenting your password`,     
        html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",user.resetOtp).replace("{{email}}",user.email)
        };
        
        await transporter.sendMail(mailOption, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
      });
      return res.json({success :true,message:"password reset OTP has been succesfully sent to your email"})   
        
    } catch (error) {
        return res.json({success:false, message : error.message})
    
    }

}

//password reset otp
export const resetPassword=async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success: false, message:"all fields are mandatory"})
    }
    try {
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"user not found"})
        }
        if(user.resetOtp ==="" ||user.resetOtp !==otp){
            return res.json({success :false, message:"invalid otp"})
        }
        if(user.resetOtpExpireAt <Date.now()){
            return res.json({success:false,message:"Otp expired"})
        }

        const hashedPassword=await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.resetOtp="";
        user.resetOtpExpireAt =0;
        await user.save();
        return res.json({sucess:true, message:"password has been sucessfully updated"})
        
    } catch (error) {
        return res.json({success:false, message : error.message})
    }



}