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

  // Users data (loaded from backend)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch(`${apiBase()}/api/users?includeEntreprises=false&includeReports=false`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
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
    } catch (err) {
      console.error('fetchUsers error', err);
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
  const handleCreateUser = async (form) => {
    // try to create on backend, fallback to local update
    try {
      const res = await fetch(`${apiBase()}/api/users`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          firebaseUid: form.firebase_uid || null,
          email: form.email,
          firstName: form.first_name,
          lastName: form.last_name,
          role: form.role || 'USER'
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const u = await res.json();
      const mapped = {
        id: u.id,
        firebase_uid: u.firebaseUid ?? u.firebase_uid,
        email: u.email,
        first_name: u.firstName ?? u.first_name,
        last_name: u.lastName ?? u.last_name,
        role: u.role ?? 'USER',
        is_blocked: u.blocked ?? u.is_blocked ?? false,
        created_at: u.createdAt ? new Date(u.createdAt).toLocaleString() : (u.created_at ?? ''),
        updated_at: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : (u.updated_at ?? ''),
      };
      setUsers((prev) => [mapped, ...prev]);
    } catch (err) {
      console.warn('Create on backend failed, falling back to local:', err);
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        firebase_uid: `uid_${nextId}`,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role || 'USER',
        is_blocked: false,
        created_at: new Date().toLocaleDateString(),
        updated_at: new Date().toLocaleDateString(),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    navigateToList();
  };

  const handleSaveUser = async (updated) => {
    try {
      const res = await fetch(`${apiBase()}/api/users/${updated.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          firebaseUid: updated.firebase_uid,
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
          role: updated.role,
          blocked: updated.is_blocked,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const u = await res.json();
      const mapped = {
        id: u.id,
        firebase_uid: u.firebaseUid ?? u.firebase_uid,
        email: u.email,
        first_name: u.firstName ?? u.first_name,
        last_name: u.lastName ?? u.last_name,
        role: u.role ?? 'USER',
        is_blocked: u.blocked ?? u.is_blocked ?? false,
        created_at: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : (u.created_at ?? ''),
        updated_at: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : (u.updated_at ?? ''),
      };
      setUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
    } catch (err) {
      console.warn('Update on backend failed, falling back to local update', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated, updated_at: new Date().toLocaleDateString() } : u))
      );
    }
    navigateToList();
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Supprimer l'utilisateur ${user.email} ?`)) return;
    try {
      const res = await fetch(`${apiBase()}/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.warn('Delete on backend failed, removing locally', err);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
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
