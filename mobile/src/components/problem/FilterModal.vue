<template>
  <div>
    <ion-button expand="block" @click="openFilter">
      <ion-icon slot="start" :icon="filterOutline" />
      Filtrer ({{ activeFilterCount }})
    </ion-button>

    <ion-modal :is-open="isOpen" @did-dismiss="closeFilter">
      <ion-header>
        <ion-toolbar>
          <ion-title>Filtrer les signalements</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeFilter">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <!-- Filtrer par statut -->
        <div class="filter-section">
          <h3>Statut</h3>
          <ion-list>
            <ion-item v-for="status in statusOptions" :key="status.value">
              <ion-checkbox 
                :checked="localFilter.status?.includes(status.value)"
                @ionChange="toggleStatus(status.value)"
              >
                {{ status.label }}
              </ion-checkbox>
            </ion-item>
          </ion-list>
        </div>

          <!-- Mes signalements uniquement -->
          <div class="filter-section">
            <h3>Affichage</h3>
            <ion-item>
              <ion-label>Mes signalements uniquement</ion-label>
              <ion-checkbox
                :checked="!!localFilter.mineOnly"
                @ionChange="e => toggleMine(e.detail.checked)"
              />
            </ion-item>
          </div>

        <!-- Filtrer par entreprise -->
        <div class="filter-section" v-if="companies.length > 0">
          <h3>Entreprise</h3>
          <ion-select 
            v-model="localFilter.entrepriseId" 
            placeholder="Toutes les entreprises"
            interface="popover"
          >
            <ion-select-option :value="undefined">Toutes</ion-select-option>
            <ion-select-option v-for="entrepriseId in companies" :key="entrepriseId" :value="entrepriseId">
              Entreprise #{{ entrepriseId }}
            </ion-select-option>
          </ion-select>
        </div>

        <!-- Filtrer par date -->
        <div class="filter-section">
          <h3>Période</h3>
          <ion-item>
            <ion-label position="stacked">Date début</ion-label>
            <ion-datetime-button datetime="date-from"></ion-datetime-button>
          </ion-item>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
              id="date-from"
              :value="localFilter.dateFrom?.toISOString()"
              @ionChange="e => updateDateFrom(e.detail.value as string)"
              presentation="date"
            ></ion-datetime>
          </ion-modal>

          <ion-item>
            <ion-label position="stacked">Date fin</ion-label>
            <ion-datetime-button datetime="date-to"></ion-datetime-button>
          </ion-item>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
              id="date-to"
              :value="localFilter.dateTo?.toISOString()"
              @ionChange="e => updateDateTo(e.detail.value as string)"
              presentation="date"
            ></ion-datetime>
          </ion-modal>
        </div>

        <!-- Actions -->
        <div class="filter-actions">
          <ion-button expand="block" color="medium" @click="resetFilter">
            Réinitialiser
          </ion-button>
          <ion-button expand="block" @click="applyFilter">
            Appliquer
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
} from '@ionic/vue';
import { filterOutline } from 'ionicons/icons';
import { ProblemFilter, ProblemStatus } from '@/types';

interface Props {
  modelValue: ProblemFilter;
  companies: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [filter: ProblemFilter];
}>();

const isOpen = ref(false);
const localFilter = ref<ProblemFilter>({ ...props.modelValue });

const statusOptions = [
  { value: ProblemStatus.NEW, label: 'Nouveau' },
  { value: ProblemStatus.IN_PROGRESS, label: 'En cours' },
  { value: ProblemStatus.COMPLETED, label: 'Terminé' },
];

const activeFilterCount = computed(() => {
  let count = 0;
  if (props.modelValue.status && props.modelValue.status.length > 0) count++;
  if (props.modelValue.entrepriseId) count++;
  if (props.modelValue.dateFrom) count++;
  if (props.modelValue.dateTo) count++;
  if (props.modelValue.mineOnly) count++;
  return count;
});

const openFilter = () => {
  localFilter.value = { ...props.modelValue };
  isOpen.value = true;
};

const closeFilter = () => {
  isOpen.value = false;
};

const toggleStatus = (status: ProblemStatus) => {
  if (!localFilter.value.status) {
    localFilter.value.status = [];
  }
  const index = localFilter.value.status.indexOf(status);
  if (index > -1) {
    localFilter.value.status.splice(index, 1);
  } else {
    localFilter.value.status.push(status);
  }
};

const updateDateFrom = (value: string) => {
  localFilter.value.dateFrom = value ? new Date(value) : undefined;
};

const updateDateTo = (value: string) => {
  localFilter.value.dateTo = value ? new Date(value) : undefined;
};

const resetFilter = () => {
  localFilter.value = {
    status: [],
    entrepriseId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    mineOnly: false,
  };
};

const applyFilter = () => {
  emit('update:modelValue', { ...localFilter.value });
  closeFilter();
};

const toggleMine = (checked: boolean) => {
  localFilter.value.mineOnly = !!checked;
};
</script>

<style scoped>
/* ============================================
   🍎 FILTER MODAL - APPLE VISION PRO STYLE
   Ultra Premium Sheet Design
   ============================================ */

