import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        require:true,
        type:String,
    },

    email: {
        require:true,
        type:String,
        unique:true
    },


    password: {
        require:true,
        type:String,
    },

    avatar:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }

})


export default mongoose.model("User",userSchema)