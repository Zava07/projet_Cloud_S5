// src/pages/ReportsListPage.jsx
import React, { useState, useEffect } from 'react';

export default function ReportsListPage({ authUser, onPageChange }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    fetchReports();
  }, [authUser]);

  const fetchReports = async () => {
    if (!authUser || authUser.guest) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Récupérer les rapports de l'utilisateur connecté
      const response = await fetch(`${apiBase()}/api/reports?userId=${authUser.id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports:', err);
      setError('Impossible de charger les rapports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'nouveau':
        return 'badge badge-primary';
      case 'en_cours':
        return 'badge badge-warning';
      case 'resolu':
        return 'badge badge-success';
      case 'ferme':
        return 'badge badge-secondary';
      default:
        return 'badge badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authUser?.guest) {
    return (
      <div className="reports-container">
        <div className="page-header">
          <h2>📋 Mes Rapports</h2>
          <p className="page-subtitle">Gérez vos signalements</p>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="empty-state">
              <span className="empty-icon">🔒</span>
              <h3>Connexion requise</h3>
              <p>Vous devez être connecté pour voir vos rapports.</p>
              <button className="btn btn-primary" onClick={() => onPageChange('login')}>
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h2>📋 Mes Rapports</h2>
            <p className="page-subtitle">
              {reports.length} rapport{reports.length !== 1 ? 's' : ''} trouvé{reports.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => onPageChange('map')}
          >
            ➕ Nouveau rapport
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body text-center">
            <div className="loading-spinner"></div>
            <p>Chargement des rapports...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">
              <strong>Erreur :</strong> {error}
            </div>
            <button className="btn btn-outline" onClick={fetchReports}>
              🔄 Réessayer
            </button>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>Aucun rapport</h3>
              <p>Vous n'avez pas encore créé de rapport. Cliquez sur la carte pour signaler un problème !</p>
              <button className="btn btn-primary" onClick={() => onPageChange('map')}>
                🗺️ Aller à la carte
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.id} className="card report-card">
              <div className="card-header">
                <div className="report-header">
                  <div className="report-id">
                    <span className="report-number">#{report.id}</span>
                    <span className={getStatusBadgeClass(report.status)}>
                      {report.status || 'Nouveau'}
                    </span>
                  </div>
                  <div className="report-date">
                    {formatDate(report.createdAt)}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="report-location">
                  <span className="location-icon">📍</span>
                  <span className="coordinates">
                    {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                  </span>
                </div>
                {report.description && (
                  <div className="report-description">
                    <p>{report.description}</p>
                  </div>
                )}
                {report.surface && (
                  <div className="report-surface">
                    <span className="surface-icon">📐</span>
                    Surface: {report.surface} m²
                  </div>
                )}
                {report.budget && (
                  <div className="report-budget">
                    <span className="budget-icon">💰</span>
                    Budget estimé: {report.budget} €
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    // Navigation vers la carte centrée sur ce rapport
                    onPageChange('map', { 
                      centerLat: report.latitude, 
                      centerLng: report.longitude 
                    });
                  }}
                >
                  🗺️ Voir sur la carte
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    // Navigation vers la carte centrée sur ce rapport
                    onPageChange('map', { 
                      centerLat: report.latitude, 
                      centerLng: report.longitude 
                    });
                  }}
                >
                  Attribuer a un entreprise
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}