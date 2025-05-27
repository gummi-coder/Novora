import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';
import {
  DragHandle as DragHandleIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { RatingScaleQuestion } from '../../types/survey';

interface RatingScaleQuestionEditorProps {
  question: RatingScaleQuestion;
  onChange: (question: RatingScaleQuestion) => void;
  onDelete: (questionId: string) => void;
  onReorder: (questionId: string, newOrder: number) => void;
  index: number;
  totalQuestions: number;
}

export const RatingScaleQuestionEditor: React.FC<RatingScaleQuestionEditorProps> = ({
  question,
  onChange,
  onDelete,
  onReorder,
  index,
  totalQuestions,
}) => {
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      label: e.target.value,
    });
  };

  const handleMinLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      minLabel: e.target.value,
    });
  };

  const handleMaxLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      maxLabel: e.target.value,
    });
  };

  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      required: e.target.checked,
    });
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        position: 'relative',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <IconButton
            size="small"
            disabled={index === 0}
            onClick={() => onReorder(question.id, index - 1)}
          >
            <ArrowUpwardIcon />
          </IconButton>
          <IconButton
            size="small"
            disabled={index === totalQuestions - 1}
            onClick={() => onReorder(question.id, index + 1)}
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Question"
              value={question.label}
              onChange={handleLabelChange}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Label (1)"
                value={question.minLabel}
                onChange={handleMinLabelChange}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Max Label (10)"
                value={question.maxLabel}
                onChange={handleMaxLabelChange}
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={question.required}
                  onChange={handleRequiredChange}
                />
              }
              label="Required"
            />
          </Stack>
        </Box>

        <IconButton
          color="error"
          onClick={() => onDelete(question.id)}
          sx={{ mt: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Rating Scale (1-10)
        </Typography>
      </Box>
    </Paper>
  );
}; 