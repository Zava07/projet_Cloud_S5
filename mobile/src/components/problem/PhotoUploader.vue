<template>
  <div class="photo-uploader">
    <!-- Section label with separator -->
    <div class="uploader-section">
      <div class="section-divider">
        <span class="divider-line"></span>
        <span class="divider-text">
          <ion-icon :icon="imagesOutline" />
          Photos ({{ files.length }}/{{ max }})
        </span>
        <span class="divider-line"></span>
      </div>
    </div>

    <!-- Action buttons: Camera & Gallery -->
    <div class="photo-actions" v-if="files.length < max">
      <!-- Camera button -->
      <button type="button" class="photo-btn camera-btn" @click="openCamera">
        <div class="btn-icon">
          <ion-icon :icon="cameraOutline" />
        </div>
        <span class="btn-label">Camera</span>
        <span class="btn-hint">Take photo</span>
      </button>
      
      <!-- Gallery button -->
      <button type="button" class="photo-btn gallery-btn" @click="openGallery">
        <div class="btn-icon">
          <ion-icon :icon="imageOutline" />
        </div>
        <span class="btn-label">Gallery</span>
        <span class="btn-hint">Choose file</span>
      </button>
    </div>

    <!-- Max reached message -->
    <div class="max-reached" v-else>
      <ion-icon :icon="checkmarkCircleOutline" />
      <span>Maximum photos reached</span>
    </div>

    <!-- Photo thumbnails grid -->
    <div class="thumbnails" v-if="files.length > 0">
      <div v-for="(f, idx) in files" :key="idx" class="thumb" :class="{ uploaded: f.url, error: f.error }">
        <img :src="f.preview" alt="preview" />
        
        <!-- Upload progress overlay -->
        <div class="overlay uploading" v-if="f.uploading">
          <ion-spinner name="crescent" />
        </div>
        
        <!-- Success indicator -->
        <div class="overlay success" v-else-if="f.url">
          <ion-icon :icon="checkmarkCircleOutline" />
        </div>
        
        <!-- Error indicator -->
        <div class="overlay error-overlay" v-else-if="f.error">
          <ion-icon :icon="alertCircleOutline" />
        </div>
        
        <!-- Remove button -->
        <button class="remove-btn" @click.stop="removeFile(idx)" type="button">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>
      
      <!-- Add more button (compact) -->
      <button 
        v-if="files.length < max" 
        type="button" 
        class="thumb add-more" 
        @click="openGallery"
      >
        <ion-icon :icon="addOutline" />
      </button>
    </div>

    <!-- Status message -->
    <div class="status-bar" v-if="uploading || errorCount > 0">
      <span v-if="uploading" class="status uploading">
        <ion-spinner name="dots" /> Uploading...
      </span>
      <span v-else-if="errorCount > 0" class="status error">
        <ion-icon :icon="alertCircleOutline" /> Failed
        <button class="retry-btn" @click="retryFailed" type="button">Retry</button>
      </span>
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
  margin-top: 16px;
}

/* Section divider */
.uploader-section {
  margin-bottom: 16px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.divider-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.divider-text ion-icon {
  font-size: 14px;
  color: #2b70ff;
}

/* Photo action buttons */
.photo-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.photo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px 14px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-btn:active {
  transform: scale(0.96);
}

.btn-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.btn-icon ion-icon {
  font-size: 24px;
}

.btn-label {
  font-size: 13px;
  font-weight: 700;
}

.btn-hint {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Camera button style */
.camera-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff3b30 100%);
}

.camera-btn .btn-icon {
  background: rgba(255, 255, 255, 0.2);
}

.camera-btn .btn-icon ion-icon {
  color: #fff;
}

.camera-btn .btn-label,
.camera-btn .btn-hint {
  color: #fff;
}

.camera-btn:hover,
.camera-btn:active {
  background: linear-gradient(135deg, #ff5252 0%, #e02b23 100%);
  box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

/* Gallery button style */
.gallery-btn {
  background: linear-gradient(135deg, #5fa8ff 0%, #2b70ff 100%);
}

.gallery-btn .btn-icon {
  background: rgba(255, 255, 255, 0.2);
}

.gallery-btn .btn-icon ion-icon {
  color: #fff;
}

.gallery-btn .btn-label,
.gallery-btn .btn-hint {
  color: #fff;
}

.gallery-btn:hover,
.gallery-btn:active {
  background: linear-gradient(135deg, #4a9aff 0%, #1a5ee6 100%);
  box-shadow: 0 6px 20px rgba(43, 112, 255, 0.4);
}

/* Max reached */
.max-reached {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
}
.max-reached ion-icon {
  font-size: 18px;
  color: #34c759;
}
.max-reached span {
  font-size: 13px;
  font-weight: 500;
  color: #34c759;
}

/* Thumbnails grid */
.thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  flex-shrink: 0;
}
.thumb.uploaded {
  border-color: #34c759;
}
.thumb.error {
  border-color: #ff3b30;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Add more button */
.thumb.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-style: dashed;
  cursor: pointer;
}
.thumb.add-more:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
.thumb.add-more ion-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.4);
}

/* Overlays */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.overlay.uploading {
  background: rgba(0, 0, 0, 0.6);
}
.overlay.uploading ion-spinner {
  color: #fff;
  width: 24px;
  height: 24px;
}
.overlay.success {
  background: rgba(52, 199, 89, 0.25);
}
.overlay.success ion-icon {
  font-size: 26px;
  color: #34c759;
}
.overlay.error-overlay {
  background: rgba(255, 59, 48, 0.7);
}
.overlay.error-overlay ion-icon {
  font-size: 22px;
  color: #fff;
}

/* Remove button */
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 5;
}
.remove-btn:hover {
  background: #ff3b30;
}
.remove-btn ion-icon {
  font-size: 12px;
  color: #fff;
}

/* Status bar */
.status-bar {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}
.status.uploading {
  color: #2b70ff;
}
.status.uploading ion-spinner {
  width: 16px;
  height: 16px;
}
.status.error {
  color: #ff3b30;
}
.status.error ion-icon {
  font-size: 16px;
}
.retry-btn {
  margin-left: auto;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #ff3b30;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
}
.retry-btn:hover {
  background: #e02b23;
}

/* Responsive - smaller screens */
@media (max-width: 380px) {
  .action-buttons {
    gap: 8px;
  }
  .action-btn {
    padding: 16px 12px;
  }
  .action-btn ion-icon {
    font-size: 24px;
  }
  .action-btn span {
    font-size: 11px;
  }
  .thumb {
    width: 70px;
    height: 70px;
  }
}
</style>
