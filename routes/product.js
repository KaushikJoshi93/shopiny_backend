import express from "express";
import Product from '../models/Product.js'
import { verifyTokenAndAdmin } from "./verifyToken.js";

const router = express.Router();

// CREATE
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted....");
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET PRODUCT
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        let products;
        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(5);
        } else if (qCategory) {
            products = await Product.find({ categories: { $in: [qCategory] } });
        } else {
            products = await Product.find();
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET PRODUCT BY CATERGORY
router.get("/category", async (req, res) => {
    try {
        const { category , price , size } = req.query;
        let whereClause = {}
        if(category){
            const catList = category.includes(",") ? category.split(",") : [category];
            whereClause = {
                categories: { $in: catList }
            }
        }
        if(price){
            if(!parseInt(price))return res.status(500).json({ status: false, message: "Price is not valid number!!" });
            whereClause.price = {
                $lte : parseInt(price)
            }
        }
        if(size){
            const sizeLst = size.includes(",") ? size.split(",") : [size];
            whereClause.size = {
                $in:sizeLst
            }
        }
        const products = await Product.find(whereClause);
        res.status(200).json({
            status: true,
            products
        })
    } catch (err) {
        res.status(500).json({ status: false, message: err.message })
    }
});

// GET AVAILABLE CATEGORIES
router.get("/getAllAvailableCategories",async(req , res)=>{
    try {
        let all_categories = await Product.aggregate([
            {
                $unwind:"$categories"
            },
            {
                $group: {
                    _id: "$categories"
                  },
            },
            {
                $project: {
                  _id: 0, // Exclude the _id field
                  category: "$_id"
                },
              },
        ])
        res.status(200).json({status:true , all_categories})
    } catch (err) {
        res.status(500).json({status:false , message:err.message})
    }
})



export default router;
