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

  const tileLayer = L.tileLayer(defaultTile, {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true, // don't repeat tiles horizontally (avoids loading global wrap)
    keepBuffer: 1, // reduce number of offscreen tiles to keep
    updateWhenIdle: true, // delay updates while panning to reduce requests
  }).addTo(map);

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

    circle.bindPopup(`<strong>${p.title}</strong><br/>${p.address}`);
    circle.on('click', () => {
      // center map on click
      map?.panTo([p.latitude, p.longitude]);
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
