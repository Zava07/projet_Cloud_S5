<template>
  <div class="photo-uploader">
    <!-- Section header -->
    <div class="section-header">
      <div class="section-title">
        <ion-icon :icon="imagesOutline" class="section-icon" />
        <span>Photos</span>
      </div>
      <span class="photo-counter" :class="{ 'counter-full': files.length >= max }">
        {{ files.length }}/{{ max }}
      </span>
    </div>

    <!-- Upload zone -->
    <div class="upload-zone" v-if="files.length < max" @click="showSourcePicker">
      <div class="upload-zone-content">
        <div class="upload-icon-wrapper">
          <ion-icon :icon="cloudUploadOutline" />
        </div>
        <span class="upload-label">Ajouter une photo</span>
        <span class="upload-hint">Appuyez pour prendre ou choisir une photo</span>
      </div>
      <!-- Invisible quick buttons inside the zone -->
      <div class="quick-actions">
        <button type="button" class="quick-btn" @click.stop="openCamera">
          <ion-icon :icon="cameraOutline" />
          <span>Caméra</span>
        </button>
        <div class="quick-divider"></div>
        <button type="button" class="quick-btn" @click.stop="openGallery">
          <ion-icon :icon="imageOutline" />
          <span>Galerie</span>
        </button>
      </div>
    </div>

    <!-- Max reached message -->
    <div class="max-reached" v-else-if="files.length > 0">
      <ion-icon :icon="checkmarkCircleOutline" />
      <span>Nombre maximum de photos atteint</span>
    </div>

    <!-- Photo thumbnails grid -->
    <div class="thumbnails-grid" v-if="files.length > 0">
      <div v-for="(f, idx) in files" :key="idx" class="thumb-card" :class="{ uploaded: f.url, error: f.error }">
        <div class="thumb-image-wrapper">
          <img :src="f.preview" alt="preview" />
          
          <!-- Upload progress overlay -->
          <div class="thumb-overlay uploading" v-if="f.uploading">
            <div class="upload-progress-ring">
              <ion-spinner name="crescent" />
            </div>
            <span class="overlay-text">Envoi...</span>
          </div>
          
          <!-- Success indicator -->
          <div class="thumb-overlay success" v-else-if="f.url">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          
          <!-- Error indicator with retry -->
          <div class="thumb-overlay error-state" v-else-if="f.error">
            <ion-icon :icon="alertCircleOutline" />
            <span class="overlay-text">Échec</span>
          </div>
        </div>
        
        <!-- Remove button -->
        <button class="remove-btn" @click.stop="removeFile(idx)" type="button" aria-label="Supprimer">
          <ion-icon :icon="closeOutline" />
        </button>

        <!-- Photo number badge -->
        <div class="photo-number">{{ idx + 1 }}</div>
      </div>
      
      <!-- Add more (compact card) -->
      <button 
        v-if="files.length < max && files.length > 0" 
        type="button" 
        class="thumb-card add-card" 
        @click="showSourcePicker"
      >
        <ion-icon :icon="addOutline" />
        <span>Ajouter</span>
      </button>
    </div>

    <!-- Status bar -->
    <div class="upload-status" v-if="uploading || errorCount > 0">
      <div v-if="uploading" class="status-badge status-uploading">
        <ion-spinner name="dots" />
        <span>Envoi en cours...</span>
      </div>
      <div v-else-if="errorCount > 0" class="status-badge status-error">
        <ion-icon :icon="alertCircleOutline" />
        <span>{{ errorCount }} échec{{ errorCount > 1 ? 's' : '' }}</span>
        <button class="retry-link" @click="retryFailed" type="button">Réessayer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { uploadImage } from '@/services/cloudinary';
import { IonSpinner, IonIcon, toastController } from '@ionic/vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  cameraOutline,
  imageOutline,
  imagesOutline,
  cloudUploadOutline,
  checkmarkCircleOutline, 
  alertCircleOutline, 
  closeOutline,
  addOutline
} from 'ionicons/icons';

interface LocalFile {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: string;
}

const props = defineProps<{ max?: number }>();
const emit = defineEmits(['update:photos', 'uploading', 'error']);

const max = props.max ?? 3;
const files = ref<LocalFile[]>([]);
const uploading = ref(false);

// Computed properties for status
const errorCount = computed(() => files.value.filter(f => f.error).length);

// Show native action sheet to pick camera or gallery
const showSourcePicker = () => {
  // Do nothing — let the quick-actions inside the zone handle it
};

