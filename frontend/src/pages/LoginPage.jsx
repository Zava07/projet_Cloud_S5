import React, { useState } from "react";

export default function LoginPage({ onLogin, onBack, onSignup, onGuest }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    setError("");
    if (onLogin) onLogin({ email: form.email });
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <div className="card-header card-header-primary">
          <h2>Se connecter</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="exemple@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Se connecter</button>
              <button type="button" className="btn btn-secondary" onClick={onBack}>Annuler</button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={onSignup}>S'inscrire</button>
              <button type="button" className="btn btn-secondary btn-icon" onClick={onGuest} aria-label="Continuer en tant que visiteur">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Continuer en tant que visiteur</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
