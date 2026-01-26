import React, { useState } from "react";

export default function SignupPage({ onSignup, onBack }) {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirm || !form.first_name || !form.last_name) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    if (onSignup) onSignup({ email: form.email, first_name: form.first_name, last_name: form.last_name });
  };

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Utilisateurs</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Inscription</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Créer un compte</h1>
          <p className="page-subtitle">Créez votre compte pour gérer les utilisateurs</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="card-header">
          <h2>Informations du compte</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <input className="form-control" type="password" name="confirm" value={form.confirm} onChange={handleChange} />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">S'inscrire</button>
              <button type="button" className="btn btn-secondary" onClick={onBack}>Annuler</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
