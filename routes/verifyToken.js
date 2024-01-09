import Jwt from "jsonwebtoken"
import User from "../models/User.js";

const verifyToken = async(req , res , next)=>{
    try {
        const accessToken = req.cookies.token;
        // const accessToken2 = req.headers.token.split(" ")[1];
        // console.log(accessToken2);
        if(accessToken){
            Jwt.verify(accessToken , process.env.JWT_SEC , async(err , user)=>{
                if(err){
                    return res.status(403).json("Token is not valid!!");
                }
                req.user = await User.findById(user.id);
                if(!req.user){
                    return res.status(500).json({status:false , message:"No User Found!!"})
                }
                next();
            });
        }else{
            return res.status(401).json("You are not authenticated!!");
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export const verifyTokenAndAuthorization = (req , res , next)=>{
    verifyToken(req,res , ()=>{
        if(req.user._id === req.params.id || req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You are not allowed to do that!!");
        }
    })
}

export const verifyTokenAndAdmin = (req , res , next)=>{
    verifyToken(req , res , ()=>{
        if(req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You are not allowed to do that!!");
        }
    });
}

export default verifyToken;