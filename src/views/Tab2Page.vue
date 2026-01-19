<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
         <!-- CHANGE: Update title -->
         <ion-title>Photo Gallery</ion-title>  
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Photo Gallery</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Gallery Grid -->
      <ion-grid>
        <ion-row>
          <ion-col 
            size="6" 
            v-for="photo in photos" 
            :key="photo.filepath"
          >
            <ion-img :src="photo.webviewPath"></ion-img>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- CHANGE: Add the floating action button -->
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="addNewToGallery()">
          <ion-icon :icon="camera"></ion-icon> 
        </ion-fab-button>
      </ion-fab>
     
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
  // CHANGE: Add import from `ionicons/icons`
  import { camera } from 'ionicons/icons';

  import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonFab, 
  IonFabButton, 
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg
} from '@ionic/vue';
  // CHANGE: Add `usePhotoGallery` import
  import { usePhotoGallery} from '@/composables/usePhotoGallery'
  // CHANGE: Destructure `addNewToGallery` from `usePhotoGallery()
  const {photos, addNewToGallery }= usePhotoGallery();
</script>
