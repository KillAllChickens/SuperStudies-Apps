// routes/index.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/notes", (req, res) => {
    res.render("notes");
});

module.exports = router;