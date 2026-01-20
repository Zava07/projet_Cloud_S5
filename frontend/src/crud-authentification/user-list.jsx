// src/pages/Authentification.jsx
import React, { useState } from "react";
import UserCreate from "./user-create.jsx";
import UserEdit from "./user-edit.jsx";

export default function Authentification() {
  console.log('Authentification component rendu (restored)')
  const [users, setUsers] = useState([
    {
      id: 1,
      firebase_uid: "uid_1",
      email: "admin@gmail.com",
      first_name: "admin",
      last_name: "Randria",
      role: "ADMIN",
      is_blocked: false,
      created_at: "19/01/26",
      updated_at: "19/01/26",
    },
    {
      id: 2,
      firebase_uid: "uid_2",
      email: "alice@gmail.com",
      first_name: "alice",
      last_name: "Rasoa",
      role: "USER",
      is_blocked: false,
      created_at: "19/01/26",
      updated_at: "19/01/26",
    },
    {
      id: 3,
      firebase_uid: "uid_3",
      email: "bob@gmail.com",
      first_name: "bob",
      last_name: "Rakoto",
      role: "USER",
      is_blocked: false,
      created_at: "19/01/26",
      updated_at: "19/01/26",
    },
  ]);

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

  const handleEdit = (user) => setEditUser(user);

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
                <button onClick={() => handleEdit(user)} style={{ marginRight: 8 }}>
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
