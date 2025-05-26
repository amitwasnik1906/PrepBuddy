const express = require("express")
const { createSession, getMySessions, getSessionById, deleteSession } = require("../controllers/sessionController")
const {protect} = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/create", createSession)
router.get("/my-session", getMySessions)
router.get("/:id", getSessionById)
router.delete("/:id", deleteSession)

module.exports = router