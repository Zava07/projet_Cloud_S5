// src/pages/ReportsListPage.jsx
import React, { useState, useEffect } from 'react';

export default function ReportsListPage({ authUser, onPageChange, mapOptions = {} }) {
  const isManager = !!(authUser && ((authUser.role && String(authUser.role).toLowerCase().includes('manager')) || authUser.is_manager));
  const [userReports, setUserReports] = useState([]);
  const [adminReportsByStatus, setAdminReportsByStatus] = useState({ nouveau: [], encours: [], termine: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(String(mapOptions.initialTab || 'nouveau').toLowerCase());
  const [statusMapping, setStatusMapping] = useState({});
  const [stats, setStats] = useState(null);

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    // if adminView is requested via navigation, use admin fetch; otherwise fetch user reports
    if (mapOptions?.adminView) {
      fetchAdminReportsByStatus();
    } else {
      fetchUserReports();
    }
    // also fetch config mapping and stats (visible to all users)
    fetchStatusMapping();
    fetchStats();
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

  const normalizeStatus = (s) => {
    if (!s) return '';
    return String(s).toLowerCase().replace(/-/g, '_');
  };

  const fetchStatusMapping = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/config/status-mapping`);
      if (!res.ok) return;
      const data = await res.json();
      // convert values to numbers
      const mapped = {};
      Object.keys(data || {}).forEach(k => { mapped[k] = Number(data[k]); });
      setStatusMapping(mapped);
    } catch (err) {
      // ignore
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/reports/stats`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch (err) {
      // ignore
    }
  };

  const formatDurationDaysHours = (seconds) => {
    if (!seconds || seconds <= 0) return '0 j 0 h';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days} j ${hours} h`;
  };

  const getProgressPercent = (report) => {
    const key = normalizeStatus(report?.status);
    const val = statusMapping[key];
    if (typeof val === 'number' && !Number.isNaN(val)) return Math.min(Math.max(val, 0), 100);
    return 0;
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEntreprises, setAssignEntreprises] = useState([]);
  const [assignSelectedEntreprise, setAssignSelectedEntreprise] = useState('0');
  const [assignBudget, setAssignBudget] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [finishTargetReport, setFinishTargetReport] = useState(null);
  const [finishDate, setFinishDate] = useState('');

  const localDatetimeNow = () => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const formatForBackend = (dateStr) => {
    if (!dateStr) return '';
    // datetime-local => 'YYYY-MM-DDTHH:mm' ; backend expects seconds, so append ':00' if missing
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) return dateStr + ':00';
    return dateStr;
  };

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
    // default assign date to today
    setAssignDate(localDatetimeNow());
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
      let url = `${apiBase()}/api/reports/do-report?id_report=${encodeURIComponent(selectedReport.id)}&id_entreprise=${encodeURIComponent(entrepriseId)}&budget=${encodeURIComponent(budget)}`;
      if (assignDate) {
        url += `&date_changement=${encodeURIComponent(formatForBackend(assignDate))}`;
      }
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
      let url = `${apiBase()}/api/reports/finish-report?id_report=${encodeURIComponent(reportId)}`;
      if (finishDate) {
        url += `&date_changement=${encodeURIComponent(formatForBackend(finishDate))}`;
      }
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
    // default finish date to today
    setFinishDate(localDatetimeNow());
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
          {/* Stats card visible to all users */}
          <div style={{marginLeft:16, display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
            <div className="card" style={{padding:8}}>
              <div style={{fontSize:12,color:'#666'}}>Délai moyen de traitement</div>
              <div style={{fontWeight:700,marginTop:6}}>{stats ? formatDurationDaysHours(stats.average_processing_seconds) : '—'}</div>
              <div style={{fontSize:12,color:'#666',marginTop:4}}>Rapports traités: {stats ? stats.count_processed : '—'}</div>
            </div>
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
                              <div style={{marginRight:8,fontSize:12,color:'#333'}}>
                                Avancement:
                                <div style={{display:'inline-block',verticalAlign:'middle',marginLeft:8}}>
                                  <div style={{width:120,height:10,background:'#eee',borderRadius:6,overflow:'hidden',display:'inline-block',verticalAlign:'middle'}}>
                                    <div style={{height:'100%',background:'#4caf50',width:`${getProgressPercent(report)}%`}} />
                                  </div>
                                  <span style={{marginLeft:8,fontWeight:700}}>{getProgressPercent(report)}%</span>
                                </div>
                              </div>
                              <button className="btn btn-outline btn-sm" onClick={() => onPageChange('map', { centerLat: report.latitude, centerLng: report.longitude })}>Voir</button>
                              {mapOptions?.adminView && isManager && report.status === 'nouveau' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openAssignModal(report)}
                                  disabled={loading}
                                >
                                  Assigner
                                </button>
                              )}
                              {isManager && (report.status === 'en_cours' || report.status === 'en-cours') && (
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
                              {isManager && (report.status === 'en_cours' || report.status === 'en-cours') && (
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

              <label>Date d'intervention</label>
              <input type="datetime-local" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} />

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
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
              <label>Date de fin</label>
              <input type="datetime-local" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} />
            </div>
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