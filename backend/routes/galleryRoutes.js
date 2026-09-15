const express=require("express");
const bcrypt=require("bcryptjs");
const crypto=require("crypto");
const Gallery=require("../models/Gallery");
const Event=require("../models/Event");
const Photo=require("../models/Photo");
const auth=require("../middleware/authMiddleware");
const {adminOnly}=require("../middleware/roleMiddleware");
const router=express.Router();
router.post("/event/:eventId/publish",auth,adminOnly,async(req,res)=>{
 try{const event=await Event.findById(req.params.eventId);if(!event)return res.status(404).json({message:"Event not found"});if(event.createdBy.toString()!==req.user.userId)return res.status(403).json({message:"Cannot publish this event"});const count=await Photo.countDocuments({event:event._id,selected:true});if(!count)return res.status(400).json({message:"Select at least one photo before publishing"});if(await Gallery.exists({event:event._id}))return res.status(400).json({message:"Gallery already published"});const pin=String(Math.floor(100000+Math.random()*900000));let slug=crypto.randomBytes(6).toString("hex");while(await Gallery.exists({slug}))slug=crypto.randomBytes(6).toString("hex");const gallery=await Gallery.create({event:event._id,createdBy:req.user.userId,slug,pinHash:await bcrypt.hash(pin,10)});res.status(201).json({message:"Gallery published successfully",gallery:{id:gallery._id,slug,url:`/gallery/${slug}`,pin,selectedPhotos:count}});}
 catch(e){console.error(e);res.status(500).json({message:"Could not publish gallery"});}
});
router.post("/public/:slug/unlock",async(req,res)=>{const gallery=await Gallery.findOne({slug:req.params.slug,published:true}).populate("event","name description eventDate");if(!gallery)return res.status(404).json({message:"Gallery not found"});if(!(await bcrypt.compare(String(req.body.pin||""),gallery.pinHash)))return res.status(401).json({message:"Incorrect PIN"});const photos=await Photo.find({event:gallery.event._id,selected:true}).select("filename storageLocation fileSize createdAt").sort({createdAt:1});res.json({message:"Gallery unlocked",event:gallery.event,photos});});
module.exports=router;
