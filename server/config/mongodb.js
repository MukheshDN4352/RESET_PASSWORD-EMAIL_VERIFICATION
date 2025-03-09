import mongoose, { modelNames } from "mongoose";


const connectDb =async()=>{
  try {
  
  const conn=await  mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
  console.log(`mongodb connected: ${conn.connection.host}`)
  }catch(err){
    console.log("mongodb connection error", err.message);
  }
  // mongoose.connection.on('connected',()=>{
  //   console.log("mongodb connnected succesfully")
  // })

}

export default connectDb;