import React, { useState } from "react";

export default function SignupPage({ onSignup, onBack }) {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!form.email || !form.password || !form.confirm || !form.first_name || !form.last_name) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setPending(true);
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

    try {
      const res = await fetch(`${base}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.first_name,
          lastName: form.last_name
        })
      });

      if (res.status === 201) {
        const data = await res.json();
        setSuccess('Inscription réussie !');
        setError("");
        if (onSignup) onSignup(data);
      } else if (res.status === 409) {
        setError('Email déjà utilisé');
      } else {
        const txt = await res.text();
        setError(txt || 'Erreur serveur');
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
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
