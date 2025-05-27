import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

type Plan = 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
type BillingCycle = 'MONTHLY' | 'ANNUAL';
type Status = 'ACTIVE' | 'PAYMENT_FAILED' | 'INACTIVE';
type CompanySize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

interface CreateCompanyRequest {
  name: string;
  plan: Plan;
  users: number;
  activeUsers: number;
  billingCycle: BillingCycle;
  status: Status;
  nextPayment: Date;
  surveysSent: number;
  responsesCollected: number;
  eNPS: number;
  totalEmployees: number;
  managers: number;
  departments: number;
  industry: string;
  companySize: CompanySize;
  foundedYear?: number;
  headquarters?: string;
  website?: string;
}

// Get all companies
router.get('/', async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single company
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create company
router.post('/', async (req: Request<{}, any, CreateCompanyRequest>, res: Response) => {
  try {
    const companyData = req.body;
    const company = await prisma.company.create({
      data: companyData,
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company
router.put('/:id', async (req: Request<{ id: string }, any, Partial<CreateCompanyRequest>>, res: Response) => {
  try {
    const { id } = req.params;
    const companyData = req.body;
    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: companyData,
    });
    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete company
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 