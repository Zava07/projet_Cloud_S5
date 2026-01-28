import React, { useState, useEffect } from "react";

export default function UserEdit({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "USER" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "USER",
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.first_name || !form.last_name) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setError("");
    if (onSave) onSave({ ...user, ...form });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 12, background: "#fafafa" }}>
      <h3>Modifier l'utilisateur</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email *</label>
          <br />
          <input name="email" value={form.email} onChange={handleChange} type="email" style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Prénom *</label>
          <br />
          <input name="first_name" value={form.first_name} onChange={handleChange} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Nom *</label>
          <br />
          <input name="last_name" value={form.last_name} onChange={handleChange} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Rôle</label>
          <br />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

        <button type="submit" style={{ marginRight: 8 }}>Sauver</button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </form>
    </div>
  );
}
