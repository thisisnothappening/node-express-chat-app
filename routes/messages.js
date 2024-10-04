const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController.js");

router.post("/", messageController.createMessage);

router.get("/:user1/:user2", messageController.getMessagesBetweenUsers);

module.exports = router;
