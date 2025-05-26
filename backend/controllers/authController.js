const User = require("../models/userModel")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const ApiResponse = require("../utils/apiResponse")

// Generate jwt token
const generateToken = (userId) =>{
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '2d'})
}

const registerUser = async (req, res)=>{
    try {
        const {name, email, password, profileImageUrl} = req.body

        // check if user is already exits
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(401).json(new ApiResponse(401, "User with this email is already exits")) 
        }

        // make password hash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create new user
        const user = await User.create({
            name, email, password: hashedPassword, profileImageUrl
        })

        res.status(201).json(
            new ApiResponse(200, "user register successfully", user)
        )

    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message))
    }
}

const loginUser = async (req, res)=>{

}

const getUserProfile = async (req, res)=>{

}

const logoutUser = async (req, res)=>{

}

module.exports = {registerUser, loginUser, getUserProfile, logoutUser}