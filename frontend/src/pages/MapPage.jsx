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

const enCoursIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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
  // Photo states: cache by reportId, modal and viewer
  const [photoCache, setPhotoCache] = useState({});
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [photosModalReportId, setPhotosModalReportId] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerList, setViewerList] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
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

  const handleSubmitReport = async (reportData, files = []) => {
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
      // If files were provided, upload them to backend
      if (files && files.length > 0) {
        try {
          const form = new FormData();
          form.append('reportId', newReport.id);
          files.forEach(f => form.append('files', f));

          const up = await fetch(`${apiBase()}/api/photo-reports/upload`, {
            method: 'POST',
            body: form,
          });
          if (!up.ok) {
            console.warn('Upload des images échoué', up.status);
          }
        } catch (uerr) {
          console.error('Erreur lors de l\'upload des images', uerr);
        }
      }

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
      case 'termine':
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

  const apiImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
    return `${apiBase()}${photoUrl}`;
  };

  const fetchPhotosForReport = async (reportId) => {
    if (!reportId) return;
    // use cache
    if (photoCache[reportId]) return;
    try {
      const resp = await fetch(`${apiBase()}/api/photo-reports/report/${reportId}`);
      if (!resp.ok) {
        console.warn('Impossible de charger les photos pour le rapport', reportId);
        return;
      }
      const data = await resp.json();
      setPhotoCache(prev => ({ ...prev, [reportId]: data }));
    } catch (err) {
      console.error('Erreur fetch photos', err);
    }
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
            <div className="stat-top">Total</div>
            <div className="stat-number">{reports.length}</div>
            <div className="stat-label">Total rapports</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">Nouveaux</div>
            <div className="stat-number">
              {reports.filter(r => r.status === 'nouveau').length}
            </div>
            <div className="stat-label">Nouveaux</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">En cours</div>
            <div className="stat-number">
              {reports.filter(r => r.status === 'en_cours').length}
            </div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">Résolus</div>
            <div className="stat-number">
              {reports.filter(r => r.status === 'termine').length}
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
                icon={report.status === 'nouveau' ? newReportIcon : (report.status === 'en_cours' || report.status === 'en-cours' ? enCoursIcon : reportIcon)}
                eventHandlers={{
                  popupopen: () => fetchPhotosForReport(report.id)
                }}
              >
                <Popup maxWidth={400}>
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

                    {/* Thumbnails si disponibles */}
                    {photoCache[report.id] && photoCache[report.id].length > 0 && (
                      <div className="popup-photos" style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                          {photoCache[report.id].map((p, idx) => (
                            <img
                              key={idx}
                              src={apiImageUrl(p.photoUrl)}
                              alt={p.description || `Photo ${idx+1}`}
                              style={{ width: 70, height: 70, objectFit: 'cover', cursor: 'pointer', borderRadius: 4 }}
                              onClick={() => { setViewerList(photoCache[report.id]); setViewerIndex(idx); setViewerUrl(apiImageUrl(p.photoUrl)); setViewerOpen(true); }}
                            />
                          ))}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <button className="btn" onClick={() => { setPhotosModalReportId(report.id); setPhotosModalOpen(true); fetchPhotosForReport(report.id); }}>
                            Voir les photos
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Si pas de photos connues, proposer bouton pour charger/voir */}
                    {(!photoCache[report.id] || photoCache[report.id].length === 0) && (
                      <div style={{ marginTop: 8 }}>
                        <button className="btn" onClick={() => { setPhotosModalReportId(report.id); setPhotosModalOpen(true); fetchPhotosForReport(report.id); }}>
                          Voir les photos
                        </button>
                      </div>
                    )}
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
            <span>Rapports en résolus</span>
          </div>
        </div>
      </div>

      {/* Modal de création de rapport */}
      {/* Photos modal */}
      {photosModalOpen && (
        <div className="photos-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="photos-modal" style={{ background: '#fff', padding: 16, maxWidth: 900, width: '95%', maxHeight: '85%', overflowY: 'auto', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3>Photos du rapport #{photosModalReportId}</h3>
              <div>
                <button className="btn" onClick={() => { setPhotosModalOpen(false); setPhotosModalReportId(null); }}>Fermer</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(photoCache[photosModalReportId] || []).length === 0 && (
                <div>Aucune photo disponible.</div>
              )}
              {(photoCache[photosModalReportId] || []).map((p, i) => (
                <div key={i} style={{ width: 160, height: 120, cursor: 'pointer' }}>
                  <img src={apiImageUrl(p.photoUrl)} alt={p.description || `Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} onClick={() => { setViewerList(photoCache[photosModalReportId] || []); setViewerIndex(i); setViewerUrl(apiImageUrl(p.photoUrl)); setViewerOpen(true); }} />
                  {p.description && <div style={{ fontSize: 12, marginTop: 4 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image viewer */}
      {viewerOpen && viewerUrl && (
        <div className="image-viewer-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={() => { setViewerOpen(false); setViewerUrl(null); setViewerList([]); setViewerIndex(0); }}>
          <div style={{ maxWidth: '95%', maxHeight: '95%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { const prev = (viewerIndex - 1 + viewerList.length) % viewerList.length; setViewerIndex(prev); setViewerUrl(apiImageUrl((viewerList[prev] || {}).photoUrl)); }} style={{ position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)', zIndex: 3100, background: 'transparent', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>{'‹'}</button>
            <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <img src={viewerUrl} alt="Viewer" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
            </div>
            <button onClick={() => { const next = (viewerIndex + 1) % viewerList.length; setViewerIndex(next); setViewerUrl(apiImageUrl((viewerList[next] || {}).photoUrl)); }} style={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)', zIndex: 3100, background: 'transparent', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>{'›'}</button>
          </div>
        </div>
      )}
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
