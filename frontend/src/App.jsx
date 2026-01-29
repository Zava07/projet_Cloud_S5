import React, { useState, useEffect } from 'react';
import './styles/app.css';

// Components
import Navigation from './components/Navigation';

// Pages
import UserListPage from './pages/UserListPage.jsx';
import UserCreatePage from './pages/UserCreatePage.jsx';
import UserEditPage from './pages/UserEditPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MapPage from './pages/MapPage.jsx';
import ReportsListPage from './pages/ReportsListPage.jsx';

export default function App() {
  // Navigation state: 'login' | 'signup' | 'map' | 'reports' | 'users' | 'create' | 'edit'
  const [currentPage, setCurrentPage] = useState('login'); // Démarrer sur login par défaut
  const [editingUser, setEditingUser] = useState(null);
  const [mapOptions, setMapOptions] = useState({}); // Pour passer des options à la carte

  // Auth state
  const [authUser, setAuthUser] = useState(null);

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
      return mapped;
    } catch (err) {
      console.error('fetchUsers error', err);
      setUsersError(err.message || 'Failed to load users');
      return [];
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Navigation functions
  const navigateToMap = () => { window.location.hash = '#/map'; };
  const navigateToReports = () => { window.location.hash = '#/reports'; };
  const navigateToUsers = () => { window.location.hash = '#/users'; };
  const navigateToCreate = () => { window.location.hash = '#/users/create'; };
  const navigateToEdit = (user) => { window.location.hash = `#/users/edit/${user.id}`; };
  const navigateToLogin = () => { window.location.hash = '#/'; }; // Racine pour login
  const navigateToSignup = () => { window.location.hash = '#/signup'; };

  // Page change handler for navigation component
  const handlePageChange = (page, options = {}) => {
    setMapOptions(options);
    
    if (page === 'map') navigateToMap();
    else if (page === 'reports') navigateToReports();
    else if (page === 'users') navigateToUsers();
    else if (page === 'login') navigateToLogin();
    else if (page === 'signup') navigateToSignup();
  };

  // Helper to detect manager/admin roles
  const isManagerOrAdmin = (role) => {
    if (!role) return false;
    const r = String(role).toLowerCase();
    return r === 'manager' || r === 'admin' || r.includes('manager') || r.includes('admin');
  };

  // Parse location.hash to determine page and params
  const parseHash = () => {
    const hash = (window.location.hash || '#/login').replace('#', '');
    if (hash === '' || hash === '/') return { page: 'login' };
    if (hash.startsWith('/login')) return { page: 'login' };
    if (hash.startsWith('/signup')) return { page: 'signup' };
    if (hash.startsWith('/map')) return { page: 'map' };
    if (hash.startsWith('/reports')) return { page: 'reports' };
    if (hash.startsWith('/users/create')) return { page: 'create' };
    if (hash.startsWith('/users/edit/')) {
      const parts = hash.split('/');
      const id = Number(parts[3]);
      return { page: 'edit', id };
    }
    if (hash.startsWith('/users')) return { page: 'users' };
    return { page: 'login' };
  };

  // Sync UI with hash, protect routes appropriately
  useEffect(() => {
    const syncFromHash = () => {
      const { page, id } = parseHash();

      // Si pas d'utilisateur connecté, seules les pages login et signup sont autorisées
      if (!authUser && !['login', 'signup'].includes(page)) {
        setCurrentPage('login');
        return;
      }

      // Handle protected routes
      if (page === 'reports' && (!authUser || authUser.guest)) {
        setCurrentPage('login');
        return;
      }

      if (['users', 'create', 'edit'].includes(page)) {
        if (!authUser || authUser.guest || !isManagerOrAdmin(authUser.role)) {
          alert('Accès refusé. Seuls les managers peuvent accéder à la gestion des utilisateurs.');
          setCurrentPage(authUser ? 'map' : 'login');
          return;
        }
      }

      // Pour les pages map et reports, rediriger les invités non connectés vers login
      if (['map', 'reports'].includes(page) && !authUser) {
        setCurrentPage('login');
        return;
      }

      if (page === 'edit' && id) {
        const user = users.find((u) => u.id === id);
        setEditingUser(user || null);
      }

      setCurrentPage(page);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [authUser, users]);



  const handleLogin = async (user) => {
    // attach role info based on loaded users (if available)
    let found = users.find((u) => u.email === user.email);
    if (!found) {
      // try to refresh users from backend to pick up role if missing
      const fresh = await fetchUsers();
      found = fresh.find((u) => u.email === user.email);
    }
    const role = found ? found.role : (user.role || 'USER');
    const id = found ? found.id : null;
    const auth = { id, email: user.email, token: user.token, role };
    setAuthUser(auth);
    console.log('authUser after login:', auth);
    alert(`Connecté en tant que ${user.email}`);
    // After login take user to map; managers/admins will see the link to CRUD
    navigateToMap();
  };

  const handleSignup = (user) => {
    // If backend returned a created user DTO (with id), use it; otherwise fall back to local creation
    let created;
    if (user && user.id) {
      created = {
        id: user.id,
        firebase_uid: user.firebaseUid ?? user.firebase_uid ?? `uid_${user.id}`,
        email: user.email,
        first_name: user.firstName ?? user.first_name ?? '',
        last_name: user.lastName ?? user.last_name ?? '',
        role: user.role ?? 'USER',
        is_blocked: user.blocked ?? user.is_blocked ?? false,
        created_at: user.createdAt ?? user.created_at ?? new Date().toLocaleDateString(),
        updated_at: user.updatedAt ?? user.updated_at ?? new Date().toLocaleDateString(),
      };
    } else {
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      created = {
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
    }

    setUsers((prev) => [created, ...prev]);
    // set authUser with role from created user and redirect to map
    setAuthUser({ id: created.id, email: created.email, role: created.role || 'USER' });
    alert('Compte créé et connecté');
    navigateToMap();
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
    navigateToUsers();
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
    navigateToUsers();
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
            onBack={() => handlePageChange('map')}
            onSignup={navigateToSignup}
            onGuest={handleGuest}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onSignup={handleSignup}
            onBack={() => handlePageChange('login')}
          />
        );
      case 'map':
        return (
          <MapPage
            authUser={authUser}
            mapOptions={mapOptions}
          />
        );
      case 'reports':
        return (
          <ReportsListPage
            authUser={authUser}
            onPageChange={handlePageChange}
          />
        );
      case 'create':
        return (
          <UserCreatePage
            onCreate={handleCreateUser}
            onBack={navigateToUsers}
          />
        );
      case 'edit':
        return (
          <UserEditPage
            user={editingUser}
            onSave={handleSaveUser}
            onBack={navigateToUsers}
          />
        );
      case 'users':
        return (
          <UserListPage
            users={users}
            loading={loadingUsers}
            error={usersError}
            onRefresh={fetchUsers}
            onEdit={navigateToEdit}
            onCreate={navigateToCreate}
            onDelete={handleDeleteUser}
          />
        );
      default:
        return (
          <MapPage
            authUser={authUser}
            mapOptions={mapOptions}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Sidebar Navigation - only show if user is authenticated */}
      {authUser && (
        <Navigation
          currentPage={currentPage}
          onPageChange={handlePageChange}
          authUser={authUser}
          onLogout={handleLogout}
        />
      )}
      
      {/* Main Content */}
      <div className={`main-content ${authUser ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
