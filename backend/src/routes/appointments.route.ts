import { FastifyInstance } from 'fastify';
import { buildAuthenticateRequest } from '../middlewares/auth.middleware';
import { AuthTokenPayload } from '../services/jwt.service';
import {
  AppointmentRepository,
  AppointmentStatus,
} from '../repositories/appointment.repository';
import { UserRepository } from '../repositories/user.repository';

type RegisterAppointmentsRoutesOptions = {
  jwtSecret: string;
  userRepository: UserRepository;
  appointmentRepository: AppointmentRepository;
};

type CreateAppointmentBody = {
  instructorId?: number;
  scheduledAt?: string;
  notes?: string;
};

type UpdateAppointmentStatusBody = {
  status?: AppointmentStatus;
  cancellationReason?: string;
};

const STUDENT_ALLOWED_STATUS: AppointmentStatus[] = ['cancelled'];
const INSTRUCTOR_ALLOWED_STATUS: AppointmentStatus[] = [
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
];

type AuthenticatedRequest = {
  user: AuthTokenPayload;
};

export async function registerAppointmentsRoutes(
  fastify: FastifyInstance,
  options: RegisterAppointmentsRoutesOptions,
) {
  const authenticateRequest = buildAuthenticateRequest({
    jwtSecret: options.jwtSecret,
  });

  fastify.get(
    '/appointments',
    { preHandler: authenticateRequest },
    async (request) => {
      const authenticatedRequest = request as typeof request & AuthenticatedRequest;
      const userId = Number(authenticatedRequest.user.sub);

      const appointments =
        authenticatedRequest.user.role === 'student'
          ? await options.appointmentRepository.listByStudent(userId)
          : await options.appointmentRepository.listByInstructor(userId);

      return appointments.map((appointment) => ({
        id: appointment.id,
        studentId: appointment.studentId,
        studentName: appointment.studentName,
        instructorId: appointment.instructorId,
        instructorName: appointment.instructorName,
        scheduledAt: appointment.scheduledAt.toISOString(),
        status: appointment.status,
        notes: appointment.notes,
        cancellationReason: appointment.cancellationReason,
      }));
    },
  );

  fastify.get(
    '/appointments/availability',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const query = request.query as { instructorId?: string; date?: string };
      const instructorId = Number(query.instructorId);
      const dateRaw = query.date;

      if (!Number.isFinite(instructorId) || instructorId <= 0 || !dateRaw) {
        return reply.status(400).send({
          message: 'instructorId e date são obrigatórios.',
        });
      }

      const instructor = await options.userRepository.findById(instructorId);
      if (!instructor || instructor.role !== 'instructor') {
        return reply.status(404).send({
          message: 'Instrutor não encontrado.',
        });
      }

      const dateStart = new Date(`${dateRaw}T00:00:00.000Z`);
      if (Number.isNaN(dateStart.getTime())) {
        return reply.status(400).send({
          message: 'Data inválida.',
        });
      }

      const dateEnd = new Date(dateStart);
      dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

      const appointments = await options.appointmentRepository.listForInstructorOnDate(
        instructorId,
        dateStart,
        dateEnd,
      );

      const busySlots = new Set(
        appointments
          .filter((appointment) =>
            ['pending', 'confirmed'].includes(appointment.status),
          )
          .map((appointment) => appointment.scheduledAt.toISOString()),
      );

      const daySlots = [8, 9, 10, 11, 14, 15, 16, 17].map((hour) => {
        const slotDate = new Date(dateStart);
        slotDate.setUTCHours(hour, 0, 0, 0);
        const iso = slotDate.toISOString();
        return {
          scheduledAt: iso,
          available: !busySlots.has(iso) && slotDate.getTime() > Date.now(),
        };
      });

      return {
        instructorId,
        date: dateRaw,
        slots: daySlots,
      };
    },
  );

  fastify.post<{ Body: CreateAppointmentBody }>(
    '/appointments',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const authenticatedRequest = request as typeof request & AuthenticatedRequest;
      if (authenticatedRequest.user.role !== 'student') {
        return reply.status(403).send({
          message: 'Somente alunos podem criar agendamentos.',
        });
      }

      const studentId = Number(authenticatedRequest.user.sub);
      const instructorId = Number(request.body?.instructorId);
      const scheduledAtRaw = request.body?.scheduledAt;

      if (!Number.isFinite(instructorId) || instructorId <= 0 || !scheduledAtRaw) {
        return reply.status(400).send({
          message: 'instructorId e scheduledAt são obrigatórios.',
        });
      }

      if (studentId === instructorId) {
        return reply.status(400).send({
          message: 'Você não pode agendar uma aula consigo mesmo.',
        });
      }

      const instructor = await options.userRepository.findById(instructorId);
      if (!instructor || instructor.role !== 'instructor') {
        return reply.status(400).send({
          message: 'O instructorId informado é inválido.',
        });
      }

      const scheduledAt = new Date(scheduledAtRaw);
      if (Number.isNaN(scheduledAt.getTime())) {
        return reply.status(400).send({
          message: 'Data/hora inválida.',
        });
      }

      if (scheduledAt.getTime() <= Date.now()) {
        return reply.status(400).send({
          message: 'A data/hora deve ser futura.',
        });
      }

      const hasConflict = await options.appointmentRepository.hasConflict(
        instructorId,
        scheduledAt,
      );

      if (hasConflict) {
        return reply.status(409).send({
          message: 'Este horário não está mais disponível.',
        });
      }

      const created = await options.appointmentRepository.create(
        request.body?.notes
          ? {
              studentId,
              instructorId,
              scheduledAt,
              notes: request.body.notes,
            }
          : {
              studentId,
              instructorId,
              scheduledAt,
            },
      );

      return reply.status(201).send({
        id: created.id,
        studentId: created.studentId,
        instructorId: created.instructorId,
        scheduledAt: created.scheduledAt.toISOString(),
        status: created.status,
        notes: created.notes,
      });
    },
  );

  fastify.patch<{ Params: { id: string }; Body: UpdateAppointmentStatusBody }>(
    '/appointments/:id/status',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const authenticatedRequest = request as typeof request & AuthenticatedRequest;
      const appointmentId = Number(request.params.id);
      const status = request.body?.status;

      if (!Number.isFinite(appointmentId) || appointmentId <= 0 || !status) {
        return reply.status(400).send({
          message: 'Parâmetros inválidos.',
        });
      }

      const appointment = await options.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return reply.status(404).send({
          message: 'Agendamento não encontrado.',
        });
      }

      const userId = Number(authenticatedRequest.user.sub);
      if (authenticatedRequest.user.role === 'student') {
        if (appointment.studentId !== userId) {
          return reply.status(403).send({
            message: 'Você não pode alterar esse agendamento.',
          });
        }

        if (!STUDENT_ALLOWED_STATUS.includes(status)) {
          return reply.status(403).send({
            message: 'Aluno só pode cancelar agendamentos.',
          });
        }
      } else if (authenticatedRequest.user.role === 'instructor') {
        if (appointment.instructorId !== userId) {
          return reply.status(403).send({
            message: 'Você não pode alterar esse agendamento.',
          });
        }

        if (!INSTRUCTOR_ALLOWED_STATUS.includes(status)) {
          return reply.status(403).send({
            message: 'Status inválido para instrutor.',
          });
        }
      }

      const updated = await options.appointmentRepository.updateStatus(
        appointmentId,
        request.body?.cancellationReason
          ? {
              status,
              cancellationReason: request.body.cancellationReason,
            }
          : { status },
      );

      if (!updated) {
        return reply.status(404).send({
          message: 'Agendamento não encontrado.',
        });
      }

      return {
        id: updated.id,
        studentId: updated.studentId,
        studentName: updated.studentName,
        instructorId: updated.instructorId,
        instructorName: updated.instructorName,
        scheduledAt: updated.scheduledAt.toISOString(),
        status: updated.status,
        notes: updated.notes,
        cancellationReason: updated.cancellationReason,
      };
    },
  );
}
