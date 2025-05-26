const express = require("express")
const {registerUser, loginUser, getUserProfile, uploadImage} = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")
const upload = require("../middlewares/uploadMiddleware")

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", protect, getUserProfile)

router.post("/upload-image", upload.single("image"), uploadImage)

module.exports = router