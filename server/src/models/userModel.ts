import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export interface User {
    userID?: number;
    userName: string;
    password: string;
    email: string;
    fullName: string;
    avatar?: string;
    create_at?: Date;
}

export class UserModel {
    private pool: mysql.Pool;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
    }

    async checkUserExists(userName: string, email: string): Promise<boolean> {
        const query = `
            SELECT COUNT(*) AS count
            FROM users
            WHERE userName = ? OR email = ?
        `;

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userName, email]);
        return rows[0].count > 0;
    }

    async registerUser(user: User): Promise<User> {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const query = `
            INSERT INTO users (userName, password, email, fullName)
            VALUES (?, ?, ?, ?)
        `;

        try {
            const [result] = await this.pool.execute<mysql.OkPacket>(query, [
                user.userName,
                hashedPassword,
                user.email,
                user.fullName,
            ]);

            return {
                userID: result.insertId,
                userName: user.userName,
                password: hashedPassword,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
                create_at: new Date(),
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('Duplicate entry')) {
                throw new Error('Username or email already exists');
            }
            throw error;
        }
    }

    async loginUser(userName: string, password: string): Promise<User | null> {
        const query = `
            SELECT * FROM users 
            WHERE userName = ?
        `;

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(query, [userName]);
        if (rows.length === 0) return null;

        const user = rows[0] as User;
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;
        return user;
    }

    async checkAndUpdateFirstLogin(userID: number): Promise<boolean> {
        const queryCheck = `
        SELECT firstLogin
        FROM users
        WHERE userID = ?
    `;
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(queryCheck, [userID]);

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        const firstLogin = rows[0].firstLogin;

        if (firstLogin) {
            const queryUpdate = `
            UPDATE users
            SET firstLogin = false
            WHERE userID = ?
        `;
            await this.pool.execute(queryUpdate, [userID]);
        }

        return firstLogin;
    }
}