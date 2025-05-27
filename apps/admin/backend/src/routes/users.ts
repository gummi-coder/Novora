import { Router, Request, Response } from 'express';
import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  role: Role;
}

interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: Role;
}

// Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateUserRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 