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
    dayStartTime?: string;
    dayEndTime?: string;
}

const SYSTEM_PROMPT = `You are a travel recommendation assistant.
Your task is to suggest Google Maps place types based on user preferences and existing selections.

Rules:
- Return only valid Google Maps place types from this list:
  amusement_park, aquarium, art_gallery, bakery, bar, book_store, bowling_alley, cafe, 
  campground, casino, church, department_store, hindu_temple, library, lodging, mosque,
  movie_theater, museum, night_club, park, restaurant, shopping_mall, spa, stadium,
  store, synagogue, tourist_attraction

- Avoid suggesting similar types in sequence
- Consider time of day and typical visit duration:
  - Morning activities might include cafes or parks.
  - Afternoon activities could include museums or shopping malls.
  - Evening activities might include restaurants or night clubs.
- Pay attention to the types and time of day the user has already selected and estimate the time spent at each location to inform the recommendation of subsequent types
- Suggest 3-4 different types each time
- For every 3 types that are suitable based on user preferences, insert 1 type that might not be directly suitable to encourage exploration of new and potentially interesting places
- Format response as JSON array

Example response: ["museum", "park", "restaurant", "cafe"]

Example scenario:
User has selected:
- "museum" (2 hours in the morning)
- "restaurant" (1.5 hours for lunch)

Suggested response: ["art_gallery", "park", "cafe", "library"]`;

function parseAIResponse(response: string): string[] {
    try {
        const cleanResponse = response
            .replace(/```json\s*/, '')
            .replace(/```\s*$/, '')
            .trim();

        const parsed = JSON.parse(cleanResponse);
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }
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
    const { surveyAnswers, selectedPlaces, dayStartTime, dayEndTime } = request;
    let message = 'Based on the following preferences:\n';

    surveyAnswers.forEach(({ answer }) => {
        message += `- ${answer}\n`;
    });

    if (selectedPlaces?.length) {
        message += '\nAlready selected places:\n';
        selectedPlaces.forEach(({ type, count }) => {
            message += `- ${type} (${count} times)\n`;
        });
    }

    if (dayStartTime || dayEndTime) {
        message += '\nTime constraints:\n';
        if (dayStartTime) message += `- Day start time: ${dayStartTime}\n`;
        if (dayEndTime) message += `- Day end time: ${dayEndTime}\n`;
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
            model: 'gpt-4o',
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
