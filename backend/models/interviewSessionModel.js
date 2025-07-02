const mongoose = require("mongoose")

const interviewSessionSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        role: {type: String, required: true},
        experience: {type: String, required: true},
        topicsToFocus: {type: String, required: true},
        description: String,
        resumeData: {type: String, default: ""},
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("interviewSession", interviewSessionSchema)