const { generateNotes } = require("../services/aiService");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // Create a unique variable for this specific user's session
        let serverSideAccumulator = "";

        socket.on("transcription", (data) => {
            // Log data if needed, or keep a backup buffer
            // console.log(`Recv (${socket.id}):`, data.substring(0, 10) + "...");
            serverSideAccumulator += data + " ";
        });

        socket.on("end_recording", async (clientFinalText) => {
            // Prefer the text sent specifically with the end event
            // Fallback to the accumulated text if client sent nothing
            const textToProcess = clientFinalText || serverSideAccumulator;

            console.log(`Processing notes for ${socket.id}. Length: ${textToProcess.length}`);

            if (textToProcess.trim().length > 0) {
                socket.emit("status_update", "Analyzing with AI...");

                const notes = await generateNotes(textToProcess);
                console.log(notes);
                socket.emit("notes_generated", notes);
            } else {
                socket.emit("notes_generated", "No audio was recorded.");
            }
            
            // Reset accumulator
            serverSideAccumulator = "";
        });

        socket.on("disconnect", () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });
};