/* === Bouton Filtre Premium === */
ion-button {
  --background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  --background-hover: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  --background-activated: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
  --color: #667eea;
  --border-radius: 16px;
  --padding-start: 20px;
  --padding-end: 20px;
  --box-shadow: 
    0 4px 16px rgba(102, 126, 234, 0.15),
    0 0 0 1px rgba(102, 126, 234, 0.1) inset;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.3px;
  height: 52px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

ion-button:hover {
  transform: translateY(-2px);
  --box-shadow: 
    0 8px 24px rgba(102, 126, 234, 0.25),
    0 0 0 1px rgba(102, 126, 234, 0.15) inset;
}

ion-button ion-icon {
  font-size: 20px;
  margin-right: 8px;
}

/* === Modal Premium === */
ion-modal {
  --background: transparent;
  --border-radius: 28px 28px 0 0;
}

ion-modal ion-header {
  --background: transparent;
}

ion-modal ion-toolbar {
  --background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 249, 255, 0.95) 100%
  );
  --border-width: 0;
  padding: 8px 0;
  border-radius: 28px 28px 0 0;
}

ion-modal ion-toolbar::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 5px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

ion-modal ion-title {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a2e 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-top: 16px;
}

ion-modal ion-buttons ion-button {
  --background: transparent;
  --color: #667eea;
  --box-shadow: none;
  font-weight: 600;
  font-size: 15px;
  height: auto;
  margin-top: 8px;
}

ion-modal ion-content {
  --background: linear-gradient(
    180deg,
    rgba(248, 249, 255, 1) 0%,
    rgba(240, 244, 255, 1) 100%
  );
}

/* === Sections de Filtre === */
.filter-section {
  margin-bottom: 28px;
  animation: sectionFadeIn 0.4s ease-out both;
}

.filter-section:nth-child(1) { animation-delay: 0.1s; }
.filter-section:nth-child(2) { animation-delay: 0.15s; }
.filter-section:nth-child(3) { animation-delay: 0.2s; }
.filter-section:nth-child(4) { animation-delay: 0.25s; }

@keyframes sectionFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section h3 {
  margin: 0 0 14px 4px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* === Liste et Items === */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: rgba(255, 255, 255, 0.85);
  --background-hover: rgba(255, 255, 255, 0.95);
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 16px;
  --min-height: 56px;
  margin-bottom: 10px;
  border-radius: 16px;
  box-shadow: 
    0 2px 12px rgba(102, 126, 234, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

ion-item:hover {
  box-shadow: 
    0 4px 20px rgba(102, 126, 234, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
}

ion-item ion-label {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 15px;
}

ion-checkbox {
  --background: rgba(102, 126, 234, 0.1);
  --background-checked: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --border-color: rgba(102, 126, 234, 0.3);
  --border-color-checked: transparent;
  --checkmark-color: white;
  --size: 24px;
  --border-radius: 8px;
  margin-right: 14px;
}

/* === Select Premium === */
ion-select {
  --background: rgba(255, 255, 255, 0.85);
  --padding-start: 16px;
  --padding-end: 16px;
  width: 100%;
  min-height: 56px;
  border-radius: 16px;
  box-shadow: 
    0 2px 12px rgba(102, 126, 234, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  font-weight: 600;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* === Datetime Premium === */
ion-datetime-button {
  --background: rgba(255, 255, 255, 0.85);
  --color: #667eea;
}

ion-datetime {
  --background: #ffffff;
  --background-rgb: 255, 255, 255;
}

/* === Actions Premium === */
.filter-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 36px;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.filter-actions ion-button {
  height: 56px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.filter-actions ion-button[color="medium"] {
  --background: rgba(142, 142, 147, 0.15);
  --color: #666;
  --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-actions ion-button:last-child {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
  --box-shadow: 
    0 8px 24px rgba(102, 126, 234, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

/* === Dark Mode Premium === */
@media (prefers-color-scheme: dark) {
  ion-button {
    --background: rgba(102, 126, 234, 0.2);
    --color: #a5b4fc;
    --box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(165, 180, 252, 0.2) inset;
  }

  ion-modal ion-toolbar {
    --background: linear-gradient(
      180deg,
      rgba(30, 30, 40, 0.98) 0%,
      rgba(25, 25, 35, 0.95) 100%
    );
  }

  ion-modal ion-toolbar::before {
    background: rgba(165, 180, 252, 0.4);
  }

  ion-modal ion-title {
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  ion-modal ion-buttons ion-button {
    --color: #a5b4fc;
  }

  ion-modal ion-content {
    --background: linear-gradient(
      180deg,
      rgba(15, 15, 25, 1) 0%,
      rgba(10, 10, 20, 1) 100%
    );
  }

  .filter-section h3 {
    background: linear-gradient(135deg, #a5b4fc 0%, #f0abfc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  ion-item {
    --background: rgba(40, 40, 50, 0.7);
    box-shadow: 
      0 2px 12px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  ion-item ion-label {
    color: #ffffff;
  }

  ion-checkbox {
    --background: rgba(165, 180, 252, 0.15);
    --border-color: rgba(165, 180, 252, 0.3);
  }

  ion-select {
    --background: rgba(40, 40, 50, 0.7);
    color: white;
    box-shadow: 
      0 2px 12px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .filter-actions ion-button[color="medium"] {
    --background: rgba(255, 255, 255, 0.1);
    --color: rgba(255, 255, 255, 0.7);
  }
}
</style>
