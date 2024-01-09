import express from 'express'
import env from 'dotenv'
import morgan from 'morgan';
import mongoose, { mongo } from 'mongoose';
import userRoute from './routes/user.js';
import authRoute from './routes/auth.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/order.js';
import cartRoute from './routes/cart.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
env.config();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET" , "POST" , "PUT" , "DELETE" , "PATCH"]
}));
app.use(morgan("common"));
app.use("/api/user",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/product",productRoute);
app.use("/api/cart",cartRoute);
app.use("/api/order",orderRoute);

const connect = ()=>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("Database connected...");
    }).catch((err)=>{
        throw err;
    })
}


app.listen(process.env.PORT || 5000 , (req , res)=>{
    connect();
    console.log("Server started successfully!!");
})