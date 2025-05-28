"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'novora-super-secret-key-2024';
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Routes
app.post('/api/auth/signin', async (req, res) => {
    try {
        console.log('Received signin request:', req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Check for admin credentials
        if (email === 'aaa@aaa.is' && password === '12345678') {
            const token = jsonwebtoken_1.default.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            console.log('Signin successful for:', email);
            return res.json({
                token,
                role: 'admin',
                user: { email, role: 'admin' }
            });
        }
        console.log('Invalid credentials for:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    catch (error) {
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
        const user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.json({ message: 'This is a protected route', user });
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
