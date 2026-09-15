const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 username:{type:String,required:true,unique:true,trim:true,minlength:3,maxlength:30},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 password:{type:String,required:true},
 role:{type:String,enum:["admin","team"],default:"team"}
},{timestamps:true});
module.exports=mongoose.model("User",schema);
