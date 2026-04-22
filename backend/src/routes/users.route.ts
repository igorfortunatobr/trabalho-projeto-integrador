import { FastifyInstance } from 'fastify';
import { CreateUserData, UserRepository } from '../repositories/user.repository';

type RegisterUserRoutesOptions = {
  userRepository: UserRepository;
};

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function registerUserRoutes(
  fastify: FastifyInstance,
  options: RegisterUserRoutesOptions,
) {
  fastify.post<{ Body: CreateUserBody }>('/users', async (request, reply) => {
    const body = request.body ?? {};

    const userData: CreateUserData = {
      name: body.name ?? '',
      email: body.email ?? '',
      passwordHash: body.password ?? '',
    };

    const createdUser = await options.userRepository.create(userData);

    return reply.status(201).send({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    });
  });
}
