const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler.js");
const cookieParser = require('cookie-parser');
const path = require("path");
const socketIO = require("socket.io");
const jwt = require('jsonwebtoken');
const Message = require('./model/Message'); // Import the Message model
require("dotenv").config();
require("./config/database.js");

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO and attach to the HTTP server
const io = socketIO(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            process.env.CORS_ORIGIN
        ],
        credentials: true
    }
});

// Middleware to authenticate Socket.IO connections
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = user; // Attach the user object to the socket
            next();
        } catch (err) {
            return next(new Error("Authentication error"));
        }
    } else {
        next(new Error("No token provided"));
    }
});

// Handle socket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.user.id);

    // Handle private messaging between users
    socket.on("privateMessage", async ({ senderId, receiverId, message }) => {
        try {
            // Save the message in the database
            const newMessage = new Message({
                senderId,
                receiverId,
                message
            });
            await newMessage.save();

            // Emit the message to the receiver
            io.to(receiverId).emit("receiveMessage", { senderId, message });
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user.id);
    });
});

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000",
        process.env.CORS_ORIGIN
    ],
    credentials: true
}));

app.use("/users", require("./routes/users"));
app.use(require("./routes/auth"));
app.use("/messages", require("./routes/messages"));

app.use(errorHandler);

app.use(express.static(path.join(__dirname, "build")));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 8080;
const host = "0.0.0.0";
server.listen(port, host, () => console.log(`Listening on port ${port}...`));
