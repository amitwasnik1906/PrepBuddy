const express = require("express")
const { addQuestionsToSession, togglePinQuestion, updateQuestionNote } = require("../controllers/questionController")
const {protect} = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/add", addQuestionsToSession)
router.post("/:id/pin", togglePinQuestion)
router.post("/:id/note", updateQuestionNote)


module.exports = router