const ApiResponse = require("../utils/apiResponse")
const { conceptExplanationPrompt, interviewQuestionsPrompt } = require("../utils/prompts")
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json(new ApiResponse(400, "All fields are required"))
        }

        const prompt = interviewQuestionsPrompt(role, experience, topicsToFocus, numberOfQuestions)

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt
        })


        let rawText = response.candidates[0].content.parts[0].text

        const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const data = JSON.parse(cleanedText);

        return res.status(200).json(new ApiResponse(200, "Interview questions generated successfully", { interviewQuestions: data }))

    } catch (error) {
        return res.status(500).json(new ApiResponse(500, "Failed to generate interview questions", { error: error.message }))
    }
}

const generateConceptExplanation = async (req, res) => {
    try {
        const { question } = req.body

        if (!question) {
            return res.status(400).json(new ApiResponse(400, "Question is required"))
        }

        const prompt = conceptExplanationPrompt(question)

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt
        })

        let rawText = response.candidates[0].content.parts[0].text

        const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const data = JSON.parse(cleanedText);

        return res.status(200).json(new ApiResponse(200, "Concept explanation generated successfully", { explanation: data }))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, "Failed to generate concept explanation", { error: error.message }))
    }
}

module.exports = { generateInterviewQuestions, generateConceptExplanation }