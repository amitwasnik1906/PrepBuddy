const User = require("../models/userModel")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const ApiResponse = require("../utils/apiResponse")

// Generate jwt token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '2d' })
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = req.body

        // check if user is already exits
        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(401).json(new ApiResponse(401, "User with this email is already exits"))
        }

        // make password hash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create new user
        const user = await User.create({
            name, email, password: hashedPassword, profileImageUrl
        })

        // Generate JWT token
        const token = generateToken(user._id)

        res.status(201).json(
            new ApiResponse(200, "User registered successfully", {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                token
            })
        )


    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message))
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if user exists
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json(new ApiResponse(401, "Invalid email or password"))
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json(new ApiResponse(401, "Invalid email or password"))
        }

        // Generate JWT token
        const token = generateToken(user._id)

        res.status(200).json(
            new ApiResponse(200, "Login successful", {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                token
            })
        )

    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message))
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json(new ApiResponse(404, "User not found"))
        }

        res.status(200).json(
            new ApiResponse(200, "User profile retrieved successfully", user)
        )

    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message))
    }
}

const uploadImage =  (req, res)=>{
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        const imageUrl = req.file.path
        
        res.status(200).json( new ApiResponse(200, null, {imageUrl}));
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
}

module.exports = { registerUser, loginUser, getUserProfile, uploadImage }