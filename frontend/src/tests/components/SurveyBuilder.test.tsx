import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SurveyBuilderSteps from '../../components/survey/SurveyBuilderSteps';
import CreateSurvey from '../../pages/CreateSurvey';

// Mock the API service
vi.mock('../../services/survey', () => ({
  createSurvey: vi.fn(),
  updateSurvey: vi.fn(),
  getSurvey: vi.fn(),
  getQuestionBank: vi.fn(() => Promise.resolve([
    {
      id: 1,
      text: "How satisfied are you with your work?",
      category: "employee_satisfaction",
      question_type: "rating",
      options: ["1", "2", "3", "4", "5"]
    },
    {
      id: 2,
      text: "What would you like to improve?",
      category: "feedback",
      question_type: "text",
      options: []
    }
  ]))
}));

// Mock the auth context
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      role: 'owner'
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  })
}));

// Mock the toast
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SurveyBuilderSteps Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all steps correctly', () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Language & Branding')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Distribution')).toBeInTheDocument();
    expect(screen.getByText('Save & Send')).toBeInTheDocument();
  });

  it('shows step 1 (Basic Information) by default', () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    expect(screen.getByText('Survey Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Survey Type')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('allows navigation between steps', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Fill in basic information
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'A test survey description' }
    });
    
    // Navigate to next step
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });
  });

  it('validates required fields before proceeding', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Try to proceed without filling required fields
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText(/Survey title is required/i)).toBeInTheDocument();
    });
  });

  it('allows adding questions from question bank', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Fill basic info and go to questions step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });
    
    // Add question from bank
    fireEvent.click(screen.getByText('Add from Question Bank'));
    
    await waitFor(() => {
      expect(screen.getByText('How satisfied are you with your work?')).toBeInTheDocument();
    });
    
    // Select and add question
    fireEvent.click(screen.getByText('Add Question'));
    
    await waitFor(() => {
      expect(screen.getByText('Question added successfully')).toBeInTheDocument();
    });
  });

  it('allows creating custom questions', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Navigate to questions step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });
    
    // Create custom question
    fireEvent.click(screen.getByText('Create Custom Question'));
    
    fireEvent.change(screen.getByLabelText(/Question Text/i), {
      target: { value: 'What is your favorite color?' }
    });
    
    fireEvent.change(screen.getByLabelText(/Question Type/i), {
      target: { value: 'multiple_choice' }
    });
    
    fireEvent.click(screen.getByText('Add Option'));
    fireEvent.change(screen.getByLabelText(/Option 1/i), {
      target: { value: 'Red' }
    });
    
    fireEvent.click(screen.getByText('Save Question'));
    
    await waitFor(() => {
      expect(screen.getByText('Question created successfully')).toBeInTheDocument();
    });
  });

  it('allows reordering questions', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Add multiple questions first
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });
    
    // Add questions from bank
    fireEvent.click(screen.getByText('Add from Question Bank'));
    fireEvent.click(screen.getByText('Add Question'));
    
    // Create custom question
    fireEvent.click(screen.getByText('Create Custom Question'));
    fireEvent.change(screen.getByLabelText(/Question Text/i), {
      target: { value: 'Custom question' }
    });
    fireEvent.click(screen.getByText('Save Question'));
    
    // Test reordering
    const moveUpButtons = screen.getAllByText('↑');
    if (moveUpButtons.length > 0) {
      fireEvent.click(moveUpButtons[0]);
    }
  });

  it('shows preview mode correctly', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Complete basic setup and go to preview
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    // Skip to preview step
    fireEvent.click(screen.getByText('Preview'));
    
    await waitFor(() => {
      expect(screen.getByText('Survey Preview')).toBeInTheDocument();
    });
    
    // Test desktop/mobile toggle
    fireEvent.click(screen.getByText('Mobile'));
    expect(screen.getByText('Mobile Preview')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Desktop'));
    expect(screen.getByText('Desktop Preview')).toBeInTheDocument();
  });

  it('handles survey saving correctly', async () => {
    const { createSurvey } = await import('../../services/survey');
    (createSurvey as any).mockResolvedValue({ id: 1, title: 'Test Survey' });
    
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Complete survey setup
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    // Skip to save step
    fireEvent.click(screen.getByText('Save & Send'));
    
    await waitFor(() => {
      expect(screen.getByText('Save Survey')).toBeInTheDocument();
    });
    
    // Save survey
    fireEvent.click(screen.getByText('Save as Draft'));
    
    await waitFor(() => {
      expect(createSurvey).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Survey',
        status: 'draft'
      }));
    });
  });

  it('handles survey distribution settings', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Navigate to distribution step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Distribution'));
    
    await waitFor(() => {
      expect(screen.getByText('Distribution Settings')).toBeInTheDocument();
    });
    
    // Test email distribution
    fireEvent.click(screen.getByText('Email Distribution'));
    fireEvent.change(screen.getByLabelText(/Email List/i), {
      target: { value: 'test@example.com, user@example.com' }
    });
    
    // Test QR code generation
    fireEvent.click(screen.getByText('Generate QR Code'));
    expect(screen.getByText('QR Code Generated')).toBeInTheDocument();
    
    // Test link sharing
    fireEvent.click(screen.getByText('Copy Link'));
    expect(screen.getByText('Link copied to clipboard')).toBeInTheDocument();
  });

  it('handles language and branding settings', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Navigate to branding step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Language & Branding'));
    
    await waitFor(() => {
      expect(screen.getByText('Language & Branding')).toBeInTheDocument();
    });
    
    // Test language selection
    fireEvent.change(screen.getByLabelText(/Language/i), {
      target: { value: 'es' }
    });
    
    // Test branding customization
    fireEvent.change(screen.getByLabelText(/Primary Color/i), {
      target: { value: '#3B82F6' }
    });
    
    fireEvent.change(screen.getByLabelText(/Logo URL/i), {
      target: { value: 'https://example.com/logo.png' }
    });
    
    // Test preview
    fireEvent.click(screen.getByText('Preview Changes'));
    expect(screen.getByText('Branding Preview')).toBeInTheDocument();
  });

  it('handles survey settings correctly', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Navigate to settings step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Settings'));
    
    await waitFor(() => {
      expect(screen.getByText('Survey Settings')).toBeInTheDocument();
    });
    
    // Test anonymous responses
    fireEvent.click(screen.getByLabelText(/Allow Anonymous Responses/i));
    
    // Test response limits
    fireEvent.change(screen.getByLabelText(/Maximum Responses/i), {
      target: { value: '100' }
    });
    
    // Test expiration date
    fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
      target: { value: '2024-12-31' }
    });
    
    // Test auto-close
    fireEvent.click(screen.getByLabelText(/Auto-close after expiration/i));
  });

  it('handles form validation correctly', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Test invalid email in distribution
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Distribution'));
    
    await waitFor(() => {
      expect(screen.getByText('Distribution Settings')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Email Distribution'));
    fireEvent.change(screen.getByLabelText(/Email List/i), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.click(screen.getByText('Send Survey'));
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    const { createSurvey } = await import('../../services/survey');
    (createSurvey as any).mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Try to save with network error
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Save & Send'));
    
    await waitFor(() => {
      expect(screen.getByText('Save Survey')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Save as Draft'));
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to save survey/i)).toBeInTheDocument();
    });
  });

  it('maintains state between step navigation', async () => {
    renderWithRouter(<SurveyBuilderSteps />);
    
    // Fill basic info
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test description' }
    });
    
    // Navigate away and back
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Previous'));
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Survey')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });
  });
});

describe('CreateSurvey Page', () => {
  it('renders the survey builder correctly', () => {
    renderWithRouter(<CreateSurvey />);
    
    expect(screen.getByText('Create New Survey')).toBeInTheDocument();
    expect(screen.getByText('Survey Builder')).toBeInTheDocument();
  });

  it('handles page navigation', () => {
    renderWithRouter(<CreateSurvey />);
    
    // Test breadcrumb navigation
    fireEvent.click(screen.getByText('Dashboard'));
    // Should navigate to dashboard
    
    fireEvent.click(screen.getByText('Surveys'));
    // Should navigate to surveys list
  });

  it('shows loading states', async () => {
    const { getQuestionBank } = await import('../../services/survey');
    (getQuestionBank as any).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve([]), 1000);
    }));
    
    renderWithRouter(<CreateSurvey />);
    
    // Navigate to questions step
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Loading questions...')).toBeInTheDocument();
  });
});
