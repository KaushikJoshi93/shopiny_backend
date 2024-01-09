import express from "express";
import verifyToken, { verifyTokenAndAdmin, verifyTokenAndAuthorization } from './verifyToken.js'
import Order from '../models/Order.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = express.Router();

// CREATE
router.post("/"  ,verifyToken ,  async(req , res)=>{
    // const newOrder = new Order(req.body);
    try {
        const razor_instance = new Razorpay({
            key_id:process.env.RAZOR_KEY_ID,
            key_secret:process.env.RAZOR_KEY_SECRET
        });
        // const savedOrder = await newOrder.save();

        const options = {
            amount:parseInt(req.body.amount + "00"),
            currency:req.body.currency,
            receipt:"receipt_order_"+new Date().getTime(),
        }
        
        const order = await razor_instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json(err);
    }
});

// VERIFY PAYMENT SUCCESS
router.post("/success",verifyToken, async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", process.env.RAZOR_KEY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).json({
            msg:"Error: Please try again later!!",
            err:error
        });
    }
});

// UPDATE
router.put("/:id" , verifyTokenAndAdmin , async (req , res)=>{
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set:req.body,
            },
            {new:true}
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE
router.delete("/:id" , verifyTokenAndAdmin , async(req,res)=>{
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order has been deleted....");
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER Order
router.get("/find/:userId" ,verifyToken, async(req , res)=>{
    try {
        const orders = await Order.find({userId:req.params.userId});
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL
router.get("/" , verifyTokenAndAdmin , async(req , res)=>{
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MONTHLY INCOME
router.get("/income" , verifyTokenAndAdmin , async(req , res)=>{
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
    try {
        const income = await Order.aggregate([
            {$match : {createdAt : {$gte: previousMonth}}},
            {
                $project:{
                    month : {$month : "$createdAt"},
                    sales: "$amount"
                },
                $group:{
                    _id : "$month",
                    total: {$sum : "$sales"},
                }
            }
        ]);

        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
})


export default router;
