// src/pages/EntrepriseListPage.jsx
import React, { useState, useEffect } from "react";

export default function EntrepriseListPage({ 
  authUser, 
  onNavigateCreate, 
  onNavigateEdit,
  onDelete 
}) {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  const fetchEntreprises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/entreprises`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntreprises(data);
    } catch (err) {
      console.error('fetchEntreprises error', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const handleDelete = async (entreprise) => {
    if (!window.confirm(`Supprimer l'entreprise "${entreprise.nom || entreprise.name}" ?`)) return;
    try {
      const res = await fetch(`${apiBase}/api/entreprises/${entreprise.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntreprises((prev) => prev.filter((e) => e.id !== entreprise.id));
      if (onDelete) onDelete(entreprise);
    } catch (err) {
      console.error('Delete error', err);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredEntreprises = entreprises.filter((e) => {
    const search = searchTerm.toLowerCase();
    return (
      (e.nom || e.name || '').toLowerCase().includes(search) ||
      (e.email || '').toLowerCase().includes(search) ||
      (e.adresse || e.address || '').toLowerCase().includes(search)
    );
  });

  const isAdmin = authUser?.role && 
    (String(authUser.role).toLowerCase().includes('admin'));

  return (
    <main className="content-wrapper">
      <div className="card">
        <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
                <path d="M9 9h1"/>
                <path d="M9 13h1"/>
                <path d="M9 17h1"/>
              </svg>
              Gestion des Entreprises
            </h2>
            <p className="page-subtitle">{entreprises.length} entreprise{entreprises.length > 1 ? 's' : ''} enregistrée{entreprises.length > 1 ? 's' : ''}</p>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <div className="search-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)'}}>
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                aria-label="Rechercher entreprises"
                className="form-control"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{paddingLeft: '42px', minWidth: '250px'}}
              />
            </div>
            {isAdmin && (
              <button className="btn btn-primary" onClick={onNavigateCreate}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nouvelle entreprise
              </button>
            )}
            <button className="btn btn-outline" onClick={fetchEntreprises} title="Rafraîchir">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64"/>
                <polyline points="3 3 3 9 9 9"/>
                <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 6.36-2.64"/>
                <polyline points="21 21 21 15 15 15"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des entreprises...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Erreur: {error}</span>
            </div>
          ) : filteredEntreprises.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
              </div>
              <h3 className="empty-state-title">
                {searchTerm ? 'Aucun résultat' : 'Aucune entreprise'}
              </h3>
              <p className="empty-state-text">
                {searchTerm 
                  ? 'Essayez avec d\'autres termes de recherche.' 
                  : 'Commencez par créer votre première entreprise.'}
              </p>
              {isAdmin && !searchTerm && (
                <button className="btn btn-primary" onClick={onNavigateCreate}>
                  + Créer une entreprise
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Type</th>
                    <th>Créé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntreprises.map((entreprise) => (
                    <tr key={entreprise.id}>
                      <td><span className="text-muted">#{entreprise.id}</span></td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                          <div className="entreprise-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 21h18"/>
                              <path d="M5 21V7l8-4v18"/>
                              <path d="M19 21V11l-6-4"/>
                            </svg>
                          </div>
                          <strong>{entreprise.nom || entreprise.name}</strong>
                        </div>
                      </td>
                      <td>{entreprise.email || '-'}</td>
                      <td>{entreprise.telephone || entreprise.phone || '-'}</td>
                      <td className="text-muted" style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {entreprise.adresse || entreprise.address || '-'}
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {entreprise.type || 'Standard'}
                        </span>
                      </td>
                      <td className="text-muted">
                        {entreprise.createdAt 
                          ? new Date(entreprise.createdAt).toLocaleDateString() 
                          : entreprise.created_at || '-'}
                      </td>
                      <td>
                        <div className="table-actions">
                          {isAdmin ? (
                            <>
                              <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => onNavigateEdit(entreprise)}
                                title="Modifier"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Modifier
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDelete(entreprise)}
                                title="Supprimer"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3,6 5,6 21,6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Supprimer
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">Lecture seule</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
