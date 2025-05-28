## Keyra bakenda í gang
uvicorn app.main:app



# Employee Survey System

A comprehensive employee survey system with a dashboard for administrators and a frontend application for employees.

## Project Structure

- `Dashbord Enterprice/` - Admin dashboard application
- `employee_survey_frontend/` - Employee survey frontend application

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (v4.4 or higher)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install dashboard dependencies
   cd "Dashbord Enterprice"
   npm install

   # Install employee survey frontend dependencies
   cd ../employee_survey_frontend
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both project directories
   - Update the values in `.env` files with your configuration

4. Start the development servers:
   ```bash
   # Start dashboard
   cd "Dashbord Enterprice"
   npm run dev

   # Start employee survey frontend
   cd ../employee_survey_frontend
   npm run dev
   ```

## Features

### Dashboard
- User authentication and authorization
- Survey management (create, edit, delete)
- Response analytics and reporting
- Real-time notifications
- User management

### Employee Survey Frontend
- User authentication
- Survey participation
- Response submission
- Progress tracking
- Mobile-responsive design

## Development

### Code Style
- Follow the existing code style
- Use TypeScript for type safety
- Follow React best practices
- Use Redux for state management

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

## Deployment

1. Build both applications:
   ```bash
   # Build dashboard
   cd "Dashbord Enterprice"
   npm run build

   # Build employee survey frontend
   cd ../employee_survey_frontend
   npm run build
   ```

2. Deploy the built files to your hosting provider

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 