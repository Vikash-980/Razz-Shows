

import User from "../models/User.js"; // Apna User model sahi path se import karein

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Clerk se ID milegi
        
        if (!userId) {
            return res.json({ success: false, message: "Unauthorized, please login" });
        }

        // Database se user ka data nikalo
        const user = await User.findById(userId);

        // Ab check karo jo aapne MongoDB mein manually likha hai
        if (user && user.role === 'admin') {
            next(); // Access Granted!
        } else {
            return res.json({ success: false, message: "You are not authorized to access admin dashboard" });
        }
    } catch (error) {
        console.log("Admin Auth Error:", error.message);
        return res.json({ success: false, message: "Server Error" });
    }
}



// import { clerkClient } from "@clerk/express";

// export const protectAdmin = async (req, res, next) => {
//     try {
//         const {userId} = req.auth();
//         const user = await clerkClient.users.getUser(userId)

//         if(user.privateMetadata.role !== 'admin'){
//             return res.json({success: false, message: "Not Authorized"})
//         }
//         next();
//     } catch (error) {
//         return res.json({success: false, message: "Not Authorized"});
//     }
// }