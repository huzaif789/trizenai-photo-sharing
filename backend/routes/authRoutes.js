const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const router=express.Router();
router.post("/register",async(req,res)=>{
 try{
  const {username,email,password}=req.body;
  if(!username||!email||!password) return res.status(400).json({message:"Username, email and password are required"});
  if(password.length<6) return res.status(400).json({message:"Password must be at least 6 characters"});
  const existing=await User.findOne({$or:[{email:email.trim().toLowerCase()},{username:username.trim()}]});
  if(existing) return res.status(400).json({message:"User already exists"});
  const user=await User.create({username:username.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,10),role:"admin"});
  res.status(201).json({message:"Admin registered successfully",user:{id:user._id,username:user.username,email:user.email,role:user.role}});
 }catch(e){console.error("Register error:",e);res.status(500).json({message:"Server error"});}
});
router.post("/login",async(req,res)=>{
 try{
  const {email,password}=req.body;
  const user=await User.findOne({email:(email||"").trim().toLowerCase()});
  if(!user||!(await bcrypt.compare(password||"",user.password))) return res.status(400).json({message:"Invalid email or password"});
  const token=jwt.sign({userId:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:"7d"});
  res.json({message:"Login successful",token,user:{id:user._id,username:user.username,email:user.email,role:user.role}});
 }catch(e){console.error("Login error:",e);res.status(500).json({message:"Server error"});}
});
module.exports=router;
