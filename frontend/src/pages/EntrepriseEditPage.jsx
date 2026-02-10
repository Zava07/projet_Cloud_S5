// src/pages/EntrepriseEditPage.jsx
import React, { useState, useEffect } from "react";

export default function EntrepriseEditPage({ entreprise, onCancel, onSave }) {
  const [form, setForm] = useState({
    nom: "",
    contact: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    if (entreprise) {
      setForm({
        nom: entreprise.nom || entreprise.name || "",
        contact: entreprise.contact || "",
        email: entreprise.email || ""
      });
    }
  }, [entreprise]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/entreprises/${entreprise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          contact: form.contact,
          email: form.email
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      if (onSave) onSave(updated);
    } catch (err) {
      console.error('Update error', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!entreprise) {
    return (
      <main className="content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">Entreprise non trouvée</div>
            <button className="btn btn-outline" onClick={onCancel}>Retour</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="content-wrapper">
      <div className="card" style={{maxWidth: '700px', margin: '0 auto'}}>
        <div className="card-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <button className="btn btn-ghost" onClick={onCancel} title="Retour">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <polyline points="12,19 5,12 12,5"/>
              </svg>
            </button>
            <div>
              <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Modifier l'entreprise
              </h2>
              <p className="page-subtitle">ID: #{entreprise.id} - {entreprise.nom || entreprise.name}</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                </svg>
                Nom de l'entreprise *
              </label>
              <input
                className="form-control"
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex: Société ABC"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Contact
              </label>
              <input
                className="form-control"
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Nom du contact"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email
              </label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
              />
            </div>

            {error && (
              <div className="alert alert-danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions" style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
              <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
