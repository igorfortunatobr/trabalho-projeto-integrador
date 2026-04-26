import { FastifyInstance } from 'fastify';
import { buildAuthenticateRequest } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';

type RegisterInstructorRoutesOptions = {
  jwtSecret: string;
  userRepository: UserRepository;
};

export async function registerInstructorRoutes(
  fastify: FastifyInstance,
  options: RegisterInstructorRoutesOptions,
) {
  const authenticateRequest = buildAuthenticateRequest({
    jwtSecret: options.jwtSecret,
  });

  fastify.get(
    '/instructors',
    { preHandler: authenticateRequest },
    async () => {
      const instructors = await options.userRepository.listInstructors();

      return instructors.map((instructor) => ({
        id: instructor.id,
        name: instructor.name,
      }));
    },
  );
}
