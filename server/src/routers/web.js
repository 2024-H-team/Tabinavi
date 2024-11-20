const express = require("express");
const chatRouter = require("./chatRouter");

const web = express.Router();

web.use("/chat", chatRouter);

module.exports = web;
