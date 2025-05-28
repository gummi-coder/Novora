import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import usersRouter from './routes/users';
import companiesRouter from './routes/companies';
import alertsRouter from './routes/alerts';
import sequelize from './config/database';
import User from './models/User';
import Company from './models/Company';
import Alert from './models/Alert';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'novora-super-secret-key-2024';

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync();
    console.log('Database models synchronized successfully.');

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'aaa@aaa.is' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'aaa@aaa.is',
        password: '12345678',
        role: 'admin'
      });
      console.log('Default admin user created.');
    }

    // Create sample companies if none exist
    const companyCount = await Company.count();
    if (companyCount === 0) {
      await Company.bulkCreate([
        {
          name: 'Acme Inc.',
          plan: 'Enterprise',
          users: 500,
          activeUsers: 450,
          billingCycle: 'Annual',
          status: 'Active',
          nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          surveysSent: 1200,
          responsesCollected: 980,
          eNPS: 45,
          totalEmployees: 500,
          managers: 50,
          departments: 8,
          industry: 'Technology',
          companySize: 'Large',
          foundedYear: 1995,
          headquarters: 'San Francisco, CA',
          website: 'https://acme.example.com'
        },
        {
          name: 'TechCorp',
          plan: 'Premium',
          users: 200,
          activeUsers: 180,
          billingCycle: 'Monthly',
          status: 'Active',
          nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          surveysSent: 800,
          responsesCollected: 650,
          eNPS: 38,
          totalEmployees: 200,
          managers: 25,
          departments: 5,
          industry: 'Software',
          companySize: 'Medium',
          foundedYear: 2010,
          headquarters: 'New York, NY',
          website: 'https://techcorp.example.com'
        },
        {
          name: 'GlobalTech',
          plan: 'Basic',
          users: 50,
          activeUsers: 45,
          billingCycle: 'Monthly',
          status: 'Active',
          nextPayment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          surveysSent: 300,
          responsesCollected: 250,
          eNPS: 42,
          totalEmployees: 50,
          managers: 8,
          departments: 3,
          industry: 'IT Services',
          companySize: 'Small',
          foundedYear: 2018,
          headquarters: 'Boston, MA',
          website: 'https://globaltech.example.com'
        }
      ]);
      console.log('Sample companies created.');
    }

    // Create sample alerts if none exist
    const alertCount = await Alert.count();
    if (alertCount === 0) {
      await Alert.bulkCreate([
        {
          type: 'error',
          title: 'Database Connection Error',
          message: 'Failed to connect to the main database server',
          source: 'Database Service',
          status: 'active',
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Server memory usage is above 80%',
          source: 'System Monitor',
          status: 'active',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'info',
          title: 'System Update Available',
          message: 'New system update is ready to be installed',
          source: 'Update Service',
          status: 'active',
          priority: 'low',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'success',
          title: 'Backup Completed',
          message: 'Daily backup completed successfully',
          source: 'Backup Service',
          status: 'resolved',
          priority: 'low',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
        }
      ]);
      console.log('Sample alerts created.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize database before starting the server
initializeDatabase();

// Routes
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/alerts', alertsRouter);

app.post('/api/auth/signin', async (req, res) => {
  try {
    console.log('Received signin request:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (user && await user.comparePassword(password)) {
      const token = jwt.sign(
        { email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('Signin successful for:', email);
      return res.json({ 
        token, 
        role: user.role,
        user: { email: user.email, role: user.role }
      });
    }

    console.log('Invalid credentials for:', email);
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ message: 'This is a protected route', user });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 