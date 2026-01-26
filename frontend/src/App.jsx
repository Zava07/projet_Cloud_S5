import React, { useState } from 'react';
import './styles/app.css';

// Pages
import UserListPage from './pages/UserListPage.jsx';
import UserCreatePage from './pages/UserCreatePage.jsx';
import UserEditPage from './pages/UserEditPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

export default function App() {
  // Navigation state: 'login' | 'signup' | 'list' | 'create' | 'edit'
  const [currentPage, setCurrentPage] = useState('login');
  const [editingUser, setEditingUser] = useState(null);

  // Users data
  const [users, setUsers] = useState([
    {
      id: 1,
      firebase_uid: "uid_1",
      email: "admin@gmail.com",
      first_name: "Admin",
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
      first_name: "Alice",
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
      first_name: "Bob",
      last_name: "Rakoto",
      role: "USER",
      is_blocked: true,
      created_at: "19/01/26",
      updated_at: "19/01/26",
    },
  ]);

  // Navigation & auth handlers
  const [authUser, setAuthUser] = useState(null);

  const navigateToList = () => {
    setCurrentPage('list');
    setEditingUser(null);
  };

  const navigateToCreate = () => {
    setCurrentPage('create');
  };

  const navigateToEdit = (user) => {
    setEditingUser(user);
    setCurrentPage('edit');
  };

  const navigateToLogin = () => setCurrentPage('login');
  const navigateToSignup = () => setCurrentPage('signup');

  const handleLogin = (user) => {
    setAuthUser(user);
    alert(`Connecté en tant que ${user.email}`);
    navigateToList();
  };

  const handleSignup = (user) => {
    // Créez un utilisateur minimal et le sélectionnez
    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      firebase_uid: `uid_${nextId}`,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: "USER",
      is_blocked: false,
      created_at: new Date().toLocaleDateString(),
      updated_at: new Date().toLocaleDateString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setAuthUser({ email: user.email });
    alert('Compte créé et connecté');
    navigateToList();
  };

  const handleGuest = () => {
    setAuthUser(null);
    navigateToList();
  };

  // CRUD handlers
  const handleCreateUser = (form) => {
    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
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
    setUsers((prev) => [newUser, ...prev]);
    navigateToList();
  };

  const handleSaveUser = (updated) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updated.id
          ? { ...u, ...updated, updated_at: new Date().toLocaleDateString() }
          : u
      )
    );
    navigateToList();
  };

  const handleDeleteUser = (user) => {
    if (!window.confirm(`Supprimer l'utilisateur ${user.email} ?`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onBack={navigateToList}
            onSignup={navigateToSignup}
            onGuest={handleGuest}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onSignup={handleSignup}
            onBack={navigateToList}
          />
        );
      case 'create':
        return (
          <UserCreatePage
            onCreate={handleCreateUser}
            onBack={navigateToList}
          />
        );
      case 'edit':
        return (
          <UserEditPage
            user={editingUser}
            onSave={handleSaveUser}
            onBack={navigateToList}
          />
        );
      case 'list':
      default:
        return (
          <UserListPage
            users={users}
            onNavigateCreate={navigateToCreate}
            onNavigateEdit={navigateToEdit}
            onDelete={handleDeleteUser}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1> Projet Cloud S5</h1>
          <p>Application de gestion des utilisateurs</p>
        </div>

        <div className="header-actions">
          {authUser ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="text-muted">Bonjour, <strong>{authUser.email}</strong></span>
              <button className="btn btn-secondary" onClick={() => { setAuthUser(null); alert('Déconnecté'); }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" onClick={navigateToLogin}>Se connecter</button>
              <button className="btn btn-primary" onClick={navigateToSignup}>S'inscrire</button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}
