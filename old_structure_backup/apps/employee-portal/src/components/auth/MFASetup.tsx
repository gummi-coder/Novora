import React, { useState } from 'react';
import { authService } from '../../services/auth';
import QRCode from 'qrcode.react';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'type' | 'setup' | 'verify'>('type');
  const [mfaType, setMfaType] = useState<'totp' | 'sms'>('totp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTypeSelect = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.setupMFA(mfaType);
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError('Failed to setup MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.verifyMFA(verificationCode);
      onComplete();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'type') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Setup Two-Factor Authentication</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose MFA Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="totp"
                  checked={mfaType === 'totp'}
                  onChange={(e) => setMfaType(e.target.value as 'totp')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Authenticator App (TOTP)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sms"
                  checked={mfaType === 'sms'}
                  onChange={(e) => setMfaType(e.target.value as 'sms')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">SMS</span>
              </label>
            </div>
          </div>

          {mfaType === 'sms' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input"
                placeholder="+1234567890"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleTypeSelect}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'setup' && setupData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Setup Authenticator App</h2>
        <div className="space-y-6">
          <div className="text-center">
            <QRCode value={setupData.qrCode} size={200} />
            <p className="mt-4 text-sm text-gray-600">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Backup Codes</h3>
            <p className="text-sm text-gray-600 mb-2">
              Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="input"
              placeholder="Enter 6-digit code"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 