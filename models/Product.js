import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type:String , 
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    img:{
        type:String,
        required:true,
    },
    categories:{
        type:Array,
        required:true,
    },
    size:{
        type:Array,
        default:[]
    },
    color:{
        type:Array,
        default:[]
    },
    price:{
        type:Number,
        required:true,
    },
    isStock:{
        type:Boolean,
        default:true
    }
    
    
} , {timestamps:true})

export default mongoose.model("products" , productSchema);