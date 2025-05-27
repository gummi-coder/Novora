import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await query('SELECT * FROM users;');
  res.status(200).json(users);
} 