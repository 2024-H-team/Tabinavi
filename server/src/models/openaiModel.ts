import { OpenAI } from 'openai';
import { prompt } from '../config/prompt';

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function getResponseFromOpenAI(userMessage: string, history: Message[] = []): Promise<string> {
    try {
        const messages: Message[] = [
            ...prompt,
            ...history.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: userMessage },
        ];
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
        });

        const responseMessage = completion.choices[0]?.message?.content;
        console.log(responseMessage);
        if (!responseMessage) {
            throw new Error('No response from OpenAI.');
        }

        return responseMessage;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while processing your request.');
    }
}
