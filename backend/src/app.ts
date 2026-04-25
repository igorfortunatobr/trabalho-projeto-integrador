import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerAuthRoutes } from './routes/auth.route';
import { registerHealthRoutes } from './routes/health.route';
import { registerInstructorRoutes } from './routes/instructors.route';
import { registerProfileRoutes } from './routes/profile.route';
import { registerUserRoutes } from './routes/users.route';
import { UserRepository } from './repositories/user.repository';

type BuildAppOptions = {
  userRepository: UserRepository;
  jwtSecret?: string;
};

export async function buildApp(options: BuildAppOptions) {
  const fastify = Fastify({ logger: true });
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? 'supersecretjwt';

  await fastify.register(cors, {
    origin: '*',
  });

  await registerHealthRoutes(fastify);
  await registerAuthRoutes(fastify, {
    userRepository: options.userRepository,
    jwtSecret,
  });
  await registerProfileRoutes(fastify, {
    jwtSecret,
  });
  await registerInstructorRoutes(fastify, {
    jwtSecret,
    userRepository: options.userRepository,
  });
  await registerUserRoutes(fastify, {
    userRepository: options.userRepository,
  });

  return fastify;
}
