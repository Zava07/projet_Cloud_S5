import React from 'react';

/**
 * Modale affichée lorsque la session est proche de l'expiration
 * ou lorsqu'elle a expiré
 */
export default function SessionExpirationModal({ 
  isOpen, 
  minutesLeft, 
  isExpired,
  onExtend, 
  onLogout,
  loading 
}) {
  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay">
      <div className="session-modal">
        <div className="session-modal-icon">
          {isExpired ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          )}
        </div>
        
        <h2 className="session-modal-title">
          {isExpired ? 'Session expirée' : 'Session bientôt expirée'}
        </h2>
        
        <p className="session-modal-message">
          {isExpired 
            ? 'Votre session a expiré. Veuillez vous reconnecter pour continuer.'
            : `Votre session expire dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Voulez-vous prolonger votre session ?`
          }
        </p>

        <div className="session-modal-actions">
          {isExpired ? (
            <button 
              className="session-modal-btn session-modal-btn-primary"
              onClick={onLogout}
            >
              Se reconnecter
            </button>
          ) : (
            <>
              <button 
                className="session-modal-btn session-modal-btn-secondary"
                onClick={onLogout}
                disabled={loading}
              >
                Se déconnecter
              </button>
              <button 
                className="session-modal-btn session-modal-btn-primary"
                onClick={onExtend}
                disabled={loading}
              >
                {loading ? 'Prolongation...' : 'Prolonger la session'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .session-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .session-modal {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .session-modal-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .session-modal-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .session-modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px;
        }

        .session-modal-message {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 24px;
        }

        .session-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .session-modal-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .session-modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .session-modal-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
        }

        .session-modal-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .session-modal-btn-secondary {
          background: #f3f4f6;
          color: #4b5563;
        }

        .session-modal-btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
