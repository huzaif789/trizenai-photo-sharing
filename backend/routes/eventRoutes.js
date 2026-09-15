const express=require("express");
const Event=require("../models/Event");
const User=require("../models/User");
const auth=require("../middleware/authMiddleware");
const {adminOnly}=require("../middleware/roleMiddleware");
const router=express.Router();
router.post("/",auth,adminOnly,async(req,res)=>{
 try{const {name,description,eventDate}=req.body;if(!name||!eventDate)return res.status(400).json({message:"Event name and date are required"});const event=await Event.create({name,description:description||"",eventDate,createdBy:req.user.userId});res.status(201).json({message:"Event created successfully",event});}
 catch(e){console.error(e);res.status(500).json({message:"Could not create event"});}
});
router.get("/",auth,async(req,res)=>{
 const query=req.user.role==="admin"?{createdBy:req.user.userId}:{teamMembers:req.user.userId};
 const events=await Event.find(query).populate("createdBy","username email role").populate("teamMembers","username email role").sort({createdAt:-1});res.json(events);
});
router.post("/:eventId/team",auth,adminOnly,async(req,res)=>{
 try{const event=await Event.findById(req.params.eventId);if(!event)return res.status(404).json({message:"Event not found"});if(event.createdBy.toString()!==req.user.userId)return res.status(403).json({message:"You cannot manage this event"});const user=await User.findById(req.body.userId);if(!user||user.role!=="team")return res.status(400).json({message:"Valid Team Member is required"});if(!event.teamMembers.some(id=>id.toString()===user._id.toString()))event.teamMembers.push(user._id);await event.save();res.json({message:"Team Member assigned successfully",event:await Event.findById(event._id).populate("teamMembers","username email role")});}
 catch(e){console.error(e);res.status(500).json({message:"Could not assign team member"});}
});
module.exports=router;
