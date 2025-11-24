const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

let note_prompt = "You are a helpful note taker."; // default
try {
    const promptPath = path.join(__dirname, "..", "prompt.txt");
    note_prompt = fs.readFileSync(promptPath, "utf8");
    console.log("AI Service: System prompt loaded.");
} catch (err) {
    console.error("AI Service: prompt.txt not found, using default.");
}

async function generateNotes(transcript) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: transcript,
            config: {
                systemInstruction: note_prompt,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating notes from Gemini:", error);
        return "Error generating notes. Please check the server logs.";
    }
}

module.exports = { generateNotes };