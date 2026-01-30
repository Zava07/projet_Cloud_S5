// src/components/Navigation.jsx
import React, { useState } from 'react';

export default function Navigation({ currentPage, onPageChange, authUser, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (key) => setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  // Éléments de navigation de base pour tous les utilisateurs connectés
  const navItems = [
    { 
      key: 'map', 
      label: 'Carte Interactive', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
          <path d="M8 2v16"/>
          <path d="M16 6v16"/>
        </svg>
      ), 
      description: 'Visualiser et créer des rapports sur la carte'
    },
    { 
      key: 'reports', 
      label: 'Mes Rapports', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ), 
      description: 'Gérer mes signalements'
    },
    { 
        key: 'synchronization', 
        label: 'Synchronisation Données', 
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64"/>
            <polyline points="3 3 3 9 9 9"/>
            <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 6.36-2.64"/>
            <polyline points="21 21 21 15 15 15"/>
            </svg>
        ), 
        description: 'Synchroniser mes données'
    },

  ];

  // Ajouter les sections d'administration si l'utilisateur est manager
  const isManager = authUser?.role && 
    (String(authUser.role).toLowerCase().includes('manager') || 
     String(authUser.role).toLowerCase().includes('admin'));

  if (isManager) {
    navItems.push({ 
      key: 'users', 
      label: 'Gestion Utilisateurs', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ), 
      description: 'Administration des utilisateurs',
      isAdmin: true 
    },
    { 
        key: 'gestion-reports', 
        label: 'Gestion Reports', 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        ), 
        description: 'Administration des rapports',
        isAdmin: true,
        children: [
          { key: 'gestion-reports-nouveau', label: 'Nouveau', tab: 'nouveau' },
          { key: 'gestion-reports-encours', label: 'En cours', tab: 'encours' },
          { key: 'gestion-reports-termine', label: 'Terminé', tab: 'termine' }
        ]
      });
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Navigation principale">
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="brand-content">
              <h1 className="brand-title">CityReport</h1>
              <p className="brand-subtitle">Antananarivo</p>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={isCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/>
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav" aria-label="Menu">
        <ul className="nav-list">
          {navItems.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const open = !!openMenus[item.key];
            return (
              <li key={item.key} className={`nav-item ${hasChildren ? 'has-children' : ''} ${open ? 'open' : ''}`}>
                <button
                  className={`nav-link ${currentPage === item.key || (currentPage === 'reports' && hasChildren && open) ? 'active' : ''} ${item.isAdmin ? 'admin-item' : ''}`}
                  onClick={() => {
                    if (hasChildren) toggleMenu(item.key);
                    else onPageChange && onPageChange(item.key);
                  }}
                  title={isCollapsed ? item.description : ''}
                  aria-current={currentPage === item.key ? 'page' : undefined}
                  aria-expanded={hasChildren ? open : undefined}
                >
                  <span className="nav-icon" aria-hidden>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.isAdmin && <span className="admin-badge">ADMIN</span>}
                      {hasChildren && <span className={`submenu-arrow ${open ? 'open' : ''}`} aria-hidden>{open ? '▾' : '▸'}</span>}
                    </>
                  )}
                </button>

                {hasChildren && open && !isCollapsed && (
                  <ul className="nav-submenu">
                    {item.children.map((child) => (
                      <li key={child.key} className="nav-subitem">
                        <button
                          className={`nav-sublink ${currentPage === 'reports' && child.tab ? 'active' : ''}`}
                          onClick={() => onPageChange && onPageChange('reports', { initialTab: child.tab, adminView: true })}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="sidebar-footer">
        {authUser && (
          <>
            <div className="user-profile">
              <div className="user-avatar">
                {authUser.guest ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ) : (
                  <div className="avatar-text">
                    {authUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="user-details">
                  <span className="user-name">
                    {authUser.guest ? 'Visiteur' : authUser.email}
                  </span>
                  {authUser.role && !authUser.guest && (
                    <span className={`user-role ${isManager ? 'role-admin' : 'role-user'}`}>
                      {authUser.role}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button 
              className="logout-btn" 
              onClick={onLogout}
              title={authUser.guest ? "Se connecter" : "Déconnexion"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {!isCollapsed && (
                <span>{authUser.guest ? 'Se connecter' : 'Déconnexion'}</span>
              )}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}