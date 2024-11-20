const { OpenAI } = require("openai");
const { prompt } = require("../config/prompt");

const openai = new OpenAI({
	apiKey: process.env.API_KEY,
});

async function getResponseFromOpenAI(userMessage, history = []) {
	try {
		const messages = [
			...prompt,
			...history.map((msg) => ({
				role: msg.role === "user" ? "user" : "assistant",
				content: msg.content,
			})),
			{ role: "user", content: userMessage },
		];
		console.log(messages);
		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
			temperature: 0.7,
		});

		const responseMessage = completion.choices[0]?.message?.content;
		console.log(responseMessage);
		if (!responseMessage) {
			throw new Error("No response from OpenAI.");
		}

		return responseMessage;
	} catch (error) {
		console.error(error);
		throw new Error("An error occurred while processing your request.");
	}
}

module.exports = {
	getResponseFromOpenAI,
};
