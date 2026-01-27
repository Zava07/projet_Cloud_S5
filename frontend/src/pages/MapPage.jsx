// src/pages/MapPage.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Antananarivo coordinates
const ANTANANARIVO_CENTER = [-18.8792, 47.5079];

export default function MapPage({ authUser, onLogout }) {
  return (
    <div>
      {/* Header */}
      <header className="app-header" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>🚀 Projet Cloud S5</h1>
            <p className="page-subtitle">Carte d'Antananarivo</p>
          </div>
          <div>
            {authUser && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={authUser.guest ? "visitor-text" : "text-muted"}>
                  Bonjour, <strong>{authUser.email}</strong>
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (onLogout) onLogout();
                    else window.location.hash = "#/login";
                  }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Map Card */}
      <div className="card">
        <div className="card-header">
          <h2>🗺️ Antananarivo, Madagascar</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <MapContainer
            center={ANTANANARIVO_CENTER}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={ANTANANARIVO_CENTER}>
              <Popup>
                <strong>Antananarivo</strong>
                <br />
                Capitale de Madagascar
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
