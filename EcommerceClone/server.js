const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from "static" folder
app.use("/static", express.static(path.join(__dirname, "static")));

// Serve HTML files
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/search.html", (req, res) => {
    res.sendFile(path.join(__dirname, "search.html"));
});

app.get("/cart.html", (req, res) => {
    res.sendFile(path.join(__dirname, "cart.html"));
});

app.get("/product.html", (req, res) => {
    res.sendFile(path.join(__dirname, "product.html"));
});

// Listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});