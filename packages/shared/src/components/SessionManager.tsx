import React, { useEffect, useState } from 'react';
import { useAuthProtection } from '../middleware/frontend-security';
import { Session } from '../types/survey';
import { secureApiRequest } from '../middleware/frontend-security';
import { formatDistanceToNow } from 'date-fns';

interface SessionManagerProps {
  onSessionRevoked?: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ onSessionRevoked }) => {
  const { isAuthenticated } = useAuthProtection();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await secureApiRequest<Session[]>('/api/sessions', {
        method: 'GET',
      });
      setSessions(data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sessions');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await secureApiRequest(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      setSessions(sessions.filter(s => s.id !== sessionId));
      onSessionRevoked?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to revoke session');
      setError(error);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await secureApiRequest('/api/sessions', {
        method: 'DELETE',
      });
      setSessions([]);
      onSessionRevoked?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to revoke all sessions');
      setError(error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to manage sessions</div>;
  }

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="session-manager">
      <div className="session-manager-header">
        <h2>Active Sessions</h2>
        <button
          onClick={handleRevokeAllSessions}
          className="btn btn-danger"
        >
          Revoke All Sessions
        </button>
      </div>

      <div className="session-list">
        {sessions.map(session => (
          <div key={session.id} className="session-item">
            <div className="session-info">
              <div className="device-info">
                <span className="device-name">{session.deviceInfo.name}</span>
                <span className="device-type">{session.deviceInfo.type}</span>
                <span className="browser">{session.deviceInfo.browser}</span>
                <span className="os">{session.deviceInfo.os}</span>
              </div>
              
              <div className="location-info">
                {session.deviceInfo.location && (
                  <>
                    <span className="country">{session.deviceInfo.location.country}</span>
                    <span className="city">{session.deviceInfo.location.city}</span>
                  </>
                )}
                <span className="ip">{session.deviceInfo.ip}</span>
              </div>

              <div className="session-meta">
                <span className="last-activity">
                  Last active: {formatDistanceToNow(session.lastActivity)} ago
                </span>
                <span className="created-at">
                  Created: {formatDistanceToNow(session.createdAt)} ago
                </span>
              </div>
            </div>

            <div className="session-actions">
              <button
                onClick={() => handleRevokeSession(session.id)}
                className="btn btn-warning"
              >
                Revoke Session
              </button>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="no-sessions">
            No active sessions found
          </div>
        )}
      </div>

      <style jsx>{`
        .session-manager {
          padding: 1rem;
        }

        .session-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .session-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background-color: white;
        }

        .session-info {
          flex: 1;
        }

        .device-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .location-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          color: #64748b;
        }

        .session-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .session-actions {
          margin-left: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-danger {
          background-color: #ef4444;
          color: white;
        }

        .btn-warning {
          background-color: #f59e0b;
          color: white;
        }

        .no-sessions {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}; 