import User from '../models/User.js'
import bcryptjs from 'bcryptjs'
import { generateToken }  from '../lib/util.js'
import cloudinary from '../lib/cloudinary.js'

export const Signup = async (req, res) => {
    const { fullName, email, password } = req.body; 

    try{
        if (!fullName || !email || !password ) {
            return res.status(400).json({ message : "No any user data fielled"})
        }

        if ( password.length < 6 ) {
            return res.status(400).json({ message : "password must be at least 6 charecter"})
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)){
            return res.status(400).json({ message : "Invalid email format"})
        }

        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message : "User already exist"})

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword,
        })

        if(newUser) {
            const savedUser = await newUser.save()
            generateToken(savedUser._id, res)

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                followers: newUser.followers || [],
                following: newUser.following || [],
                followRequests: newUser.followRequests || [],
            })

        } else {
            return res.status(400).json({ message : "Invalid user data"})
        }
    } catch (error) {
        console.error('Error in signup controll:',error)
        return res.status(500).json({ message : "Internal server error"})
    }
}

export const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
    }   

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message : "Invalid email"})

        const isPasswordCorrect = await bcryptjs.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({ message : "Invalid password"})
        
        generateToken(user._id, res);

        res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                followers: user.followers || [],
                following: user.following || [],
                followRequests: user.followRequests || [],
            })
    } catch (error) {
        console.error("Error in login controller:",error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const Logout = (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message : "Logged out successfully"})
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { returnDocument: 'after' }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};