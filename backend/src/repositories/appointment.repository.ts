import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed';

export interface Appointment {
  id: number;
  studentId: number;
  instructorId: number;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  studentId: number;
  instructorId: number;
  scheduledAt: Date;
  notes?: string;
}

export interface UpdateAppointmentStatusData {
  status: AppointmentStatus;
  cancellationReason?: string;
}

export interface AppointmentWithNames extends Appointment {
  studentName: string;
  instructorName: string;
}

export interface AppointmentRepository {
  ensureSchema(): Promise<void>;
  create(data: CreateAppointmentData): Promise<Appointment>;
  findById(id: number): Promise<AppointmentWithNames | null>;
  listByStudent(studentId: number): Promise<AppointmentWithNames[]>;
  listByInstructor(instructorId: number): Promise<AppointmentWithNames[]>;
  listForInstructorOnDate(
    instructorId: number,
    dateStart: Date,
    dateEnd: Date,
  ): Promise<Appointment[]>;
  hasConflict(instructorId: number, scheduledAt: Date): Promise<boolean>;
  updateStatus(
    id: number,
    data: UpdateAppointmentStatusData,
  ): Promise<AppointmentWithNames | null>;
}

type AppointmentRow = RowDataPacket & {
  id: number;
  student_id: number;
  instructor_id: number;
  scheduled_at: Date;
  status: AppointmentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
  student_name: string;
  instructor_name: string;
};

export class MySqlAppointmentRepository implements AppointmentRepository {
  constructor(private readonly pool: Pool) {}

  async ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        instructor_id INT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        cancellation_reason TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_appointments_student (student_id),
        INDEX idx_appointments_instructor (instructor_id),
        INDEX idx_appointments_scheduled_at (scheduled_at),
        CONSTRAINT fk_appointments_student FOREIGN KEY (student_id) REFERENCES users(id),
        CONSTRAINT fk_appointments_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO appointments (student_id, instructor_id, scheduled_at, status, notes)
        VALUES (?, ?, ?, 'pending', ?)
      `,
      [data.studentId, data.instructorId, data.scheduledAt, data.notes ?? null],
    );

    const [rows] = await this.pool.execute<AppointmentRow[]>(
      `
        SELECT a.id, a.student_id, a.instructor_id, a.scheduled_at, a.status, a.notes, a.cancellation_reason, a.created_at, a.updated_at, s.name as student_name, i.name as instructor_name
        FROM appointments a
        INNER JOIN users s ON s.id = a.student_id
        INNER JOIN users i ON i.id = a.instructor_id
        WHERE a.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    const created = rows[0];
    if (!created) {
      throw new Error('Failed to retrieve created appointment.');
    }

    return mapAppointmentRow(created);
  }

  async findById(id: number): Promise<AppointmentWithNames | null> {
    const [rows] = await this.pool.execute<AppointmentRow[]>(
      `
        SELECT a.id, a.student_id, a.instructor_id, a.scheduled_at, a.status, a.notes, a.cancellation_reason, a.created_at, a.updated_at, s.name as student_name, i.name as instructor_name
        FROM appointments a
        INNER JOIN users s ON s.id = a.student_id
        INNER JOIN users i ON i.id = a.instructor_id
        WHERE a.id = ?
        LIMIT 1
      `,
      [id],
    );

    const appointment = rows[0];
    return appointment ? mapAppointmentRow(appointment) : null;
  }

  async listByStudent(studentId: number): Promise<AppointmentWithNames[]> {
    const [rows] = await this.pool.execute<AppointmentRow[]>(
      `
        SELECT a.id, a.student_id, a.instructor_id, a.scheduled_at, a.status, a.notes, a.cancellation_reason, a.created_at, a.updated_at, s.name as student_name, i.name as instructor_name
        FROM appointments a
        INNER JOIN users s ON s.id = a.student_id
        INNER JOIN users i ON i.id = a.instructor_id
        WHERE a.student_id = ?
        ORDER BY a.scheduled_at ASC
      `,
      [studentId],
    );

    return rows.map(mapAppointmentRow);
  }

  async listByInstructor(instructorId: number): Promise<AppointmentWithNames[]> {
    const [rows] = await this.pool.execute<AppointmentRow[]>(
      `
        SELECT a.id, a.student_id, a.instructor_id, a.scheduled_at, a.status, a.notes, a.cancellation_reason, a.created_at, a.updated_at, s.name as student_name, i.name as instructor_name
        FROM appointments a
        INNER JOIN users s ON s.id = a.student_id
        INNER JOIN users i ON i.id = a.instructor_id
        WHERE a.instructor_id = ?
        ORDER BY a.scheduled_at ASC
      `,
      [instructorId],
    );

    return rows.map(mapAppointmentRow);
  }

  async listForInstructorOnDate(
    instructorId: number,
    dateStart: Date,
    dateEnd: Date,
  ): Promise<Appointment[]> {
    const [rows] = await this.pool.execute<AppointmentRow[]>(
      `
        SELECT a.id, a.student_id, a.instructor_id, a.scheduled_at, a.status, a.notes, a.cancellation_reason, a.created_at, a.updated_at, '' as student_name, '' as instructor_name
        FROM appointments a
        WHERE a.instructor_id = ?
          AND a.scheduled_at >= ?
          AND a.scheduled_at < ?
        ORDER BY a.scheduled_at ASC
      `,
      [instructorId, dateStart, dateEnd],
    );

    return rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      instructorId: row.instructor_id,
      scheduledAt: row.scheduled_at,
      status: row.status,
      notes: row.notes,
      cancellationReason: row.cancellation_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async hasConflict(instructorId: number, scheduledAt: Date): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `
        SELECT 1
        FROM appointments
        WHERE instructor_id = ?
          AND scheduled_at = ?
          AND status IN ('pending', 'confirmed')
        LIMIT 1
      `,
      [instructorId, scheduledAt],
    );

    return rows.length > 0;
  }

  async updateStatus(
    id: number,
    data: UpdateAppointmentStatusData,
  ): Promise<AppointmentWithNames | null> {
    await this.pool.execute(
      `
        UPDATE appointments
        SET status = ?, cancellation_reason = ?
        WHERE id = ?
      `,
      [data.status, data.cancellationReason ?? null, id],
    );

    return this.findById(id);
  }
}

function mapAppointmentRow(row: AppointmentRow): AppointmentWithNames {
  return {
    id: row.id,
    studentId: row.student_id,
    instructorId: row.instructor_id,
    scheduledAt: row.scheduled_at,
    status: row.status,
    notes: row.notes,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentName: row.student_name,
    instructorName: row.instructor_name,
  };
}
