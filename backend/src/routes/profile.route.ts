import { FastifyInstance, FastifyRequest } from 'fastify';
import { buildAuthenticateRequest } from '../middlewares/auth.middleware';
import { AuthTokenPayload } from '../services/jwt.service';

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
    async (request) => {
      const authenticatedRequest = request as FastifyRequest & {
        user: AuthTokenPayload;
      };

      return {
        id: Number(authenticatedRequest.user.sub),
        name: authenticatedRequest.user.name,
        email: authenticatedRequest.user.email,
        role: authenticatedRequest.user.role,
      };
    },
  );
}
