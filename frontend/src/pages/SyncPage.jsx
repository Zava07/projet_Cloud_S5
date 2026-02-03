// src/pages/SyncPage.jsx
import React, { useState, useEffect } from 'react';

export default function SyncPage({ authUser }) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  // Charger l'historique des synchronisations
  const fetchSyncLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${apiBase()}/api/sync/logs`);
      if (res.ok) {
        const data = await res.json();
        setSyncLogs(data);
      }
    } catch (err) {
      console.error('Erreur chargement logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  // Synchronisation complète
  const handleFullSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const url = authUser?.id 
        ? `${apiBase()}/api/sync/full?userId=${authUser.id}`
        : `${apiBase()}/api/sync/full`;
      
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      fetchSyncLogs(); // Rafraîchir les logs
    } catch (err) {
      setSyncResult({ status: 'ERROR', error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  // Pull depuis Firebase
  const handlePull = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${apiBase()}/api/sync/pull`, { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      fetchSyncLogs();
    } catch (err) {
      setSyncResult({ status: 'ERROR', error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  // Push vers Firebase
  const handlePush = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${apiBase()}/api/sync/push`, { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      fetchSyncLogs();
    } catch (err) {
      setSyncResult({ status: 'ERROR', error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sync-page">
      <div className="page-header">
        <h1>🔄 Synchronisation Firebase</h1>
        <p className="subtitle">Synchroniser les données entre PostgreSQL et Firebase Firestore</p>
      </div>

      {/* Actions de synchronisation */}
      <div className="sync-actions">
        <div className="sync-card sync-card-full">
          <div className="sync-card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64"/>
              <polyline points="3 3 3 9 9 9"/>
              <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 6.36-2.64"/>
              <polyline points="21 21 21 15 15 15"/>
            </svg>
          </div>
          <h3>Synchronisation Complète</h3>
          <p>Synchroniser toutes les données dans les deux sens</p>
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleFullSync}
            disabled={syncing}
          >
            {syncing ? '⏳ Synchronisation...' : '🔄 Synchroniser tout'}
          </button>
        </div>

        <div className="sync-card sync-card-pull">
          <div className="sync-card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14"/>
              <path d="M19 12l-7 7-7-7"/>
            </svg>
          </div>
          <h3>Importer (Pull)</h3>
          <p>Firebase → PostgreSQL</p>
          <button 
            className="btn btn-secondary" 
            onClick={handlePull}
            disabled={syncing}
          >
            ⬇️ Importer depuis Firebase
          </button>
        </div>

        <div className="sync-card sync-card-push">
          <div className="sync-card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5"/>
              <path d="M5 12l7-7 7 7"/>
            </svg>
          </div>
          <h3>Exporter (Push)</h3>
          <p>PostgreSQL → Firebase</p>
          <button 
            className="btn btn-secondary" 
            onClick={handlePush}
            disabled={syncing}
          >
            ⬆️ Exporter vers Firebase
          </button>
        </div>
      </div>

      {/* Résultat de la synchronisation */}
      {syncResult && (
        <div className={`sync-result ${syncResult.status === 'success' ? 'success' : 'error'}`}>
          <h3>
            {syncResult.status === 'success' ? '✅ Synchronisation réussie' : '❌ Erreur de synchronisation'}
          </h3>
          {syncResult.status === 'success' ? (
            <div className="sync-stats">
              {syncResult.recordsPulled !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.recordsPulled}</span>
                  <span className="stat-label">Enregistrements importés</span>
                </div>
              )}
              {syncResult.recordsPushed !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.recordsPushed}</span>
                  <span className="stat-label">Enregistrements exportés</span>
                </div>
              )}
              {syncResult.usersPulled !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.usersPulled}</span>
                  <span className="stat-label">Utilisateurs importés</span>
                </div>
              )}
              {syncResult.reportsPulled !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.reportsPulled}</span>
                  <span className="stat-label">Rapports importés</span>
                </div>
              )}
              {syncResult.usersPushed !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.usersPushed}</span>
                  <span className="stat-label">Utilisateurs exportés</span>
                </div>
              )}
              {syncResult.reportsPushed !== undefined && (
                <div className="stat">
                  <span className="stat-value">{syncResult.reportsPushed}</span>
                  <span className="stat-label">Rapports exportés</span>
                </div>
              )}
              {syncResult.conflicts !== undefined && syncResult.conflicts > 0 && (
                <div className="stat stat-warning">
                  <span className="stat-value">{syncResult.conflicts}</span>
                  <span className="stat-label">Conflits détectés</span>
                </div>
              )}
            </div>
          ) : (
            <p className="error-message">{syncResult.error}</p>
          )}
        </div>
      )}

      {/* Historique des synchronisations */}
      <div className="sync-history">
        <h2>📜 Historique des synchronisations</h2>
        {loadingLogs ? (
          <p>Chargement...</p>
        ) : syncLogs.length === 0 ? (
          <p className="no-logs">Aucune synchronisation effectuée</p>
        ) : (
          <table className="sync-logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Importés</th>
                <th>Exportés</th>
                <th>Conflits</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.slice(0, 10).map((log) => (
                <tr key={log.id}>
                  <td>{log.syncedAt ? new Date(log.syncedAt).toLocaleString() : '-'}</td>
                  <td>{log.syncType || '-'}</td>
                  <td>{log.recordsPulled ?? 0}</td>
                  <td>{log.recordsPushed ?? 0}</td>
                  <td>{log.conflicts ?? 0}</td>
                  <td>
                    <span className={`status-badge ${log.status?.toLowerCase()}`}>
                      {log.status === 'success' ? '✅' : '❌'} {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .sync-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #6c757d;
          font-size: 1.1rem;
        }

        .sync-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .sync-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .sync-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .sync-card-icon {
          margin-bottom: 1rem;
          color: #4a90d9;
        }

        .sync-card-full .sync-card-icon {
          color: #28a745;
        }

        .sync-card-pull .sync-card-icon {
          color: #17a2b8;
        }

        .sync-card-push .sync-card-icon {
          color: #fd7e14;
        }

        .sync-card h3 {
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }

        .sync-card p {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838, #1abc9c);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .sync-result {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .sync-result.success {
          border-left: 4px solid #28a745;
        }

        .sync-result.error {
          border-left: 4px solid #dc3545;
        }

        .sync-result h3 {
          margin-bottom: 1rem;
        }

        .sync-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .stat {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          min-width: 120px;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #28a745;
        }

        .stat-warning .stat-value {
          color: #fd7e14;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
        }

        .error-message {
          color: #dc3545;
          background: #f8d7da;
          padding: 1rem;
          border-radius: 8px;
        }

        .sync-history {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .sync-history h2 {
          margin-bottom: 1rem;
          color: #1a1a2e;
        }

        .no-logs {
          color: #6c757d;
          text-align: center;
          padding: 2rem;
        }

        .sync-logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sync-logs-table th,
        .sync-logs-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .sync-logs-table th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .status-badge.success {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.error {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}
