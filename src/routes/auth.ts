import { FastifyInstance } from 'fastify';

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    }
  }
};

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', { schema: loginSchema }, async (request, reply) => {
    // Simulate auth logic
    return { message: 'Login successful' };
  });
} 