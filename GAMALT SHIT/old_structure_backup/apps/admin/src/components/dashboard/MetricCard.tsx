import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary.main',
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : isNegative ? (
                  <TrendingDown color="error" fontSize="small" />
                ) : null}
                <Typography
                  variant="body2"
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
                  sx={{ ml: 0.5 }}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color },
              })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 