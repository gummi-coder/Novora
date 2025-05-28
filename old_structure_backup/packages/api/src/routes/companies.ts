import { Router } from 'express';
import Company from '../models/Company';

const router = Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const {
      name,
      plan,
      users,
      activeUsers,
      billingCycle,
      status,
      nextPayment,
      surveysSent,
      responsesCollected,
      eNPS,
      totalEmployees,
      managers,
      departments,
      industry,
      companySize,
      foundedYear,
      headquarters,
      website,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name,
      plan,
      users,
      activeUsers,
      billingCycle,
      status,
      nextPayment,
      surveysSent,
      responsesCollected,
      eNPS,
      totalEmployees,
      managers,
      departments,
      industry,
      companySize,
      foundedYear,
      headquarters,
      website,
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.update(req.body);
    res.status(200).json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get billing metrics
router.get('/metrics/billing', async (req, res) => {
  try {
    const companies = await Company.findAll();
    
    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = companies.reduce((total, company) => {
      const planPrice = {
        'Basic': 99,
        'Premium': 249,
        'Enterprise': 499
      }[company.plan];
      
      return total + (company.billingCycle === 'Monthly' ? planPrice : planPrice / 12);
    }, 0);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calculate ARPU (Average Revenue Per User)
    const totalUsers = companies.reduce((total, company) => total + company.users, 0);
    const arpu = totalUsers > 0 ? mrr / totalUsers : 0;

    // Calculate Plan Distribution
    const planDistribution = companies.reduce((acc, company) => {
      acc[company.plan] = (acc[company.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCompanies = companies.length;
    const planDistributionPercentages = Object.entries(planDistribution).reduce((acc, [plan, count]) => {
      acc[plan] = (count / totalCompanies) * 100;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      mrr,
      arr,
      arpu,
      planDistribution: planDistributionPercentages,
      totalCompanies,
      companiesByPlan: planDistribution
    });
  } catch (error) {
    console.error('Error fetching billing metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 