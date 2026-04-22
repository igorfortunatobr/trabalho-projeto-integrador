import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
}

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

export class MySqlUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_users_email (email)
      )
    `);
  }

  async create(data: CreateUserData): Promise<User> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `,
      [data.name, data.email, data.passwordHash],
    );

    const [rows] = await this.pool.execute<UserRow[]>(
      `
        SELECT id, name, email, password_hash, created_at
        FROM users
        WHERE id = ?
      `,
      [result.insertId],
    );

    return mapUserRow(rows[0]);
  }
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}
