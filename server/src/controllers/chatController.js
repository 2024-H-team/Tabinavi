const openaiModel = require("../models/openaiModel");

async function chatController(req, res) {
	const { message, history } = req.body;

	if (!message) {
		return res.status(400).json({ error: "Message is required." });
	}

	try {
		const responseMessage = await openaiModel.getResponseFromOpenAI(message, history);

		return res.json({ message: responseMessage });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
}

module.exports = {
	chatController,
};
