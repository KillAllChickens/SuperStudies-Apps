require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

// const { marked } = require("marked");

const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
let note_prompt = "";
fs.readFile("prompt.txt", "utf8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }
    note_prompt = data;
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/notes", (req, res) => {
    res.render("notes");
});

async function generateNotes(transcript) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
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

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    let fullTranscript = "";

    socket.on("transcription", (data) => {
        console.log("Transcription received: ", data);
        fullTranscript += data + " ";
    });

    socket.on("end_recording", async () => {
        console.log(
            "End of recording received. Full transcript:",
            fullTranscript
        );
        if (fullTranscript.trim().length > 0) {
            const notes = await generateNotes(fullTranscript);
            socket.emit("notes_generated", notes);
        } else {
            socket.emit("notes_generated", "No transcript was recorded.");
        }
        fullTranscript = ""; // Reset for the next recording
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
