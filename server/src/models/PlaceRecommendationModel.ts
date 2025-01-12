import mysql from 'mysql2/promise';
import { getRecommendedPlaceTypes, PlaceTypesRequest, PlaceTypesResponse } from '../utils/getRecommendedPlaceTypes';

export interface SurveyAnswer {
    questionId: number;
    answer: string;
    priority?: number;
}

export interface SelectedPlace {
    type: string;
    count: number;
}

export class RecommendedPlaceModel {
    private pool: mysql.Pool;
    private readonly SURVEY_ID = 1;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
    }

    /**
     * Retrieves and processes user survey answers, handling priority questions by numbering the answers.
     * @param userId - The ID of the user.
     * @returns An array of SurveyAnswer objects.
     */
    async getProcessedSurveyAnswers(userId: number): Promise<SurveyAnswer[]> {
        const query = `
            SELECT q.id AS question_id, q.type, ua.choice_id, ua.priority, c.text AS answer_text
            FROM User_Answers ua
            JOIN Questions q ON ua.question_id = q.id
            JOIN Choices c ON ua.choice_id = c.id
            JOIN Responses r ON ua.response_id = r.id
            WHERE r.user_id = ? AND r.survey_id = ?
            ORDER BY q.id, ua.priority
        `;

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userId, this.SURVEY_ID]);

        const surveyAnswers: SurveyAnswer[] = rows.map((row) => ({
            questionId: row.question_id,
            answer: row.answer_text,
            priority: row.priority || undefined,
        }));

        return surveyAnswers;
    }

    /**
     * Fetches recommended place types based on survey answers and selected places.
     * @param userId - The ID of the user.
     * @param selectedPlaces - The currently selected place types.
     * @returns The recommended place types from OpenAI.
     */
    async fetchRecommendedPlaceTypes(userId: number, selectedPlaces: SelectedPlace[]): Promise<PlaceTypesResponse> {
        const surveyAnswers = await this.getProcessedSurveyAnswers(userId);

        const request: PlaceTypesRequest = {
            surveyAnswers: surveyAnswers.map((sa) => ({
                questionId: sa.questionId,
                answer: sa.answer,
            })),
            selectedPlaces: selectedPlaces.length ? selectedPlaces : undefined,
        };

        const response = await getRecommendedPlaceTypes(request);
        return response;
    }
}
