import { z } from 'zod';

const envSchema = z.object({
  GRAFANA_API_URL: z.string().url(),
  GRAFANA_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
};

export const env = validateEnv(); 