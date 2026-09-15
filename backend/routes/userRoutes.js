const express=require("express");
const bcrypt=require("bcryptjs");
const User=require("../models/User");
const auth=require("../middleware/authMiddleware");
const {adminOnly}=require("../middleware/roleMiddleware");
const router=express.Router();
router.get("/team",auth,adminOnly,async(req,res)=>res.json(await User.find({role:"team"}).select("-password").sort({createdAt:-1})));
router.post("/team",auth,adminOnly,async(req,res)=>{
 try{
  const {username,email,password}=req.body;
  if(!username||!email||!password) return res.status(400).json({message:"Username, email and password are required"});
  const existing=await User.findOne({$or:[{email:email.trim().toLowerCase()},{username:username.trim()}]});
  if(existing) return res.status(400).json({message:"User already exists"});
  const user=await User.create({username:username.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,10),role:"team"});
  res.status(201).json({message:"Team member created successfully",user:{id:user._id,username:user.username,email:user.email,role:user.role}});
 }catch(e){console.error(e);res.status(500).json({message:"Could not create team member"});}
});
module.exports=router;
