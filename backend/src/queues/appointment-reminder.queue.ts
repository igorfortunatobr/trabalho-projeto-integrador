import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { Appointment } from '../repositories/appointment.repository';

export const APPOINTMENT_REMINDER_QUEUE = 'appointment-reminders';

export type AppointmentReminderType = '24h-before' | '1h-before' | '15m-before';

export type AppointmentReminderJobData = {
  appointmentId: number;
  reminderType: AppointmentReminderType;
};

type ReminderOffset = {
  type: AppointmentReminderType;
  milliseconds: number;
};

const REMINDER_OFFSETS: ReminderOffset[] = [
  { type: '24h-before', milliseconds: 24 * 60 * 60 * 1000 },
  { type: '1h-before', milliseconds: 60 * 60 * 1000 },
  { type: '15m-before', milliseconds: 15 * 60 * 1000 },
];

export type AppointmentReminderQueue = Queue<AppointmentReminderJobData>;

export function createAppointmentReminderQueue(
  connection: Redis,
): AppointmentReminderQueue {
  return new Queue<AppointmentReminderJobData>(APPOINTMENT_REMINDER_QUEUE, {
    connection,
  });
}

export async function scheduleAppointmentReminderJobs(
  queue: AppointmentReminderQueue,
  appointment: Pick<Appointment, 'id' | 'scheduledAt'>,
) {
  const scheduledAtTime = appointment.scheduledAt.getTime();
  const now = Date.now();

  await Promise.all(
    REMINDER_OFFSETS.map(async (reminder) => {
      const delay = scheduledAtTime - reminder.milliseconds - now;

      if (delay <= 0) {
        return;
      }

      await queue.add(
        'appointment-reminder',
        {
          appointmentId: appointment.id,
          reminderType: reminder.type,
        },
        {
          delay,
          jobId: buildAppointmentReminderJobId(appointment.id, reminder.type),
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: {
            count: 100,
          },
          removeOnFail: {
            count: 50,
          },
        },
      );
    }),
  );
}

export async function removeAppointmentReminderJobs(
  queue: AppointmentReminderQueue,
  appointmentId: number,
) {
  await Promise.all(
    REMINDER_OFFSETS.map(async (reminder) => {
      const job = await queue.getJob(
        buildAppointmentReminderJobId(appointmentId, reminder.type),
      );

      if (job) {
        await job.remove();
      }
    }),
  );
}

function buildAppointmentReminderJobId(
  appointmentId: number,
  reminderType: AppointmentReminderType,
) {
  return `appointment-reminder:${appointmentId}:${reminderType}`;
}