// Convert base64 to File object
const base64ToFile = async (base64: string, filename: string): Promise<File> => {
  const res = await fetch(`data:image/jpeg;base64,${base64}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: 'image/jpeg' });
};

// Open camera for taking photo (using Capacitor Camera API - works on web with PWA elements)
const openCamera = async () => {
  if (files.value.length >= max) return;
  
  try {
    // Camera API works on web (PWA elements) and native (Capacitor)
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      webUseInput: false, // Force using camera UI instead of file input
      promptLabelHeader: 'Photo',
      promptLabelPhoto: 'From Gallery',
      promptLabelPicture: 'Take Photo'
    });
    
    if (photo.base64String) {
      const file = await base64ToFile(photo.base64String, `photo_${Date.now()}.jpg`);
      const preview = `data:image/jpeg;base64,${photo.base64String}`;
      files.value.push({ file, preview, uploading: false });
      await uploadAll();
    }
  } catch (err: any) {
    console.log('[Camera] Camera failed or cancelled:', err?.message);
    // User cancelled or permission denied - no fallback needed
  }
};

// Open gallery for selecting photos
const openGallery = async () => {
  if (files.value.length >= max) return;
  
  try {
    // Camera API works on web (PWA elements) and native (Capacitor)
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    
    if (photo.base64String) {
      const file = await base64ToFile(photo.base64String, `photo_${Date.now()}.jpg`);
      const preview = `data:image/jpeg;base64,${photo.base64String}`;
      files.value.push({ file, preview, uploading: false });
      await uploadAll();
    }
  } catch (err: any) {
    console.log('[Gallery] Gallery failed or cancelled:', err?.message);
    // User cancelled or permission denied - no fallback needed
  }
};

const removeFile = (index: number) => {
  const f = files.value[index];
  if (f) URL.revokeObjectURL(f.preview);
  files.value.splice(index, 1);
  emit('update:photos', files.value.filter(x => x.url).map(x => x.url as string));
};

const uploadAll = async () => {
  const filesToUpload = files.value.filter(f => !f.url && !f.uploading);
  if (filesToUpload.length === 0) return;

  uploading.value = true;
  emit('uploading', true);
  
  try {
    for (const f of filesToUpload) {
      f.uploading = true;
      f.error = undefined;
      try {
        console.log('[PhotoUploader] Starting upload for:', f.file.name, 'Size:', f.file.size);
        const url = await uploadImage(f.file);
        console.log('[PhotoUploader] Upload SUCCESS:', url);
        f.url = url;
        // Emit updated photos list after each successful upload
        const urls = files.value.filter(x => x.url).map(x => x.url as string);
        console.log('[PhotoUploader] Emitting photos:', urls);
        emit('update:photos', urls);
      } catch (err: any) {
        console.error('[PhotoUploader] Upload FAILED for', f.file.name, err);
        f.error = err?.message || 'Upload failed';
        emit('error', f.error);
        // Show error toast
        try {
          const t = await toastController.create({ 
            message: `Upload failed: ${f.error}`, 
            duration: 3000, 
            color: 'danger' 
          });
          await t.present();
        } catch (e) { /* ignore toast error */ }
      } finally {
        f.uploading = false;
      }
    }
  } finally {
    uploading.value = false;
    emit('uploading', false);
  }
};

const retryFailed = async () => {
  // Reset errors and retry
  files.value.forEach(f => {
    if (f.error) {
      f.error = undefined;
    }
  });
  await uploadAll();
};

onUnmounted(() => {
  files.value.forEach(f => URL.revokeObjectURL(f.preview));
});
</script>

<style scoped>
.photo-uploader {
  margin-top: 20px;
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 2px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.section-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.45);
}

.photo-counter {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.photo-counter.counter-full {
  color: #34c759;
  background: rgba(52, 199, 89, 0.12);
}

/* ── Upload Zone ── */
.upload-zone {
  position: relative;
  border: 1.5px dashed rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  padding: 24px 16px 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-zone:active {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
}

.upload-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.upload-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.upload-icon-wrapper ion-icon {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.35);
}

.upload-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.upload-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 12px;
}

/* Quick action buttons inside zone */
.quick-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.quick-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

.quick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn ion-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.45);
}

.quick-btn:active {
  background: rgba(255, 255, 255, 0.06);
}

/* ── Max Reached ── */
.max-reached {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(52, 199, 89, 0.06);
  border: 1px solid rgba(52, 199, 89, 0.15);
}
.max-reached ion-icon {
  font-size: 16px;
  color: #34c759;
}
.max-reached span {
  font-size: 12px;
  font-weight: 500;
  color: rgba(52, 199, 89, 0.8);
}

/* ── Thumbnails Grid ── */
.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 14px;
}

.thumb-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
}

.thumb-card.uploaded {
  border-color: rgba(52, 199, 89, 0.3);
}

.thumb-card.error {
  border-color: rgba(255, 59, 48, 0.4);
}

.thumb-image-wrapper {
  width: 100%;
  height: 100%;
}

.thumb-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Photo number badge */
.photo-number {
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  z-index: 3;
}

/* Add card */
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  background: transparent;
  font-family: inherit;
}
.add-card:active {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
}
.add-card ion-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.3);
}
.add-card span {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ── Overlays ── */
.thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  z-index: 2;
}

.thumb-overlay.uploading {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}
.upload-progress-ring ion-spinner {
  color: #fff;
  width: 22px;
  height: 22px;
}
.overlay-text {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.thumb-overlay.success {
  background: rgba(52, 199, 89, 0.15);
}
.thumb-overlay.success ion-icon {
  font-size: 24px;
  color: #34c759;
  filter: drop-shadow(0 0 6px rgba(52, 199, 89, 0.4));
}

.thumb-overlay.error-state {
  background: rgba(255, 59, 48, 0.2);
  backdrop-filter: blur(1px);
}
.thumb-overlay.error-state ion-icon {
  font-size: 22px;
  color: #ff6b6b;
}

/* ── Remove Button ── */
.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
}
.remove-btn:active {
  background: #ff3b30;
  border-color: transparent;
}
.remove-btn ion-icon {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

/* ── Status Bar ── */
.upload-status {
  margin-top: 10px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-uploading {
  background: rgba(43, 112, 255, 0.08);
  color: rgba(43, 112, 255, 0.9);
  border: 1px solid rgba(43, 112, 255, 0.12);
}
.status-uploading ion-spinner {
  width: 14px;
  height: 14px;
}

.status-error {
  background: rgba(255, 59, 48, 0.08);
  color: rgba(255, 100, 100, 0.9);
  border: 1px solid rgba(255, 59, 48, 0.12);
}
.status-error ion-icon {
  font-size: 14px;
}

.retry-link {
  margin-left: auto;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 59, 48, 0.25);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: background 0.2s;
}
.retry-link:active {
  background: rgba(255, 59, 48, 0.4);
}

/* ── Responsive ── */
@media (max-width: 350px) {
  .thumbnails-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .quick-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
}
</style>
