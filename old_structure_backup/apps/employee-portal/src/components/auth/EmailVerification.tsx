import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth';

interface EmailVerificationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  onComplete,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authService.requestEmailVerification({ email });
      setSuccess(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authService.verifyEmail(token);
      onComplete();
    } catch (err) {
      setError('Invalid verification token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Email Verification</h2>
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
            Verification email has been sent. Please check your inbox.
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              You can request another email in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleRequestVerification}
              className="btn btn-primary"
              disabled={loading}
            >
              Resend Verification Email
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleRequestVerification} className="space-y-4">
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
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-medium mb-4">Already have a verification code?</h3>
        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 