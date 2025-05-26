const express = require("express")
const {registerUser, loginUser, getUserProfile, logoutUser} = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")
const upload = require("../middlewares/uploadMiddleware")

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", protect, getUserProfile)
router.post("/logout", logoutUser)



module.exports = router