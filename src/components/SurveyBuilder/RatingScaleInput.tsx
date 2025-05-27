import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { RatingScaleQuestion } from '../../types/survey';

interface RatingScaleInputProps {
  question: RatingScaleQuestion;
  value?: number;
  onChange?: (value: number) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  preview?: boolean;
}

export const RatingScaleInput: React.FC<RatingScaleInputProps> = ({
  question,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  preview = false,
}) => {
  const marks = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));

  return (
    <FormControl
      fullWidth
      error={error}
      disabled={disabled}
      sx={{ mb: 2 }}
    >
      <Typography
        variant={preview ? 'subtitle1' : 'body1'}
        gutterBottom
        sx={{ fontWeight: preview ? 'bold' : 'normal' }}
      >
        {question.label}
        {question.required && !preview && (
          <Typography
            component="span"
            color="error"
            sx={{ ml: 0.5 }}
          >
            *
          </Typography>
        )}
      </Typography>

      <Box sx={{ px: 2, py: 1 }}>
        <Slider
          value={value ?? 5}
          onChange={(_, newValue) => onChange?.(newValue as number)}
          min={1}
          max={10}
          step={1}
          marks={marks}
          disabled={disabled}
          valueLabelDisplay="auto"
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 2,
          mt: -1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {question.minLabel || '1'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {question.maxLabel || '10'}
        </Typography>
      </Box>

      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}; 