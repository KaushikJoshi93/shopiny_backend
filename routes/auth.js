import express from "express";
import User from '../models/User.js'
import CryptoJS from "crypto-js";
import Jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register",async(req , res)=>{
    const newUser = new User({...req.body,
        password: CryptoJS.AES.encrypt(req.body.password , process.env.PASS_SEC).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// LOGIN

router.post("/login" , async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email}).select("+password");
        if(!user){
            return res.status(404).json("Wrong credentials!!");
        }
        else{
            const hashedPass = CryptoJS.AES.decrypt(user.password , process.env.PASS_SEC);
            const Originalpassword = hashedPass.toString(CryptoJS.enc.Utf8);
            if(Originalpassword != req.body.password){
                return res.status(404).json("Wrong credentials!!");
            }
            else{
                const accessToken = Jwt.sign({
                    id:user._id,
                    isAdmin:user.isAdmin,
                } , process.env.JWT_SEC , {expiresIn:"3 days"});
                if(user.isAdmin){
                    const {password , ...others} = user.toObject();
                    return res.status(200).json({...others , accessToken});
                }
                else{
    
                    const {password , ...others} = user.toObject();
                    return res.cookie("token" , accessToken , {
                        credentials:true,
                        httpOnly:true,
                        // sameSite:"none",
                        expires:new Date(Date.now() + 3 * 24 * 60 *60*1000),
                    }).status(200).json(others);
                }
            }
        } 
        

    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
})


router.get("/logout" , async(req , res)=>{
    try {
        console.log(req.cookies)
        if(req.cookies.token){
            console.log("inside")
          return res.clearCookie("token").status(200).json({message:"Logged Out"})
        }
        return res.status(200).json({message:"Logged Out"});
    } catch (err) {
        res.status(500).json(err)
    }
})



export default router;
