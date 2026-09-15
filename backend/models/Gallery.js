const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true,unique:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 slug:{type:String,required:true,unique:true,index:true},
 pinHash:{type:String,required:true},
 published:{type:Boolean,default:true},
 publishedAt:{type:Date,default:Date.now}
},{timestamps:true});
module.exports=mongoose.model("Gallery",schema);
