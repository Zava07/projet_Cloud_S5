// src/components/ReportModal.jsx
import React, { useState } from 'react';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  position, 
  loading = false 
}) {
  const [form, setForm] = useState({
    description: '',
    surface: '',
    budget: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (form.surface && (isNaN(form.surface) || parseFloat(form.surface) < 0)) {
      newErrors.surface = 'La surface doit être un nombre positif';
    }

    if (form.budget && (isNaN(form.budget) || parseFloat(form.budget) < 0)) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const reportData = {
      latitude: position.lat,
      longitude: position.lng,
      description: form.description.trim(),
      surface: form.surface ? parseFloat(form.surface) : null,
      // budget: form.budget ? parseFloat(form.budget) : null,
      status: 'nouveau'
    };

    onSubmit(reportData);
  };

  const resetForm = () => {
    setForm({
      description: '',
      surface: '',
      budget: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Nouveau Rapport</h3>
          <button 
            className="modal-close"
            onClick={handleClose}
            type="button"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="report-location-info">
            <div className="location-badge">
              <span className="location-icon">📍</span>
              <span className="coordinates">
                {position?.lat?.toFixed(6)}, {position?.lng?.toFixed(6)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Description du problème *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Décrivez le problème observé (routes endommagées, problèmes d'infrastructure, etc.)"
                rows={4}
                disabled={loading}
              />
              {errors.description && (
                <div className="invalid-feedback">{errors.description}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  name="surface"
                  value={form.surface}
                  onChange={handleChange}
                  className={`form-control ${errors.surface ? 'is-invalid' : ''}`}
                  placeholder="ex: 25"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
                {errors.surface && (
                  <div className="invalid-feedback">{errors.surface}</div>
                )}
              </div>

              {/* <div className="form-group">
                <label className="form-label">
                  Budget estimé (€)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className={`form-control ${errors.budget ? 'is-invalid' : ''}`}
                  placeholder="ex: 1500"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
                {errors.budget && (
                  <div className="invalid-feedback">{errors.budget}</div>
                )}
              </div> */}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !form.description.trim()}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-sm"></div>
                    Envoi...
                  </>
                ) : (
                  '📤 Envoyer le rapport'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}