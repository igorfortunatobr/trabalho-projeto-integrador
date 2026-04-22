import 'fastify';
import { AuthTokenPayload } from '../services/jwt.service';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthTokenPayload;
  }
}
