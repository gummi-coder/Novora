import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SurveyResponseSuccessProps {
  surveyTitle: string;
  isRepeatable?: boolean;
}

export const SurveyResponseSuccess: React.FC<SurveyResponseSuccessProps> = ({
  surveyTitle,
  isRepeatable,
}) => {
  const navigate = useNavigate();

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', my: 4, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <CheckCircleOutlineIcon
          color="success"
          sx={{ fontSize: 64, mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Thank You!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your response for "{surveyTitle}" has been submitted successfully.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {isRepeatable && (
          <Button
            variant="outlined"
            onClick={() => navigate(0)} // Reload the current page
          >
            Submit Another Response
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => navigate('/surveys')}
        >
          Back to Surveys
        </Button>
      </Box>
    </Paper>
  );
}; 