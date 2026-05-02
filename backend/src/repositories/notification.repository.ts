import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AppointmentReminderType } from '../queues/appointment-reminder.queue';

export interface Notification {
  id: number;
  userId: number;
  appointmentId: number;
  type: AppointmentReminderType;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateAppointmentReminderNotificationData {
  userId: number;
  appointmentId: number;
  reminderType: AppointmentReminderType;
  title: string;
  message: string;
}

export interface NotificationRepository {
  ensureSchema(): Promise<void>;
  createAppointmentReminder(
    data: CreateAppointmentReminderNotificationData,
  ): Promise<Notification>;
}

type NotificationRow = RowDataPacket & {
  id: number;
  user_id: number;
  appointment_id: number;
  type: AppointmentReminderType;
  title: string;
  message: string;
  read_at: Date | null;
  created_at: Date;
};

export class MySqlNotificationRepository implements NotificationRepository {
  constructor(private readonly pool: Pool) {}

  async ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        appointment_id INT NOT NULL,
        type VARCHAR(40) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_notification_appointment_type (appointment_id, type),
        INDEX idx_notifications_user_created (user_id, created_at),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_notifications_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      )
    `);
  }

  async createAppointmentReminder(
    data: CreateAppointmentReminderNotificationData,
  ): Promise<Notification> {
    await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO notifications (user_id, appointment_id, type, title, message)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          message = VALUES(message)
      `,
      [
        data.userId,
        data.appointmentId,
        data.reminderType,
        data.title,
        data.message,
      ],
    );

    const [rows] = await this.pool.execute<NotificationRow[]>(
      `
        SELECT id, user_id, appointment_id, type, title, message, read_at, created_at
        FROM notifications
        WHERE appointment_id = ?
          AND type = ?
        LIMIT 1
      `,
      [data.appointmentId, data.reminderType],
    );

    const notification = rows[0];
    if (!notification) {
      throw new Error('Failed to retrieve created notification.');
    }

    return mapNotificationRow(notification);
  }
}

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    appointmentId: row.appointment_id,
    type: row.type,
    title: row.title,
    message: row.message,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
