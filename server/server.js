import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDb from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js";

dotenv.config();
const app=express();
const port=process.env.PORT;
connectDb();
const allowedOrigins=['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials:true}));

//API ENDPOINTS 
app.get("/",(req,res)=>{
    res.send("hello is working");
})
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)

app.listen(port,()=> {
    console.log(`server is running on port ${port}`)  
});


