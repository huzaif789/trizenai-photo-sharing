const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 filename:{type:String,required:true},
 storageLocation:{type:String,required:true},
 fileSize:{type:Number,required:true},
 mimetype:{type:String,required:true},
 selected:{type:Boolean,default:false}
},{timestamps:true});
module.exports=mongoose.model("Photo",schema);
