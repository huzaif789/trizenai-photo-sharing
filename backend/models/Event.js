const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:100},
 description:{type:String,default:"",trim:true,maxlength:500},
 eventDate:{type:Date,required:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 teamMembers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 status:{type:String,enum:["active","completed"],default:"active"}
},{timestamps:true});
module.exports=mongoose.model("Event",schema);
