<template>
  <div ref="mapEl" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProblems } from '@/services/useProblems';
import { ProblemStatus } from '@/types';
import { TILE_URL } from '@/config';

interface Props {
  tileUrl?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Définir l'émission d'événements
const emit = defineEmits<{
  (e: 'mapClick', payload: { lat: number; lng: number }): void;
  (e: 'markerClick', problemId: string): void;
}>();

const props = defineProps<Props>();
const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let resizeObs: ResizeObserver | null = null;

const { problems } = useProblems();

const defaultTile = props.tileUrl || TILE_URL || (import.meta.env.VITE_TILE_URL as string) || 'http://localhost:8080/tiles/{z}/{x}/{y}.png';
const center = props.center || { lat: -18.9145, lng: 47.5281 };
const zoom = props.zoom ?? 13;

const statusColor = (status: ProblemStatus) => {
  switch (status) {
    case ProblemStatus.NEW:
      return '#f6c84c';
    case ProblemStatus.IN_PROGRESS:
      return '#3880ff';
    case ProblemStatus.COMPLETED:
      return '#2dd36f';
    default:
      return '#666';
  }
};

onMounted(() => {
  if (!mapEl.value) return;

  // Limit map area and tile loading to reduce initial requests / lag
  const bounds = L.latLngBounds([
    [-19.2, 46.8], // SW roughly
    [-18.5, 48.2], // NE roughly
  ]);

  map = L.map(mapEl.value, {
    center: [center.lat, center.lng],
    zoom,
    minZoom: 11,
    maxZoom: 18,
    maxBounds: bounds,
    maxBoundsViscosity: 0.75,
    zoomControl: true,
    preferCanvas: true,
  });

  // Try the configured/default tile URL first. If many tile errors occur
  // (e.g. local tile server is down), automatically switch to a public
  // fallback (OpenStreetMap) so the map still works online.
  const onlineFallback = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  let tileLayer: L.TileLayer = L.tileLayer(defaultTile, {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true, // don't repeat tiles horizontally (avoids loading global wrap)
    keepBuffer: 1, // reduce number of offscreen tiles to keep
    updateWhenIdle: true, // delay updates while panning to reduce requests
  }).addTo(map);

  // fallback handling: if several tile errors occur, switch to online tiles
  let tileErrorCount = 0;
  const TILE_ERROR_THRESHOLD = 3;
  let fallbackApplied = false;

  tileLayer.on('tileerror', () => {
    tileErrorCount += 1;
    if (!fallbackApplied && tileErrorCount >= TILE_ERROR_THRESHOLD) {
      fallbackApplied = true;
      try {
        console.warn('[MapView] tile errors detected — switching to online fallback tiles:', onlineFallback);
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(onlineFallback, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
          noWrap: true,
          keepBuffer: 1,
          updateWhenIdle: true,
        }).addTo(map);
        // expose updated layer for debugging
        // @ts-ignore
        (window as any)._tileLayer = tileLayer;
      } catch (e) {
        console.error('[MapView] failed to apply tile fallback', e);
      }
    }
  });

  // Debug helpers (temporary): expose map and tile info on window for inspection
  // Use browser console to inspect `window._defaultTile` and `window._tileLayer`
  // Example in console: window._tileLayer.getTileUrl({x:5174, y:4533, z:13})
  // or: console.log(window._defaultTile)
  // Remove these lines after debugging
  // @ts-ignore
  (window as any)._defaultTile = defaultTile;
  // @ts-ignore
  (window as any)._map = map;
  // @ts-ignore
  (window as any)._tileLayer = tileLayer;

  markersLayer = L.layerGroup().addTo(map);
  renderMarkers();

  // Ajouter un événement de clic sur la carte pour créer un nouveau signalement
  map.on('click', (e: L.LeafletMouseEvent) => {
    emit('mapClick', {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
  });

  // Ensure the map is properly sized when the container becomes visible.
  // Some frameworks (Ionic tabs, hidden containers) render the component while
  // it's not visible — Leaflet needs an explicit invalidateSize() to redraw.
  // We use a short timeout, a ResizeObserver on the container and a window
  // resize listener as fallback.
  setTimeout(() => map?.invalidateSize(), 200);

  if (mapEl.value && 'ResizeObserver' in window) {
    resizeObs = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObs.observe(mapEl.value);
  }

  const onWinResize = () => map?.invalidateSize();
  window.addEventListener('resize', onWinResize);

  // store the listener to remove later
  // @ts-ignore
  (map as any)._onWinResize = onWinResize;
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
  if (resizeObs && mapEl.value) {
    resizeObs.unobserve(mapEl.value);
    resizeObs.disconnect();
    resizeObs = null;
  }

  // remove window listener if previously added
  // @ts-ignore
  const onWinResize = map && (map as any)._onWinResize;
  if (onWinResize) window.removeEventListener('resize', onWinResize);
});

watch(problems, () => {
  renderMarkers();
});

function renderMarkers() {
  if (!markersLayer || !map) return;
  markersLayer.clearLayers();

  problems.value.forEach(p => {
    const circle = L.circleMarker([p.latitude, p.longitude], {
      radius: 8,
      color: statusColor(p.status),
      weight: 2,
      fillColor: statusColor(p.status),
      fillOpacity: 0.9,
    });

    // Créer un popup avec les détails du problème
    const statusLabel = {
      [ProblemStatus.NEW]: 'Nouveau',
      [ProblemStatus.IN_PROGRESS]: 'En cours',
      [ProblemStatus.COMPLETED]: 'Terminé',
    }[p.status];

    const popupContent = `
      <div style="min-width: 200px;">
        <strong style="font-size: 14px;">${p.title || p.description.substring(0, 50)}</strong><br/>
        <span style="color: #666; font-size: 12px;">${p.address || 'Adresse non disponible'}</span><br/>
        <span style="background: ${statusColor(p.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; display: inline-block;">
          ${statusLabel}
        </span><br/>
        <small style="color: #999;">Signalé le: ${new Date(p.createdAt).toLocaleDateString('fr-FR')}</small>
      </div>
    `;

    circle.bindPopup(popupContent);
    
    // Afficher le popup au survol
    circle.on('mouseover', () => {
      circle.openPopup();
    });
    
    // Émettre un événement au clic pour afficher les détails complets
    circle.on('click', () => {
      emit('markerClick', p.id);
    });
    
    markersLayer?.addLayer(circle);
  });
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
