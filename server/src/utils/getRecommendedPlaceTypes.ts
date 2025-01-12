import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.USER_PLACE_TYPES_API_KEY,
});

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface PlaceTypesResponse {
    success: boolean;
    types: string[];
    error?: string;
}

export interface PlaceTypesRequest {
    surveyAnswers: {
        questionId: number;
        answer: string;
    }[];
    selectedPlaces?: {
        type: string;
        count: number;
    }[];
}

/**
 * Fetch recommended place types from OpenAI.
 * The system prompt provides context for the assistant.
 * @param userMessage - The user's request or context about desired places.
 * @returns A string response that ideally contains recommended place types.
 */

const SYSTEM_PROMPT = `You are a travel recommendation assistant.
Your task is to suggest Google Maps place types based on user preferences and existing selections.

Rules:
- Return only valid Google Maps place types from this list:
  amusement_park, aquarium, art_gallery, bakery, bar, book_store, bowling_alley, cafe, 
  campground, casino, church, department_store, hindu_temple, library, lodging, mosque,
  movie_theater, museum, night_club, park, restaurant, shopping_mall, spa, stadium,
  store, synagogue, tourist_attraction

- Avoid suggesting similar types in sequence
- Consider time of day and typical visit duration
- Pay attention to the types the user has already selected and estimate the time spent at each location to inform the recommendation of subsequent types
- Maximum 3-4 different types
- Format response as JSON array

Example response: ["museum", "park", "restaurant"]`;

// getRecommendedPlaceTypes.ts
function parseAIResponse(response: string): string[] {
    try {
        // Clean the response string
        const cleanResponse = response
            .replace(/```json\s*/, '') // Remove ```json
            .replace(/```\s*$/, '') // Remove trailing ```
            .trim(); // Remove whitespace

        const parsed = JSON.parse(cleanResponse);

        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }

        // Validate each item is a string
        if (!parsed.every((item) => typeof item === 'string')) {
            throw new Error('Array contains non-string values');
        }

        return parsed;
    } catch (error) {
        console.error('Parse error:', error);
        console.error('Raw response:', response);
        throw new Error('Invalid AI response format');
    }
}

function formatRequest(request: PlaceTypesRequest): string {
    const { surveyAnswers, selectedPlaces } = request;

    let message = 'Based on the following preferences:\n';

    // Add survey answers
    surveyAnswers.forEach(({ answer }) => {
        message += `- ${answer}\n`;
    });

    // Add selected places if any
    if (selectedPlaces?.length) {
        message += '\nAlready selected places:\n';
        selectedPlaces.forEach(({ type, count }) => {
            message += `- ${type} (${count} times)\n`;
        });
    }

    message += '\nPlease suggest appropriate Google Maps place types.';
    return message;
}

export async function getRecommendedPlaceTypes(request: PlaceTypesRequest): Promise<PlaceTypesResponse> {
    try {
        const userMessage = formatRequest(request);
        const messages: Message[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
        });

        const responseMessage = completion.choices[0]?.message?.content;
        if (!responseMessage) {
            throw new Error('No response from OpenAI');
        }
        const types = parseAIResponse(responseMessage);

        return {
            success: true,
            types,
        };
    } catch (error) {
        console.error('Place types recommendation error:', error);
        return {
            success: false,
            types: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
