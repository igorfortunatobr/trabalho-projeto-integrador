import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Redis } from 'ioredis';
import { registerHealthRoutes } from './routes/health.route';

dotenv.config();

const fastify = Fastify({ logger: true });

// Variables
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

// Configure CORS
fastify.register(cors, {
  origin: '*',
});

// Register routes
registerHealthRoutes(fastify);

// Prepare connections (Optional check on boot)
async function start() {
  try {
    // Basic Redis connection readiness print
    const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    });
    
    redis.on('connect', () => {
      fastify.log.info('Redis connected (preparado)');
    });

    // Basic MySQL connection test
    const mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'autecno',
    });

    await mysqlPool.query('SELECT 1');
    fastify.log.info('MySQL connected (preparado)');

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://0.0.0.0:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
