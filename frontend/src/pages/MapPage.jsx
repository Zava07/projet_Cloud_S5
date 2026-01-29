// src/pages/MapPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReportModal from "../components/ReportModal";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Icônes personnalisées pour les rapports
const reportIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const newReportIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Antananarivo coordinates
const ANTANANARIVO_CENTER = [-18.8792, 47.5079];

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick, authUser }) {
  useMapEvents({
    click(e) {
      if (authUser && !authUser.guest) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function MapPage({ authUser, mapOptions = {} }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const mapRef = useRef(null);

  const apiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  
  // Centre de la carte (peut être modifié via mapOptions)
  const mapCenter = mapOptions.centerLat && mapOptions.centerLng 
    ? [mapOptions.centerLat, mapOptions.centerLng] 
    : ANTANANARIVO_CENTER;

  useEffect(() => {
    fetchReports();
  }, []);

  // Si des options de carte sont passées, centrer la carte
  useEffect(() => {
    if (mapRef.current && mapOptions.centerLat && mapOptions.centerLng) {
      mapRef.current.setView([mapOptions.centerLat, mapOptions.centerLng], 15);
    }
  }, [mapOptions]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/api/reports`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports:', err);
      setError('Impossible de charger les rapports');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (!authUser || authUser.guest) {
      alert('Vous devez être connecté pour créer un rapport.');
      return;
    }
    
    setSelectedPosition(latlng);
    setIsModalOpen(true);
  };

  const handleSubmitReport = async (reportData) => {
    setSubmittingReport(true);
    try {
      const response = await fetch(`${apiBase()}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          user: { id: authUser.id } // Associer le rapport à l'utilisateur connecté
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const newReport = await response.json();
      setReports(prev => [...prev, newReport]);
      setIsModalOpen(false);
      setSelectedPosition(null);
      
      alert('Rapport créé avec succès ! Merci pour votre signalement.');
    } catch (err) {
      console.error('Erreur lors de la création du rapport:', err);
      alert('Erreur lors de la création du rapport. Veuillez réessayer.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'nouveau':
        return '#ef4444'; // Rouge
      case 'en_cours':
        return '#f59e0b'; // Orange
      case 'resolu':
        return '#10b981'; // Vert
      case 'ferme':
        return '#64748b'; // Gris
      default:
        return '#ef4444';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  return (
    <div className="map-page">
      {/* Instructions pour les utilisateurs */}
      <div className="map-instructions">
        {authUser && !authUser.guest ? (
          <div className="alert alert-info">
            <span className="alert-icon">💡</span>
            <strong>Astuce :</strong> Cliquez n'importe où sur la carte pour créer un nouveau rapport de signalement.
          </div>
        ) : (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <strong>Info :</strong> Connectez-vous pour pouvoir créer des rapports en cliquant sur la carte.
          </div>
        )}
      </div>

      {/* Statistiques des rapports */}
      <div className="map-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{reports.length}</div>
            <div className="stat-label">Total rapports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => r.status === 'nouveau').length}
            </div>
            <div className="stat-label">Nouveaux</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => r.status === 'en_cours').length}
            </div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => r.status === 'resolu').length}
            </div>
            <div className="stat-label">Résolus</div>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="card">
        <div className="card-header">
          <h2>🗺️ Carte des Rapports - Antananarivo</h2>
          {loading && <span className="loading-text">Chargement des rapports...</span>}
          {error && <span className="error-text">⚠️ {error}</span>}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "600px", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Gestionnaire de clics sur la carte */}
            <MapClickHandler onMapClick={handleMapClick} authUser={authUser} />
            
            {/* Marqueur central d'Antananarivo */}
            <Marker position={ANTANANARIVO_CENTER}>
              <Popup>
                <div className="popup-content">
                  <strong>🏛️ Antananarivo</strong>
                  <br />
                  Capitale de Madagascar
                </div>
              </Popup>
            </Marker>

            {/* Marqueurs des rapports */}
            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={report.status === 'nouveau' ? newReportIcon : reportIcon}
              >
                <Popup maxWidth={300}>
                  <div className="report-popup">
                    <div className="popup-header">
                      <span className="report-id">Rapport #{report.id}</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {report.status || 'Nouveau'}
                      </span>
                    </div>
                    
                    {report.description && (
                      <div className="popup-description">
                        <strong>Description:</strong>
                        <p>{report.description}</p>
                      </div>
                    )}
                    
                    <div className="popup-details">
                      {report.surface && (
                        <div className="detail-item">
                          <span className="detail-icon">📐</span>
                          Surface: {report.surface} m²
                        </div>
                      )}
                      {report.budget && (
                        <div className="detail-item">
                          <span className="detail-icon">💰</span>
                          Budget: {report.budget} €
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        {formatDate(report.createdAt)}
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Légende */}
      <div className="map-legend">
        <h4>🏷️ Légende</h4>
        <div className="legend-items">
          <div className="legend-item">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" 
                 alt="Nouveau" className="legend-icon" />
            <span>Nouveaux rapports</span>
          </div>
          <div className="legend-item">
            <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png" 
                 alt="Traité" className="legend-icon" />
            <span>Rapports en traitement/résolus</span>
          </div>
        </div>
      </div>

      {/* Modal de création de rapport */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPosition(null);
        }}
        onSubmit={handleSubmitReport}
        position={selectedPosition}
        loading={submittingReport}
      />
    </div>
  );
}
