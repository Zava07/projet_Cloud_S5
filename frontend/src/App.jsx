import React, { useState, useEffect } from 'react';
import './styles/app.css';

// Pages
import UserListPage from './pages/UserListPage.jsx';
import UserCreatePage from './pages/UserCreatePage.jsx';
import UserEditPage from './pages/UserEditPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MapPage from './pages/MapPage.jsx';

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

  // Navigation & auth handlers with simple hash routing
  const [authUser, setAuthUser] = useState(null);

  // parse location.hash to determine page and params
  const parseHash = () => {
    const hash = (window.location.hash || '#/login').replace('#', '');
    if (hash.startsWith('/login')) return { page: 'login' };
    if (hash.startsWith('/signup')) return { page: 'signup' };
    if (hash.startsWith('/map')) return { page: 'map' };
    if (hash.startsWith('/users/create')) return { page: 'create' };
    if (hash.startsWith('/users/edit/')) {
      const parts = hash.split('/');
      const id = Number(parts[3]);
      return { page: 'edit', id };
    }
    if (hash.startsWith('/users')) return { page: 'list' };
    return { page: 'login' };
  };

  // Sync UI with hash, protect /users routes if not authenticated
  useEffect(() => {
    const syncFromHash = () => {
      const { page, id } = parseHash();
      // Protected pages: list/create/edit/map require auth or guest
      const protectedPages = ['list', 'create', 'edit', 'map'];
      if (protectedPages.includes(page) && authUser == null) {
        // redirect to login
        window.location.hash = '#/login';
        return;
      }

      if (page === 'edit' && id) {
        const user = users.find((u) => u.id === id);
        setEditingUser(user || null);
      }

      setCurrentPage(page);
    };

    // initial sync
    syncFromHash();
    // listen to hash changes
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [authUser, users]);

  // navigation functions update the hash (this drives the UI)
  const navigateToList = () => { window.location.hash = '#/users'; };
  const navigateToMap = () => { window.location.hash = '#/map'; };
  const navigateToCreate = () => { window.location.hash = '#/users/create'; };
  const navigateToEdit = (user) => { window.location.hash = `#/users/edit/${user.id}`; };
  const navigateToLogin = () => { window.location.hash = '#/login'; };
  const navigateToSignup = () => { window.location.hash = '#/signup'; };

  const handleLogin = (user) => {
    setAuthUser(user);
    alert(`Connecté en tant que ${user.email}`);
    navigateToList();
  };

  const handleSignup = (user) => {
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
    // allow guest access (mark as guest) and show map
    setAuthUser({ email: 'Visiteur', guest: true });
    navigateToMap();
  };

  const handleLogout = () => {
    setAuthUser(null);
    navigateToLogin();
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
      case 'map':
        return (
          <MapPage
            authUser={authUser}
            onLogout={handleLogout}
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
            authUser={authUser}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}
