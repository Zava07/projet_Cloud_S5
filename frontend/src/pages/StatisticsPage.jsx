import React, { useEffect, useState } from 'react';

export default function StatisticsPage({ authUser, onBack }) {
  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchMapping();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/reports/stats`);
      if (!res.ok) return;
      setStats(await res.json());
    } catch (e) {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/reports`);
      if (!res.ok) return;
      setReports(await res.json());
    } catch (e) {}
  };

  const fetchMapping = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/config/status-mapping`);
      if (!res.ok) return;
      const data = await res.json();
      const m = {};
      Object.keys(data || {}).forEach(k => { m[k] = Number(data[k]); });
      setMapping(m);
    } catch (e) {}
  };

  const formatDurationDaysHours = (seconds) => {
    if (!seconds || seconds <= 0) return '0 j 0 h';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days} j ${hours} h`;
  };

  const normalizeStatus = (s) => s ? String(s).toLowerCase().replace(/-/g,'_') : '';
  const getProgress = (r) => {
    const k = normalizeStatus(r.status);
    const v = mapping[k];
    return typeof v === 'number' && !Number.isNaN(v) ? Math.min(Math.max(v,0),100) : 0;
  };

  const totalReports = reports.length;
  const countsByStatus = reports.reduce((acc, r) => {
    const k = normalizeStatus(r.status);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const processedCount = countsByStatus['termine'] || 0;
  const percentProcessed = totalReports > 0 ? Math.round((processedCount / totalReports) * 100) : 0;
  const inProgressCount = countsByStatus['en_cours'] || 0;
  const newCount = countsByStatus['nouveau'] || 0;

  const progressColor = (p) => {
    if (p >= 66) return 'var(--success-color)';
    if (p >= 33) return 'var(--primary-color)';
    return 'var(--warning-color)';
  };

  return (
    <div className="page statistics-page">
      <div className="page-header">
        <h2>📊 Statistiques</h2>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" onClick={onBack}>Retour</button>
        </div>
      </div>

      <div style={{display:'flex',gap:12,marginBottom:12}}>
        <div className="card" style={{padding:12,flex:1,background:'linear-gradient(135deg,var(--primary-50),white)'}}>
          <div style={{fontSize:12,color:'var(--text-secondary)'}}>Délai moyen de traitement</div>
          <div style={{fontWeight:700,marginTop:6}}>{stats ? formatDurationDaysHours(stats.average_processing_seconds) : '—'}</div>
          <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>Rapports traités: {stats ? stats.count_processed : '—'}</div>
        </div>

        <div className="card" style={{padding:12,flex:1,background:'var(--success-light)'}}>
          <div style={{fontSize:12,color:'var(--text-secondary)'}}>Total de rapports</div>
          <div style={{fontWeight:700,marginTop:6}}>{totalReports}</div>
          <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>Nouveaux: {newCount} • En cours: {inProgressCount}</div>
        </div>

        <div className="card" style={{padding:12,flex:1,background:'var(--warning-light)'}}>
          <div style={{fontSize:12,color:'var(--text-secondary)'}}>Pourcentage traité</div>
          <div style={{fontWeight:700,marginTop:6}}>{percentProcessed}%</div>
          <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>Terminé: {processedCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Liste des rapports et avancement</h3>
          <table className="table">
            <thead><tr><th>#</th><th>Description</th><th>Statut</th><th>Avancement</th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.description}</td>
                  <td>{r.status}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:160,height:12,background:'var(--gray-100)',borderRadius:6,overflow:'hidden'}}>
                        <div style={{height:'100%',background:progressColor(getProgress(r)),width:`${getProgress(r)}%`}} />
                      </div>
                      <div style={{fontWeight:700}}>{getProgress(r)}%</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
