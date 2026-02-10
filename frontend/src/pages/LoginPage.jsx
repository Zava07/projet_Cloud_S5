import React, { useState, useEffect } from "react";

// Slides data pour le carrousel
const slides = [
  {
    id: 1,
    title: "Signalez les problèmes",
    description: "Identifiez et rapportez les incidents urbains en quelques clics sur notre carte interactive",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="slide-illustration">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#grad1)" opacity="0.1"/>
        <circle cx="60" cy="60" r="40" fill="url(#grad1)" opacity="0.2"/>
        <path d="M60 25C44.536 25 32 37.536 32 53c0 21 28 42 28 42s28-21 28-42c0-15.464-12.536-28-28-28zm0 38c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z" fill="url(#grad1)"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Carte Interactive",
    description: "Visualisez tous les signalements sur une carte moderne et suivez leur évolution en temps réel",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="slide-illustration">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#grad2)" opacity="0.1"/>
        <circle cx="60" cy="60" r="40" fill="url(#grad2)" opacity="0.2"/>
        <path d="M25 35v50l20-12 30 12 20-12V23L75 35 45 23 25 35z" stroke="url(#grad2)" strokeWidth="3" fill="none"/>
        <path d="M45 23v50M75 35v50" stroke="url(#grad2)" strokeWidth="3"/>
        <circle cx="55" cy="50" r="6" fill="url(#grad2)"/>
        <circle cx="75" cy="60" r="4" fill="#ec4899"/>
        <circle cx="40" cy="65" r="5" fill="#22c55e"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "Suivi en temps réel",
    description: "Recevez des notifications et suivez l'avancement de vos signalements jusqu'à leur résolution",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="slide-illustration">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#grad3)" opacity="0.1"/>
        <circle cx="60" cy="60" r="40" fill="url(#grad3)" opacity="0.2"/>
        <path d="M60 25a35 35 0 1 0 35 35" stroke="url(#grad3)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M60 35v25l15 15" stroke="url(#grad3)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="60" cy="60" r="5" fill="url(#grad3)"/>
        <path d="M85 30l10-5v15l-10-5" fill="#ec4899"/>
      </svg>
    )
  },
  {
    id: 4,
    title: "Communauté Active",
    description: "Rejoignez des milliers de citoyens engagés pour améliorer ensemble notre belle ville",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="slide-illustration">
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#grad4)" opacity="0.1"/>
        <circle cx="60" cy="60" r="40" fill="url(#grad4)" opacity="0.2"/>
        <circle cx="60" cy="45" r="12" fill="url(#grad4)"/>
        <path d="M40 85c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="url(#grad4)" strokeWidth="4" fill="none"/>
        <circle cx="35" cy="55" r="8" fill="#6366f1"/>
        <path d="M20 80c0-8.284 6.716-15 15-15" stroke="#6366f1" strokeWidth="3" fill="none"/>
        <circle cx="85" cy="55" r="8" fill="#06b6d4"/>
        <path d="M100 80c0-8.284-6.716-15-15-15" stroke="#06b6d4" strokeWidth="3" fill="none"/>
      </svg>
    )
  }
];

export default function LoginPage({ onLogin, onBack, onSignup, onGuest }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotation du carrousel
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    if (index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

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
        if (res.status === 401) {
          setError('Email ou mot de passe incorrect');
        } else if (res.status === 423) {
          const text = await res.text();
          setError(text || 'Cet utilisateur est bloqué');
        } else {
          setError(`Erreur serveur: ${res.status}`);
        }
        return;
      }
      const data = await res.json();
      if (data && data.user && data.session) {
        const u = data.user;
        const s = data.session;
        if (onLogin) onLogin({ id: u.id, email: u.email, token: s.token, role: u.role  });
      } else {
        const session = data;
        if (onLogin) onLogin({ email: form.email, token: session.token });
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Impossible de contacter le serveur');
    }
  };

  return (
    <div className="login-page-split">
      {/* Left Panel - Carousel */}
      <div className="login-showcase">
        <div className="showcase-background">
          <div className="bg-gradient"></div>
          <div className="bg-pattern"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>

        <div className="showcase-content">
          <div className="showcase-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
                  <path d="M8 2v16"/>
                  <path d="M16 6v16"/>
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-title">CityReport</span>
                <span className="logo-subtitle">Antananarivo</span>
              </div>
            </div>
          </div>

          <div className="carousel-container">
            <div className={`carousel-slide ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              <div className="slide-icon">
                {slides[currentSlide].icon}
              </div>
              <h2 className="slide-title">{slides[currentSlide].title}</h2>
              <p className="slide-description">{slides[currentSlide].description}</p>
            </div>

            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">Bon retour parmi nous !</h1>
            <p className="form-subtitle">
              Connectez-vous pour accéder à votre espace citoyen
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                placeholder="admin@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                placeholder="admin"
                required
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

            <button type="submit" className="btn btn-primary btn-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Se connecter
            </button>

            <div className="divider">
              <span>ou continuer avec</span>
            </div>



            <div className="secondary-actions">
              <button type="button" className="btn btn-outline" onClick={onSignup}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Créer un compte
              </button>
              
              <button type="button" className="btn btn-ghost" onClick={onGuest}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Continuer en tant que visiteur
              </button>
            </div>
          </form>

          <div className="form-footer">
            <p>
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="link">conditions d'utilisation</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
