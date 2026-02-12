import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    // Ye line add karna zaroori hai
    role: { type: String, default: 'user' } 
})

// Agar model pehle se bana hai toh use use karein, nahi toh naya banayein
const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User;


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     _id: {type: String, required: true},
//     name: {type: String, required: true},
//     email: {type: String, required: true},
//     image: {type: String, required: true}
// })

// const User = mongoose.model('User', userSchema)

// export default User;