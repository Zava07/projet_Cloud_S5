import React, { useEffect, useState } from 'react';

export default function ConfigPage({ authUser, onBack }) {
  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: '', value: '', description: '' });

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const startCreate = () => { setEditing(null); setForm({ key: '', value: '', description: '' }); };
  const startEdit = (e) => { setEditing(e); setForm({ key: e.key, value: e.value, description: e.description || '' }); };

  const submit = async () => {
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`${apiBase()}/api/config/${editing.id}`, {
          method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: form.key, value: form.value, description: form.description })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const res = await fetch(`${apiBase()}/api/config`, {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: form.key, value: form.value, description: form.description })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      await fetchEntries();
      setEditing(null);
      setForm({ key: '', value: '', description: '' });
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const remove = async (e) => {
    if (!window.confirm(`Supprimer ${e.key} ?`)) return;
    try {
      const res = await fetch(`${apiBase()}/api/config/${e.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      await fetchEntries();
    } catch (err) {
      setError(err.message || 'Erreur');
    }
  };

  return (
    <div className="page config-page">
      <div className="page-header">
        <h2>⚙️ Configuration</h2>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" onClick={onBack}>Retour</button>
          <button className="btn btn-primary" onClick={startCreate}>Nouveau</button>
        </div>
      </div>

      {loading && <div className="card"><div className="card-body">Chargement...</div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead><tr><th>Key</th><th>Value</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td>{e.key}</td>
                  <td>{e.value}</td>
                  <td>{e.description}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => startEdit(e)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{marginTop:12}}>
            <h4>{editing ? `Modifier ${editing.key}` : 'Créer une entrée'}</h4>
            <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:600}}>
              <label>Key</label>
              <input value={form.key} onChange={(e) => setForm(s => ({...s, key: e.target.value}))} />
              <label>Value</label>
              <input value={form.value} onChange={(e) => setForm(s => ({...s, value: e.target.value}))} />
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm(s => ({...s, description: e.target.value}))} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" onClick={submit}>{editing ? 'Sauvegarder' : 'Créer'}</button>
                <button className="btn btn-outline" onClick={() => { setEditing(null); setForm({ key:'', value:'', description:'' }); }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
