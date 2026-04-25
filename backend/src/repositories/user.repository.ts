import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'instructor';
  createdAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'instructor';
}

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  discriminator: 'student' | 'instructor';
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
        discriminator VARCHAR(20) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_users_email (email)
      )
    `);

    const [columns] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'discriminator'
        LIMIT 1
      `,
    );

    if (columns.length === 0) {
      await this.pool.query(`
        ALTER TABLE users
        ADD COLUMN discriminator VARCHAR(20) NOT NULL DEFAULT 'student'
      `);
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO users (name, email, password_hash, discriminator)
        VALUES (?, ?, ?, ?)
      `,
      [data.name, data.email, data.passwordHash, data.role],
    );

    const [rows] = await this.pool.execute<UserRow[]>(
      `
        SELECT id, name, email, password_hash, discriminator, created_at
        FROM users
        WHERE id = ?
      `,
      [result.insertId],
    );

    const createdUser = rows[0];

    if (!createdUser) {
      throw new Error('Failed to retrieve created user.');
    }

    return mapUserRow(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.execute<UserRow[]>(
      `
        SELECT id, name, email, password_hash, discriminator, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

    const user = rows[0];
    return user ? mapUserRow(user) : null;
  }
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.discriminator,
    createdAt: row.created_at,
  };
}
