import { FastifyRequest, FastifyReply } from 'fastify';

export const validateRequest = (schema: any) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.validateInput(schema);
    } catch (err) {
      reply.status(400).send(err);
    }
  };
}; 