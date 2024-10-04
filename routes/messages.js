const express = require("express");
const Message = require("../model/Message");
const router = express.Router();

router.post("/", async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();
        return res.status(201).json(newMessage);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get("/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
