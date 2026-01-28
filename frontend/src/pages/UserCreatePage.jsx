// src/pages/UserCreatePage.jsx
import React, { useState } from "react";

export default function UserCreatePage({ onCreate, onBack }) {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "USER" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.first_name || !form.last_name) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setError("");
    onCreate(form);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Utilisateurs</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Nouveau</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Créer un utilisateur</h1>
          <p className="page-subtitle">Remplissez les informations du nouvel utilisateur</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <div className="card-header">
          <h2>Informations de l'utilisateur</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Prénom <span className="required">*</span>
              </label>
              <input
                className="form-control"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Prénom"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nom <span className="required">*</span>
              </label>
              <input
                className="form-control"
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Nom de famille"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rôle</label>
              <select
                className="form-control"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Créer l'utilisateur
              </button>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
