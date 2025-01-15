import mysql from 'mysql2/promise';

export interface Schedule {
    id?: number;
    userId: number;
    title: string;
    start_date: Date;
    end_date: Date;
    schedules: string;
    created_at?: Date;
    updated_at?: Date;
}

export class ScheduleModel {
    private pool: mysql.Pool;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
    }

    async createSchedule(schedule: Schedule): Promise<Schedule> {
        const query = `
            INSERT INTO schedules 
            (userId, title, start_date, end_date, schedules)
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            const [result] = await this.pool.execute<mysql.OkPacket>(query, [
                schedule.userId,
                schedule.title,
                schedule.start_date,
                schedule.end_date,
                schedule.schedules,
            ]);

            return {
                ...schedule,
                id: result.insertId,
                created_at: new Date(),
                updated_at: new Date(),
            };
        } catch (error) {
            console.error('Create schedule error:', error);
            throw error;
        }
    }

    async getSchedulesByUserId(userId: number): Promise<Schedule[]> {
        const query = `
            SELECT * FROM schedules
            WHERE userId = ?
            ORDER BY created_at DESC
        `;

        try {
            const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userId]);
            return rows as Schedule[];
        } catch (error) {
            console.error('Get schedules error:', error);
            throw error;
        }
    }

    async updateSchedule(scheduleId: number, schedule: Partial<Schedule>): Promise<boolean> {
        const query = `
            UPDATE schedules
            SET title = ?, start_date = ?, end_date = ?, schedules = ?
            WHERE id = ? AND userId = ?
        `;

        try {
            const [result] = await this.pool.execute<mysql.OkPacket>(query, [
                schedule.title,
                schedule.start_date,
                schedule.end_date,
                schedule.schedules,
                scheduleId,
                schedule.userId,
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Update schedule error:', error);
            throw error;
        }
    }

    async deleteSchedule(scheduleId: number, userId: number): Promise<boolean> {
        const query = `
            DELETE FROM schedules
            WHERE id = ? AND userId = ?
        `;

        try {
            const [result] = await this.pool.execute<mysql.OkPacket>(query, [scheduleId, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Delete schedule error:', error);
            throw error;
        }
    }
}
