/*
    create interview
    generate feedback
    get all interview by user
    get single interview
    get feedback

    generate firt interview question
    generate next interview question
 */

const Interview = require("../models/interviewModel")
const ApiResponse = require("../utils/apiResponse")
const { firstInterviewQuestionPrompt, nextInterviewQuestionPrompt } = require("../utils/prompts")
const { generateFirstInterviewQuestion, generateNextInterviewQuestion } = require("./aiController")

const createInterview = async (req, res) => {
    try {
        const user = req.user._id

        const { jobRole, experience, topicsToFocus, interviewType, resumeData, totalQuestions } = req.body
        // Validate required fields
        if (!jobRole || !experience || !topicsToFocus || !interviewType || !totalQuestions) {
            return res.status(400).json(new ApiResponse(400, "All fields are required: jobRole, experience, topicsToFocus, interviewType, resumeData, totalQuestions"));
        }

        const interview = await Interview.create({
            jobRole, experience, topicsToFocus, interviewType, resumeData, totalQuestions, user
        })

        // generate first question
        const prompt = firstInterviewQuestionPrompt(jobRole, experience, topicsToFocus, interviewType, resumeData)

        // const {question} = await generateFirstInterviewQuestion(prompt)
        const { question } = {
            title: 'Node.js and Microservices',
            question: "Given your experience with Node.js and backend development, can you describe a challenging microservices project you've worked on, and what architectural decisions you made?"
        }

        if (!question) {
            return res.status(400).json(new ApiResponse(500, "Failed to generate first interview questions", { error: error.message }))
        }

        // store prompt and question from api in database
        interview.interviewHistory = [
            {
                role: 'user',
                parts: [{ text: prompt }]
            },
            {
                role: 'model',
                parts: [{ text: question }]
            }
        ];
        await interview.save();

        // response
        return res.status(201).json(new ApiResponse(201, "Interview created successfully", { interview, question }))

    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, "Failed to create interview", { error: error.message }));
    }
}

const getMyInterviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const interviews = await Interview.find({ user: userId }).sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, "Fetched interviews successfully", { interviews }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, "Failed to fetch interviews", { error: error.message }));
    }
}

const getInterviewById = async (req, res) => {
    try {
        const interviewId = req.params.id;
        const userId = req.user._id;

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json(new ApiResponse(404, "Interview not found"));
        }

        if (interview.user.toString() !== userId.toString()) {
            return res.status(403).json(
                new ApiResponse(403, "You are not authorized to access this interview")
            )
        }

        return res.status(200).json(new ApiResponse(200, "Interview fetched successfully", { interview }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, "Failed to fetch interview", { error: error.message }));
    }
}

const submitAnswer = async (req, res) => {
    try {
        const interviewId = req.params.id;
        const userId = req.user._id;
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json(new ApiResponse(404, "Interview not found"));
        }

        if (interview.user.toString() !== userId.toString()) {
            return res.status(403).json(
                new ApiResponse(403, "You are not authorized to access this interview")
            )
        }

        const { answer } = req.body;

        // add answer in db
        interview.interviewHistory.push(
            {
                role: 'user',
                parts: [{ text: answer }]
            }
        )

        // if total questions hit
        if ((interview.totalQuestions * 2) < interview.interviewHistory.length) {
            await interview.save();
            const nextQuestion = "END"
            return res.status(200).json(new ApiResponse(200, "Answer submitted successfully & interview completed", { nextQuestion }));
        }

        // generate next question
        const prompt = nextInterviewQuestionPrompt()
        const interviewHistory = interview.interviewHistory // array

        const result = await generateNextInterviewQuestion(prompt, interviewHistory);

        if (!result) {
            return res.status(500).json(new ApiResponse(500, "Failed to generate next question"));
        }

        const { question } = result

        interview.interviewHistory.push(
            {
                role: 'model',
                parts: [{ text: question }]
            }
        )
        await interview.save();

        return res.status(200).json(new ApiResponse(200, "Answer submitted successfully & next new question generated", { nextQuestion: question }));

    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, "Failed to submit answer", { error: error.message }));
    }
}

const generateFeedback = async (req, res) => {
    try {

    } catch (error) {

    }
}

const getFeedback = async (req, res) => {
    try {

    } catch (error) {

    }
}

module.exports = { createInterview, getMyInterviews, getInterviewById, generateFeedback, getFeedback, submitAnswer };