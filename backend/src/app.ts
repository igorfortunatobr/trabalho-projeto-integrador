import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerHealthRoutes } from './routes/health.route';
import { registerUserRoutes } from './routes/users.route';
import { UserRepository } from './repositories/user.repository';

type BuildAppOptions = {
  userRepository: UserRepository;
};

export async function buildApp(options: BuildAppOptions) {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: '*',
  });

  await registerHealthRoutes(fastify);
  await registerUserRoutes(fastify, {
    userRepository: options.userRepository,
  });

  return fastify;
}
