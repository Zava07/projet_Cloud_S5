// src/pages/UserListPage.jsx
import React from "react";

export default function UserListPage({ users, onNavigateCreate, onNavigateEdit, onDelete, authUser, onLogout }) {
  return (
    <div>
      {/* App header moved here */}
      <header className="app-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1> Projet Cloud S5</h1>
            {/* <p className="page-subtitle">Application de gestion des utilisateurs</p> */}
          </div>
          <div>
            {authUser ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={authUser.guest ? 'visitor-text' : 'text-muted'}>Bonjour, <strong>{authUser.email}</strong></span>
                <button className="btn btn-secondary" onClick={() => { if (onLogout) onLogout(); else window.location.hash = '#/login'; }}>Déconnexion</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-current">Utilisateurs</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateCreate}>
          <span>+</span> Nouvel utilisateur
        </button>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h2>Liste des utilisateurs</h2>
        </div>
        
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">Aucun utilisateur</div>
            <p className="empty-state-text">Commencez par créer votre premier utilisateur.</p>
            <button className="btn btn-primary" onClick={onNavigateCreate}>
              + Créer un utilisateur
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th>Mis à jour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><span className="text-muted">#{user.id}</span></td>
                    <td><strong>{user.email}</strong></td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                        {user.is_blocked ? "Bloqué" : "Actif"}
                      </span>
                    </td>
                    <td className="text-muted">{user.created_at}</td>
                    <td className="text-muted">{user.updated_at}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => onNavigateEdit(user)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => onDelete(user)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
