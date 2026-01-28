// src/pages/Authentification.jsx
import React, { useState, useEffect } from "react";
import UserCreate from "./user-create.jsx";
import UserEdit from "./user-edit.jsx";

export default function Authentification() {
  console.log('Authentification component rendu (restored)')
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const url = `${base}/api/users?includeEntreprises=false&includeReports=false`;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // map backend DTO fields to UI shape
        const mapped = data.map((u) => ({
          id: u.id,
          firebase_uid: u.firebaseUid ?? u.firebase_uid,
          email: u.email,
          first_name: u.firstName ?? u.first_name,
          last_name: u.lastName ?? u.last_name,
          role: u.role ?? 'USER',
          is_blocked: u.blocked ?? u.is_blocked ?? false,
          created_at: u.createdAt ? new Date(u.createdAt).toLocaleString() : (u.created_at ?? ''),
          updated_at: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : (u.updated_at ?? ''),
        }));
        setUsers(mapped);
      })
      .catch((err) => {
        console.error('Failed to load users', err);
        setError(err.message || 'Fetch error');
      })
      .finally(() => setLoading(false));
  }, []);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleCreate = () => setShowCreate(true);

  const handleCreateUser = (form) => {
    setUsers((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        firebase_uid: `uid_${nextId}`,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role || "USER",
        is_blocked: false,
        created_at: new Date().toLocaleDateString(),
        updated_at: new Date().toLocaleDateString(),
      };
      return [newUser, ...prev];
    });
    setShowCreate(false);
  };

  const handleEditUser = (user) => setEditUser(user);

  const handleSaveUser = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated, updated_at: new Date().toLocaleDateString() } : u)));
    setEditUser(null);
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Supprimer l'utilisateur ${user.email} ?`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <div>
      <h2>Liste des utilisateurs</h2>

      {/* Bouton créer */}
      <button onClick={handleCreate} style={{ marginBottom: "10px" }}>
        + Créer un utilisateur
      </button>

      {showCreate && <UserCreate onCreate={handleCreateUser} />}

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Rôle</th>
            <th>Bloqué</th>
            <th>Créé le</th>
            <th>Mis à jour</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.role}</td>
              <td>{user.is_blocked ? "Oui" : "Non"}</td>
              <td>{user.created_at}</td>
              <td>{user.updated_at}</td>
              <td>
                <button onClick={() => handleEditUser(user)} style={{ marginRight: 8 }}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(user)} style={{ color: 'red' }}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <UserEdit user={editUser} onSave={handleSaveUser} onCancel={() => setEditUser(null)} />
      )}
    </div>
  );
}
