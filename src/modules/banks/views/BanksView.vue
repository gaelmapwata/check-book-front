<template>
  <div class="banks-container">
    <!-- En-tête avec titre et bouton créer -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Banques</h1>
        <p class="text-grey-darken-1">Gestion complète des banques</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        :disabled="store.loading"
      >
        Nouvelle Banque
      </v-btn>
    </div>

    <!-- Barre de recherche et filtres -->
    <v-card class="mb-6 pa-4" elevation="2">
      <v-row align="center" class="ga-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.searchQuery"
            placeholder="Rechercher par label, bankId, ou pays..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            clearable
            @update:modelValue="store.setSearchQuery"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="store.pagination.pageSize"
            :items="[5, 10, 25, 50]"
            label="Éléments par page"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- État de chargement -->
    <v-progress-linear v-if="store.loading" indeterminate class="mb-4" />

    <!-- Message d'erreur -->
    <v-alert
      v-if="store.error"
      type="error"
      dismissible
      class="mb-6"
      @click:close="store.clearError"
    >
      {{ store.error }}
    </v-alert>

    <!-- Tableau des banques -->
    <v-card elevation="2" class="mb-6">
      <v-table hover>
        <thead>
          <tr class="bg-grey-lighten-4">
            <th
              v-for="header in headers"
              :key="header.value"
              class="font-weight-bold cursor-pointer"
              @click="store.setSortBy(header.value)"
              style="user-select: none"
            >
              <div class="d-flex align-center gap-2">
                {{ header.text }}
                <v-icon size="small" v-if="store.sortBy === header.value">
                  {{ store.sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending' }}
                </v-icon>
              </div>
            </th>
            <th class="font-weight-bold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.paginatedBanks.length === 0">
            <td :colspan="headers.length + 1" class="text-center pa-6">
              <v-icon class="mb-3 d-block" size="48" color="grey-lighten-1"> mdi-inbox </v-icon>
              <p class="text-grey-darken-1">Aucune banque trouvée</p>
            </td>
          </tr>
          <tr v-for="bank in store.paginatedBanks" :key="bank.id">
            <td>
              <span class="font-weight-bold">{{ bank.id }}</span>
            </td>
            <td>{{ bank.label }}</td>
            <td>
              <v-chip size="small" variant="outlined">{{ bank.bank_id }}</v-chip>
            </td>
            <td>
              <v-chip v-if="bank.countryName" size="small" color="info" variant="tonal">
                {{ bank.countryName }}
              </v-chip>
              <span v-else class="text-grey">---</span>
            </td>
            <td class="text-center">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                @click="openEditDialog(bank)"
                :disabled="!permission.canUpdateBank"
              />
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                @click="confirmDelete(bank)"
                :disabled="!permission.canDeleteBank"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Pagination -->
    <div v-if="store.totalPages > 1" class="d-flex justify-center align-center gap-4">
      <v-btn
        icon="mdi-chevron-left"
        size="small"
        @click="store.setPage(store.pagination.page - 1)"
        :disabled="store.pagination.page === 1"
      />
      <span class="text-body2"> Page {{ store.pagination.page }} sur {{ store.totalPages }} </span>
      <v-btn
        icon="mdi-chevron-right"
        size="small"
        @click="store.setPage(store.pagination.page + 1)"
        :disabled="store.pagination.page === store.totalPages"
      />
    </div>

    <!-- Dialog Créer/Éditer -->
    <v-dialog v-model="showDialog" persistent width="500">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center gap-2 py-4">
          <v-icon>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Éditer la Banque' : 'Créer une Nouvelle Banque' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="saveBank">
            <v-text-field
              v-model="formData.label"
              label="Label"
              variant="outlined"
              placeholder="Ex: Société Générale"
              required
              class="mb-4"
              :rules="[(v) => !!v || 'Le label est obligatoire']"
            />

            <v-text-field
              v-model="formData.bankId"
              label="Bank ID"
              variant="outlined"
              placeholder="Ex: SG001"
              required
              class="mb-4"
              :rules="[(v) => !!v || 'Le bankId est obligatoire']"
            />

            <v-select
              v-model="formData.countryId"
              :items="countryOptions"
              item-title="label"
              item-value="id"
              label="Pays"
              variant="outlined"
              placeholder="Sélectionner un pays"
              required
              class="mb-6"
              :rules="[(v) => !!v || 'Le pays est obligatoire']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="closeDialog"> Annuler </v-btn>
          <v-btn color="primary" :loading="store.loading" @click="saveBank">
            {{ isEditing ? 'Mettre à Jour' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirmation Suppression -->
    <v-dialog v-model="showDeleteConfirm" width="400">
      <v-card>
        <v-card-title class="bg-error text-white py-4"> Confirmation </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body1">
            Êtes-vous sûr de vouloir supprimer la banque
            <strong>{{ selectedBank?.label }}</strong> ?
          </p>
          <p class="text-body2 text-grey-darken-1 mt-3">Cette action est irréversible.</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteConfirm = false"> Annuler </v-btn>
          <v-btn color="error" :loading="store.loading" @click="deleteBank"> Supprimer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { useCountryStore } from '@/stores/countryStore'
import { usePermission } from '@/composables/usePermission'
import { useNotification } from '@/composables/useNotification'

const store = useBankStore()
const countryStore = useCountryStore()
const permission = usePermission()
const { success, error } = useNotification()

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Label', value: 'label' },
  { text: 'Bank ID', value: 'bank_id' },
  { text: 'Pays', value: 'countryName' },
]

const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const selectedBank = ref(null)
const form = ref(null)

const formData = ref({
  label: '',
  bankId: '',
  countryId: null,
})

const countryOptions = computed(() => countryStore.countries)

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    label: '',
    bankId: '',
    countryId: null,
  }
  showDialog.value = true
}

const openEditDialog = (bank) => {
  isEditing.value = true
  selectedBank.value = bank
  // Chercher le countryId basé sur le countryName
  const country = countryStore.countries.find((c) => c.label === bank.countryName)
  formData.value = {
    label: bank.label,
    bankId: bank.bank_id,
    countryId: country?.id || null,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  form.value?.reset()
}

const saveBank = async () => {
  if (!form.value || !(await form.value.validate())) return

  try {
    const payload = {
      label: formData.value.label,
      bank_id: formData.value.bankId, // Convertir bankId → bank_id pour le backend
      countryId: formData.value.countryId,
    }

    if (isEditing.value) {
      await store.update(selectedBank.value.id, payload)
      success('✅ Banque mise à jour avec succès')
    } else {
      await store.createNew(payload)
      success('✅ Banque créée avec succès')
    }
    closeDialog()
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

const confirmDelete = (bank) => {
  selectedBank.value = bank
  showDeleteConfirm.value = true
}

const deleteBank = async () => {
  try {
    await store.remove(selectedBank.value.id)
    success('✅ Banque supprimée avec succès')
    showDeleteConfirm.value = false
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), countryStore.fetchAll()])
})
</script>

<style scoped>
.banks-container {
  padding: 24px;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}
</style>
