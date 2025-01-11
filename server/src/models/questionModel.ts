import mysql from 'mysql2/promise';

export interface Choice {
    id: number;
    question_id: number;
    text: string;
    order: number;
}

export interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple' | 'priority';
    allow_priority: boolean;
    choices: Choice[];
}

export interface UserAnswer {
    question_id: number;
    choice_id: number;
    priority?: number;
}

export interface UserResponse {
    question_id: number;
    choice_id: number;
    priority: number | null;
}
export interface SubmitAnswerResponse {
    responseId: number;
    isUpdate: boolean;
}

export class QuestionModel {
    private pool: mysql.Pool;
    private readonly SURVEY_ID = 1;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
    }

    async getAllQuestionsWithChoices(): Promise<Question[]> {
        const query = `
      SELECT
        q.id AS question_id,
        q.text AS question_text,
        q.type,
        q.allow_priority,
        c.id AS choice_id,
        c.text AS choice_text,
        c.order
      FROM Questions q
      LEFT JOIN Choices c ON q.id = c.question_id
      WHERE q.survey_id = ?
      ORDER BY q.id, c.order
    `;

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [this.SURVEY_ID]);

        const questionsMap = new Map<number, Question>();

        rows.forEach((row) => {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    text: row.question_text,
                    type: row.type,
                    allow_priority: row.allow_priority,
                    choices: [],
                });
            }

            const question = questionsMap.get(row.question_id)!;
            if (row.choice_id) {
                question.choices.push({
                    id: row.choice_id,
                    question_id: row.question_id,
                    text: row.choice_text,
                    order: row.order,
                });
            }
        });

        return Array.from(questionsMap.values());
    }

    private async checkExistingResponse(userId: number): Promise<number | null> {
        const query = `
            SELECT id 
            FROM Responses 
            WHERE user_id = ? AND survey_id = ?
        `;
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userId, this.SURVEY_ID]);
        return rows.length ? rows[0].id : null;
    }

    async submitUserAnswers(userId: number, answers: UserAnswer[]): Promise<SubmitAnswerResponse> {
        const connection = await this.pool.getConnection();

        try {
            await connection.beginTransaction();
            const existingResponseId = await this.checkExistingResponse(userId);
            const isUpdate = !!existingResponseId;
            let responseId: number;

            if (isUpdate) {
                await connection.execute('DELETE FROM User_Answers WHERE response_id = ?', [existingResponseId]);
                responseId = existingResponseId;
            } else {
                const [result] = await connection.execute<mysql.OkPacket>(
                    'INSERT INTO Responses (user_id, survey_id) VALUES (?, ?)',
                    [userId, this.SURVEY_ID],
                );
                responseId = result.insertId;
            }

            // Insert answers...
            const answerQuery = `
                INSERT INTO User_Answers
                (response_id, question_id, choice_id, priority)
                VALUES (?, ?, ?, ?)
            `;

            for (const answer of answers) {
                await connection.execute(answerQuery, [
                    responseId,
                    answer.question_id,
                    answer.choice_id,
                    answer.priority ?? null,
                ]);
            }

            await connection.commit();
            return { responseId, isUpdate };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getUserAnswers(userId: number): Promise<UserResponse[]> {
        const query = `
            SELECT ua.question_id, ua.choice_id, ua.priority
            FROM User_Answers ua
            JOIN Responses r ON ua.response_id = r.id
            WHERE r.user_id = ? AND r.survey_id = ?
            ORDER BY ua.question_id, ua.priority
        `;

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userId, this.SURVEY_ID]);
        return rows as UserResponse[];
    }
}
