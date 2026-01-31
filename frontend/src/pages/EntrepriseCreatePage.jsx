// src/pages/EntrepriseCreatePage.jsx
import React, { useState } from "react";

export default function EntrepriseCreatePage({ onCancel, onCreate }) {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    type: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

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
      const res = await fetch(`${apiBase}/api/entreprises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          name: form.nom,
          email: form.email,
          telephone: form.telephone,
          phone: form.telephone,
          adresse: form.adresse,
          address: form.adresse,
          type: form.type,
          description: form.description
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const created = await res.json();
      if (onCreate) onCreate(created);
    } catch (err) {
      console.error('Create error', err);
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

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
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                Nouvelle Entreprise
              </h2>
              <p className="page-subtitle">Créer une nouvelle entreprise dans le système</p>
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

            <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
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

              <div className="form-group">
                <label className="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Téléphone
                </label>
                <input
                  className="form-control"
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+261 34 00 000 00"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Adresse
              </label>
              <input
                className="form-control"
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="Rue, Ville, Code postal"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
                Type d'entreprise
              </label>
              <select
                className="form-control"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="">Sélectionner un type</option>
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                <option value="SAS">SAS</option>
                <option value="EI">Entreprise Individuelle</option>
                <option value="ASSOCIATION">Association</option>
                <option value="ONG">ONG</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="17" y1="10" x2="3" y2="10"/>
                  <line x1="21" y1="6" x2="3" y2="6"/>
                  <line x1="21" y1="14" x2="3" y2="14"/>
                  <line x1="17" y1="18" x2="3" y2="18"/>
                </svg>
                Description
              </label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description de l'entreprise..."
                rows={4}
                style={{resize: 'vertical'}}
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Créer l'entreprise
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
