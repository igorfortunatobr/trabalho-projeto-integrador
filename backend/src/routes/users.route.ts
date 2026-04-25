import { FastifyInstance } from 'fastify';
import { UserRepository } from '../repositories/user.repository';
import {
  DuplicateEmailError,
  registerUser,
  ValidationError,
} from '../services/register-user.service';

type RegisterUserRoutesOptions = {
  userRepository: UserRepository;
};

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'instructor';
};

export async function registerUserRoutes(
  fastify: FastifyInstance,
  options: RegisterUserRoutesOptions,
) {
  fastify.post<{ Body: CreateUserBody }>('/users', async (request, reply) => {
    try {
      const createdUser = await registerUser(
        request.body ?? {},
        options.userRepository,
      );

      return reply.status(201).send({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({
          message: error.message,
        });
      }

      if (error instanceof DuplicateEmailError) {
        return reply.status(409).send({
          message: error.message,
        });
      }

      throw error;
    }
  });
}
