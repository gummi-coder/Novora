import React, { useState } from 'react';
import { authService } from '../../services/auth';

interface PasswordResetProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset({ email });
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword({ token, password });
      onComplete();
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'request') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        {success ? (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              Password reset instructions have been sent to your email.
            </p>
            <button
              onClick={onCancel}
              className="btn btn-primary"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Set New Password</h2>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reset Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}; 