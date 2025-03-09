import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const {backendUrl}=useContext(AppContent);
  axios.defaults.withCredentials =true;
    const navigate=useNavigate();
    const [email,setEmail]=useState("")
    const [newPassword,setNewpassword]=useState("")
    const [isEmailSent ,setEmailSent]=useState('');
    const [otp ,setotp]=useState("");
    const[isOtpSubmitted, setOtpSubmitted]=useState('');

    const inputrefs=React.useRef([]);

    const handleInput=(e,index)=>{
            if(e.target.value.length>0 && index<inputrefs.current.length-1){
                inputrefs.current[index+1].focus();
            }
    
        }
        const handleKeyDown=(e,index)=>{
            if(e.key ==="Backspace" && e.target.value===''&& index>0){
                inputrefs.current[index-1].focus();
            }   
        }
        

        const handlePaste=(e)=>{
            const paste=e.clipboardData.getData('text');
            const pasteArray=paste.split('');
            pasteArray.forEach((char,index)=>{
                if(inputrefs.current[index]){
                    inputrefs.current[index].value=char;
                }
            })
        }

        const onSubmitEmail=async(e)=>{
          e.preventDefault();
          try {
            const {data}=await axios.post(backendUrl+'/api/auth/send-reset-otp',{email})
            if(data.success ===true){
              toast.success(data.message);

            }else{
              toast.error(data.message)
            }
            data.success && setEmailSent(true);
          } catch (error) {
            toast.error(error.message);
            
          }
        }
        
        const onSubmitOtp =async(e)=>{
          e.preventDefault();
          const otpArray = inputrefs.current.map(input => input?.value || ""); 

          setotp(otpArray.join(''));
          setOtpSubmitted(true)
        }


        const onSubmitNewPassword=async(e)=>{
          e.preventDefault();
          try {
            const {data}=await axios.post(backendUrl+'/api/auth/reset-password',{email,otp,newPassword})
            data.sucess ? toast.success(data.message) :toast.error(data.message)
            data.sucess && navigate("/login")
          } catch (error) {
            toast.error(error.message);
          }
        }
  return (
    <div className='flex items-center justify-center min-h-screen  bg-gradient-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate('/')}src={assets.logo} alt=''className=' absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
        {/* enter the email Id*/}
        {!isEmailSent && 
        <form  onSubmit={onSubmitEmail}className='bg-slate-900 p-8 rounded-lg shawdow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input 
            type="email" placeholder='email Id'
             className='bg-transparent outline-none text-white'  
             value={email} onChange={e => setEmail(e.target.value)}  
             required />
            
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'> Submit</button>

        </form>
}

         {/* otp input form */}
         {!isOtpSubmitted && isEmailSent &&
         <form  onSubmit={onSubmitOtp}className='bg-slate-900 p-8 rounded-lg shawdow-lg w-96 text-sm'>  
            <h1 className='text-white text-2xl font-semibold text-center mb-4'> Reset password OTP</h1>
            <p className='text-center mb-6 text-indigo-300'> Enter the 6-digit-code sent to your email Id.</p>
            <div className='flex justify-between mb-8 ' onPaste={handlePaste} >
                 {Array(6).fill(0).map((_,index)=>(
                    <input type="text " maxLength='1' key={index} required
                    className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                    ref={e => inputrefs.current[index]=e}
                    onInput={(e)=>handleInput(e,index)}
                    onKeyDown={(e)=>handleKeyDown(e,index)}
                    />
              ))}

            </div>
            <button className='w-full py-2.5  bg-gradient-to-r from-indigo-500  to-indigo-900 text-white rounded-full'> submit </button>

         </form>
}

         {/* enter new password */}
         {isOtpSubmitted && isEmailSent &&
         <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shawdow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'> New password </h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input 
            type="password" placeholder='New password'
             className='bg-transparent outline-none text-white'  
             value={newPassword} onChange={e => setNewpassword(e.target.value)}  
             required />
            
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'> Submit</button>

        </form>
}

     
    </div>
  )
}

export default ResetPassword
