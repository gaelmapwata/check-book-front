<template>
  <div class="branches-container">
    <!-- En-tête avec titre et bouton créer -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Branches</h1>
        <p class="text-grey-darken-1">Gestion complète des branches bancaires</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        :disabled="store.loading"
      >
        Nouvelle Branche
      </v-btn>
    </div>

    <!-- Barre de recherche et filtres -->
    <v-card class="mb-6 pa-4" elevation="2">
      <v-row align="center" class="ga-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.searchQuery"
            placeholder="Rechercher par label, solId, ou banque..."
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

    <!-- Tableau des branches -->
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
          <tr v-if="store.paginatedBranches.length === 0">
            <td :colspan="headers.length + 1" class="text-center pa-6">
              <v-icon class="mb-3 d-block" size="48" color="grey-lighten-1"> mdi-inbox </v-icon>
              <p class="text-grey-darken-1">Aucune branche trouvée</p>
            </td>
          </tr>
          <tr v-for="branch in store.paginatedBranches" :key="branch.id">
            <td>
              <span class="font-weight-bold">{{ branch.id }}</span>
            </td>
            <td>{{ branch.label }}</td>
            <td>
              <v-chip size="small" variant="outlined">{{ branch.solId }}</v-chip>
            </td>
            <td>
              <v-chip v-if="branch.bankName" size="small" color="success" variant="tonal">
                {{ branch.bankName }}
              </v-chip>
              <span v-else class="text-grey">---</span>
            </td>
            <td class="text-center">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                @click="openEditDialog(branch)"
                :disabled="!permission.canUpdateBranch"
              />
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                @click="confirmDelete(branch)"
                :disabled="!permission.canDeleteBranch"
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
          {{ isEditing ? 'Éditer la Branche' : 'Créer une Nouvelle Branche' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="saveBranch">
            <v-text-field
              v-model="formData.label"
              label="Label"
              variant="outlined"
              placeholder="Ex: Agence Centre Ville"
              required
              class="mb-4"
              :rules="[(v) => !!v || 'Le label est obligatoire']"
            />

            <v-text-field
              v-model.number="formData.solId"
              label="Sol ID"
              variant="outlined"
              placeholder="Ex: 1001"
              type="number"
              required
              class="mb-4"
              :rules="[(v) => v > 0 || 'Le solId doit être supérieur à 0']"
            />

            <v-select
              v-model="formData.bankId"
              :items="bankOptions"
              item-title="label"
              item-value="id"
              label="Banque"
              variant="outlined"
              placeholder="Sélectionner une banque"
              required
              class="mb-6"
              :rules="[(v) => !!v || 'La banque est obligatoire']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="closeDialog"> Annuler </v-btn>
          <v-btn color="primary" :loading="store.loading" @click="saveBranch">
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
            Êtes-vous sûr de vouloir supprimer la branche
            <strong>{{ selectedBranch?.label }}</strong> ?
          </p>
          <p class="text-body2 text-grey-darken-1 mt-3">Cette action est irréversible.</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteConfirm = false"> Annuler </v-btn>
          <v-btn color="error" :loading="store.loading" @click="deleteBranch"> Supprimer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBranchStore } from '@/stores/branchStore'
import { useBankStore } from '@/stores/bankStore'
import { usePermission } from '@/composables/usePermission'
import { useNotification } from '@/composables/useNotification'

const store = useBranchStore()
const bankStore = useBankStore()
const permission = usePermission()
const { success, error } = useNotification()

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Label', value: 'label' },
  { text: 'Sol ID', value: 'solId' },
  { text: 'Banque', value: 'bankName' },
]

const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const selectedBranch = ref(null)
const form = ref(null)

const formData = ref({
  label: '',
  solId: null,
  bankId: null,
})

const bankOptions = computed(() => bankStore.banks)

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    label: '',
    solId: null,
    bankId: null,
  }
  showDialog.value = true
}

const openEditDialog = (branch) => {
  isEditing.value = true
  selectedBranch.value = branch
  // Chercher la banque par label
  const bank = bankStore.banks.find((b) => b.label === branch.bankName)
  formData.value = {
    label: branch.label,
    solId: branch.solId,
    bankId: bank?.id || null,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  form.value?.reset()
}

const saveBranch = async () => {
  if (!form.value || !(await form.value.validate())) return

  try {
    const payload = {
      label: formData.value.label,
      solId: formData.value.solId,
      bankId: formData.value.bankId,
    }

    if (isEditing.value) {
      await store.update(selectedBranch.value.id, payload)
      success('✅ Branche mise à jour avec succès')
    } else {
      await store.createNew(payload)
      success('✅ Branche créée avec succès')
    }
    closeDialog()
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

const confirmDelete = (branch) => {
  selectedBranch.value = branch
  showDeleteConfirm.value = true
}

const deleteBranch = async () => {
  try {
    await store.remove(selectedBranch.value.id)
    success('✅ Branche supprimée avec succès')
    showDeleteConfirm.value = false
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), bankStore.fetchAll()])
})
</script>

<style scoped>
.branches-container {
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
