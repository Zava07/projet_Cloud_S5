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
.filter-section {
  margin-bottom: 24px;
}

.filter-section h3 {
  margin-bottom: 12px;
  color: var(--ion-color-primary);
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}
</style>
