<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon aria-hidden="true" :icon="map" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="problems" href="/tabs/problems">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>Liste</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { map, list } from 'ionicons/icons';
</script>

