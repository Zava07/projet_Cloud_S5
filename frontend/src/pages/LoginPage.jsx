import React, { useState } from "react";

export default function LoginPage({ onLogin, onBack, onSignup, onGuest }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    setError("");

    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    try {
      const res = await fetch(`${base}/api/sessions/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, mdp: form.password }),
      });
      if (!res.ok) {
        if (res.status === 401) setError('Email ou mot de passe incorrect');
        else setError(`Erreur serveur: ${res.status}`);
        return;
      }
      const data = await res.json();
      // If backend returned both session and user, pass user info including role to onLogin
      if (data && data.user && data.session) {
        const u = data.user;
        const s = data.session;
        if (onLogin) onLogin({ email: u.email, token: s.token, role: u.role  });
      } else {
        // fallback: old session-only response
        const session = data;
        if (onLogin) onLogin({ email: form.email, token: session.token });
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Impossible de contacter le serveur');
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-pattern"></div>
        <div className="city-illustration">
          <svg viewBox="0 0 400 200" className="city-svg">
            <defs>
              <linearGradient id="buildingGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--primary-400)', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: 'var(--primary-600)', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="buildingGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.7 }} />
                <stop offset="100%" style={{ stopColor: 'var(--accent-dark)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect x="20" y="120" width="40" height="80" fill="url(#buildingGrad1)" />
            <rect x="70" y="100" width="35" height="100" fill="url(#buildingGrad2)" />
            <rect x="115" y="140" width="30" height="60" fill="url(#buildingGrad1)" />
            <rect x="155" y="90" width="45" height="110" fill="url(#buildingGrad2)" />
            <rect x="210" y="130" width="32" height="70" fill="url(#buildingGrad1)" />
            <rect x="252" y="110" width="38" height="90" fill="url(#buildingGrad2)" />
            <rect x="300" y="125" width="35" height="75" fill="url(#buildingGrad1)" />
            <rect x="345" y="105" width="40" height="95" fill="url(#buildingGrad2)" />
          </svg>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-section">
              <div className="brand-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
                  <path d="M8 2v16"/>
                  <path d="M16 6v16"/>
                </svg>
              </div>
              <div>
                <h1 className="brand-title">Rapport Citoyen</h1>
                <p className="brand-subtitle">Antananarivo</p>
              </div>
            </div>
            
            <div className="welcome-section">
              <h2 className="welcome-title">Bienvenue sur votre plateforme</h2>
              <p className="welcome-description">
                Connectez-vous pour signaler des problèmes urbains et contribuer à l'amélioration de notre ville
              </p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Adresse email
              </label>
              <input 
                className="form-control"
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="exemple@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Mot de passe
              </label>
              <input 
                className="form-control"
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-login">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Se connecter
            </button>

            <div className="divider">
              <span>ou</span>
            </div>

            <div className="secondary-actions">
              <button type="button" className="btn btn-outline" onClick={onSignup}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Créer un compte
              </button>
              
              <button type="button" className="btn btn-ghost btn-visitor" onClick={onGuest}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Continuer en tant que visiteur
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              En vous connectant, vous acceptez nos conditions d'utilisation et contribuez à améliorer Antananarivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
