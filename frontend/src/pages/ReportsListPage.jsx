// src/pages/ReportsListPage.jsx
import React, { useState, useEffect } from 'react';

export default function ReportsListPage({ authUser, onPageChange, mapOptions = {} }) {
  const [userReports, setUserReports] = useState([]);
  const [adminReportsByStatus, setAdminReportsByStatus] = useState({ nouveau: [], encours: [], termine: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(String(mapOptions.initialTab || 'nouveau').toLowerCase());

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    // if adminView is requested via navigation, use admin fetch; otherwise fetch user reports
    if (mapOptions?.adminView) {
      fetchAdminReportsByStatus();
    } else {
      fetchUserReports();
    }
  }, [authUser, mapOptions]);

  // update active tab if navigation passed an initialTab
  useEffect(() => {
    if (mapOptions && mapOptions.initialTab) {
      setActiveTab(String(mapOptions.initialTab).toLowerCase());
    }
  }, [mapOptions]);

  const fetchUserReports = async () => {
    if (!authUser || authUser.guest) {
      setUserReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/api/reports?userId=${authUser.id}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setUserReports(data);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports utilisateur:', err);
      setError('Impossible de charger les rapports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminReportsByStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = [
        { key: 'nouveau', path: '/api/reports/nouveau' },
        { key: 'encours', path: '/api/reports/en-cours' },
        { key: 'termine', path: '/api/reports/termine' },
      ];

      const calls = endpoints.map(async (e) => {
        // prefer dedicated endpoint (e.path), but fallback to query parameter with canonical status token
        try {
          const res = await fetch(`${apiBase()}${e.path}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) return { key: e.key, data };
          }
        } catch (err) {
          // ignore and fallback
        }
        // fallback mapping
        const fallbackStatus = e.key === 'encours' ? 'en_cours' : e.key;
        const res2 = await fetch(`${apiBase()}/api/reports?status=${encodeURIComponent(fallbackStatus)}`);
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
        const data2 = await res2.json();
        return { key: e.key, data: data2 };
      });

      const results = await Promise.all(calls);
      const grouped = { nouveau: [], encours: [], termine: [] };
      results.forEach(r => { grouped[r.key] = r.data || []; });
      setAdminReportsByStatus(grouped);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports par statut (admin):', err);
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
      case 'termine':
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

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEntreprises, setAssignEntreprises] = useState([]);
  const [assignSelectedEntreprise, setAssignSelectedEntreprise] = useState('0');
  const [assignBudget, setAssignBudget] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [finishTargetReport, setFinishTargetReport] = useState(null);

  const fetchEntreprises = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/entreprises/summaries`);
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      const data = await res.json();
      setAssignEntreprises(data || []);
      setAssignSelectedEntreprise((data && data.length > 0 && String(data[0].id)) || '0');
    } catch (err) {
      console.error("Erreur lors du chargement des entreprises:", err);
    }
  };

  const openAssignModal = async (report) => {
    setSelectedReport(report);
    setAssignBudget(report.budget || '');
    await fetchEntreprises();
    setShowAssignModal(true);
  };

  const submitAssign = async () => {
    if (!selectedReport) return;
    const entrepriseId = assignSelectedEntreprise || 0;
    const budget = assignBudget;
    if (!entrepriseId || entrepriseId === '0') {
      setError("Veuillez sélectionner une entreprise");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // backend expects request params: id_report, id_entreprise, budget
      const url = `${apiBase()}/api/reports/do-report?id_report=${encodeURIComponent(selectedReport.id)}&id_entreprise=${encodeURIComponent(entrepriseId)}&budget=${encodeURIComponent(budget)}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      // refresh
      if (mapOptions?.adminView) await fetchAdminReportsByStatus(); else await fetchUserReports();
      setShowAssignModal(false);
      setSelectedReport(null);
    } catch (err) {
      console.error("Erreur lors de l'assignation du rapport:", err);
      setError("Impossible d'assigner le rapport");
    } finally {
      setLoading(false);
    }
  };

  const finishReport = async (reportId) => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${apiBase()}/api/reports/finish-report?id_report=${encodeURIComponent(reportId)}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      if (mapOptions?.adminView) await fetchAdminReportsByStatus(); else await fetchUserReports();
    } catch (err) {
      console.error("Erreur lors de la terminaison du rapport:", err);
      setError("Impossible de terminer le rapport");
    } finally {
      setLoading(false);
    }
  };

  const openFinishConfirm = (report) => {
    setFinishTargetReport(report);
    setShowConfirmFinish(true);
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
            <h2>📋 {mapOptions?.adminView ? 'Gestion des Rapports' : 'Mes Rapports'}</h2>
            <p className="page-subtitle">
              {mapOptions?.adminView
                ? `${(adminReportsByStatus.nouveau.length || 0) + (adminReportsByStatus.encours.length || 0) + (adminReportsByStatus.termine.length || 0)} rapport(s) trouvés`
                : `${userReports.length} rapport(s) trouvés`
              }
            </p>
          </div>
          <div style={{display:'flex',gap:12}}>
            {!mapOptions?.adminView && (
              <button 
                className="btn btn-primary"
                onClick={() => onPageChange('map')}
              >
                ➕ Nouveau rapport
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs" role="tablist" aria-label="Filtrer par statut">
        <button className={`tab ${activeTab === 'nouveau' ? 'active' : ''}`} onClick={() => setActiveTab('nouveau')}>Nouveau</button>
        <button className={`tab ${activeTab === 'encours' ? 'active' : ''}`} onClick={() => setActiveTab('encours')}>En cours</button>
        <button className={`tab ${activeTab === 'termine' ? 'active' : ''}`} onClick={() => setActiveTab('termine')}>Terminé</button>
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
            <button className="btn btn-outline" onClick={() => mapOptions?.adminView ? fetchAdminReportsByStatus() : fetchUserReports()}>
              🔄 Réessayer
            </button>
          </div>
        </div>
      ) : (
        <div className="reports-sections">
          {/* Afficher seulement la section active */}
          {mapOptions?.adminView ? (
            <section className="reports-section">
              <h3>{activeTab === 'nouveau' ? '🆕 Nouveau' : activeTab === 'encours' ? '🔄 En cours' : '✅ Terminé'} ({adminReportsByStatus[activeTab]?.length || 0})</h3>
              { (adminReportsByStatus[activeTab] || []).length === 0 ? (
                <p className="text-muted">Aucun rapport.</p>
              ) : (
                <ul className="reports-list">
                  {(adminReportsByStatus[activeTab] || []).map((report) => (
                    <li key={report.id} className="report-list-item card">
                      <div className="card-body">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <strong>#{report.id}</strong> — {report.description || '—'}
                            <div className="text-muted">{formatDate(report.createdAt)}</div>
                          </div>
                          <div>
                            <span className={getStatusBadgeClass(report.status)}>{report.status || ''}</span>
                            <div style={{marginTop:8, display: 'flex', gap: 8}}>
                              <button className="btn btn-outline btn-sm" onClick={() => onPageChange('map', { centerLat: report.latitude, centerLng: report.longitude })}>Voir</button>
                              {mapOptions?.adminView && report.status === 'nouveau' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openAssignModal(report)}
                                  disabled={loading}
                                >
                                  Assigner
                                </button>
                              )}
                              {(report.status === 'en_cours' || report.status === 'en-cours') && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => openFinishConfirm(report)}
                                  disabled={loading}
                                >
                                  Terminer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <section className="reports-section">
              <h3>{activeTab === 'nouveau' ? '🆕 Nouveau' : activeTab === 'encours' ? '🔄 En cours' : '✅ Terminé'} ({userReports.filter(r => r.status === (activeTab === 'encours' ? 'en_cours' : activeTab)).length})</h3>
              {userReports.filter(r => r.status === (activeTab === 'encours' ? 'en_cours' : activeTab)).length === 0 ? (
                <p className="text-muted">Aucun rapport.</p>
              ) : (
                <ul className="reports-list">
                  {userReports.filter(r => r.status === (activeTab === 'encours' ? 'en_cours' : activeTab)).map((report) => (
                    <li key={report.id} className="report-list-item card">
                      <div className="card-body">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <strong>#{report.id}</strong> — {report.description || '—'}
                            <div className="text-muted">{formatDate(report.createdAt)}</div>
                          </div>
                          <div>
                            <span className={getStatusBadgeClass(report.status)}>{report.status || ''}</span>
                            <div style={{marginTop:8, display: 'flex', gap: 8}}>
                              <button className="btn btn-outline btn-sm" onClick={() => onPageChange('map', { centerLat: report.latitude, centerLng: report.longitude })}>Voir</button>
                              {(report.status === 'en_cours' || report.status === 'en-cours') && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => openFinishConfirm(report)}
                                  disabled={loading}
                                >
                                  Terminer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
      {showAssignModal && (
        <div className="modal-overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal" style={{background:'#fff',padding:20,borderRadius:8,maxWidth:600,width:'90%'}}>
            <h3>Assigner le rapport #{selectedReport?.id}</h3>
            <p style={{marginTop:4,marginBottom:8}}>{selectedReport?.description}</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <label>Entreprise</label>
              <select id="assign-entreprise-select" value={assignSelectedEntreprise} onChange={(e) => setAssignSelectedEntreprise(e.target.value)}>
                <option value="0">-- Sélectionner --</option>
                {assignEntreprises.map(ent => (
                  <option key={ent.id} value={ent.id}>{ent.nom || ent.name || `Entreprise ${ent.id}`}</option>
                ))}
              </select>

              <label>Budget</label>
              <input type="number" value={assignBudget} onChange={(e) => setAssignBudget(e.target.value)} placeholder="0.00" />

              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button className="btn btn-primary" onClick={submitAssign} disabled={loading}>Confirmer</button>
                <button className="btn btn-outline" onClick={() => { setShowAssignModal(false); setSelectedReport(null); }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmFinish && (
        <div className="modal-overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal" style={{background:'#fff',padding:20,borderRadius:8,maxWidth:500,width:'90%'}}>
            <h3>Confirmer la clôture</h3>
            <p>Voulez-vous vraiment marquer le rapport #{finishTargetReport?.id} comme terminé ?</p>
            <div style={{display:'flex',gap:8,marginTop:12,justifyContent:'flex-end'}}>
              <button className="btn btn-primary" onClick={async () => { if (finishTargetReport) await finishReport(finishTargetReport.id); setShowConfirmFinish(false); setFinishTargetReport(null); }} disabled={loading}>Confirmer</button>
              <button className="btn btn-outline" onClick={() => { setShowConfirmFinish(false); setFinishTargetReport(null); }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}