import { FastifyInstance } from 'fastify';
import { buildAuthenticateRequest } from '../middlewares/auth.middleware';

type RegisterProfileRoutesOptions = {
  jwtSecret: string;
};

export async function registerProfileRoutes(
  fastify: FastifyInstance,
  options: RegisterProfileRoutesOptions,
) {
  const authenticateRequest = buildAuthenticateRequest({
    jwtSecret: options.jwtSecret,
  });

  fastify.get(
    '/profile',
    { preHandler: authenticateRequest },
    async (request) => ({
      id: Number(request.user.sub),
      name: request.user.name,
      email: request.user.email,
    }),
  );
}
