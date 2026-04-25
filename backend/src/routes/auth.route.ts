import { FastifyInstance } from 'fastify';
import { UserRepository } from '../repositories/user.repository';
import { generateToken } from '../services/jwt.service';
import {
  authenticateUser,
  InvalidCredentialsError,
  LoginValidationError,
} from '../services/login.service';

type RegisterAuthRoutesOptions = {
  userRepository: UserRepository;
  jwtSecret: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

export async function registerAuthRoutes(
  fastify: FastifyInstance,
  options: RegisterAuthRoutesOptions,
) {
  fastify.post<{ Body: LoginBody }>('/auth/login', async (request, reply) => {
    try {
      const user = await authenticateUser(
        request.body ?? {},
        options.userRepository,
      );

      const token = generateToken(
        {
          sub: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        options.jwtSecret,
      );

      return reply.send({ token });
    } catch (error) {
      if (error instanceof LoginValidationError) {
        return reply.status(400).send({ message: error.message });
      }

      if (error instanceof InvalidCredentialsError) {
        return reply.status(401).send({ message: error.message });
      }

      throw error;
    }
  });
}
