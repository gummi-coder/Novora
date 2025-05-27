import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyFormState, RatingScaleQuestion } from '../../types/survey';
import { RatingScaleQuestionEditor } from './RatingScaleQuestionEditor';
import { Button, TextField, Switch, FormControlLabel, Box, Typography, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const initialFormState: SurveyFormState = {
  title: '',
  description: '',
  startDate: null,
  endDate: null,
  isAnonymous: false,
  isRepeatable: false,
  questions: [],
};

export const SurveyBuilder: React.FC = () => {
  const [formState, setFormState] = useState<SurveyFormState>(initialFormState);

  const handleAddQuestion = () => {
    const newQuestion: RatingScaleQuestion = {
      id: uuidv4(),
      type: 'RATING_SCALE',
      label: '',
      required: true,
      minLabel: 'Not at all',
      maxLabel: 'Extremely',
      order: formState.questions.length,
    };

    setFormState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const handleQuestionChange = (updatedQuestion: RatingScaleQuestion) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    }));
  };

  const handleQuestionDelete = (questionId: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  };

  const handleQuestionReorder = (questionId: string, newOrder: number) => {
    setFormState(prev => {
      const questions = [...prev.questions];
      const questionIndex = questions.findIndex(q => q.id === questionId);
      const question = questions[questionIndex];
      
      questions.splice(questionIndex, 1);
      questions.splice(newOrder, 0, question);
      
      return {
        ...prev,
        questions: questions.map((q, index) => ({ ...q, order: index })),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save survey
    console.log('Submitting survey:', formState);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h4" gutterBottom>
            Create New Survey
          </Typography>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Survey Title"
              value={formState.title}
              onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formState.description}
              onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={formState.startDate}
                onChange={(date) => setFormState(prev => ({ ...prev, startDate: date }))}
                sx={{ flex: 1 }}
              />
              <DatePicker
                label="End Date"
                value={formState.endDate}
                onChange={(date) => setFormState(prev => ({ ...prev, endDate: date }))}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.isAnonymous}
                    onChange={(e) => setFormState(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  />
                }
                label="Anonymous Survey"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.isRepeatable}
                    onChange={(e) => setFormState(prev => ({ ...prev, isRepeatable: e.target.checked }))}
                  />
                }
                label="Allow Multiple Submissions"
              />
            </Box>
          </Box>

          <Typography variant="h5" gutterBottom>
            Questions
          </Typography>

          {formState.questions.map((question, index) => (
            <RatingScaleQuestionEditor
              key={question.id}
              question={question}
              onChange={handleQuestionChange}
              onDelete={handleQuestionDelete}
              onReorder={handleQuestionReorder}
              index={index}
              totalQuestions={formState.questions.length}
            />
          ))}

          <Button
            variant="outlined"
            onClick={handleAddQuestion}
            sx={{ mt: 2, mb: 4 }}
          >
            Add Question
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formState.title || formState.questions.length === 0}
            >
              Create Survey
            </Button>
          </Box>
        </form>
      </Paper>
    </LocalizationProvider>
  );
}; 