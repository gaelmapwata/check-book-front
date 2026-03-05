<template>
  <div class="roles-container">
    <!-- En-tête avec titre et bouton créer -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Rôles</h1>
        <p class="text-grey-darken-1">Gestion complète des rôles utilisateurs</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        :disabled="store.loading"
      >
        Nouveau Rôle
      </v-btn>
    </div>

    <!-- Barre de recherche et filtres -->
    <v-card class="mb-6 pa-4" elevation="2">
      <v-row align="center" class="ga-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.searchQuery"
            placeholder="Rechercher par nom..."
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

    <!-- Tableau des rôles -->
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
            <th class="font-weight-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!permission.canReadRole">
            <td :colspan="headers.length + 1" class="text-center py-8">
              <v-icon size="48" class="d-block mb-4 text-error">mdi-lock-outline</v-icon>
              <p class="text-error font-weight-bold">⛔ Accès refusé</p>
              <p class="text-caption text-grey">
                Vous n'avez pas les permissions pour accéder à cette ressource.
              </p>
            </td>
          </tr>
          <tr v-else-if="store.paginatedRoles.length === 0">
            <td :colspan="headers.length + 1" class="text-center py-8">
              <v-icon size="48" class="d-block mb-4 text-grey">mdi-inbox-outline</v-icon>
              <p class="text-grey">Aucun rôle trouvé</p>
            </td>
          </tr>
          <tr v-for="role in store.paginatedRoles" :key="role.id">
            <td>
              <span class="font-weight-bold text-primary">{{ role.id }}</span>
            </td>
            <td>
              <v-chip color="primary" variant="flat" size="small">
                {{ role.name }}
              </v-chip>
            </td>
            <td>
              <div class="d-flex gap-2">
                <v-btn
                  icon
                  size="small"
                  color="info"
                  variant="text"
                  @click="openEditDialog(role)"
                  :loading="store.loading"
                  :disabled="!permission.canUpdateRole"
                >
                  <v-icon>mdi-pencil-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ permission.canUpdateRole ? 'Modifier' : '⛔ Pas de permission' }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  @click="openDeleteDialog(role)"
                  :loading="store.loading"
                  :disabled="!permission.canDeleteRole"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ permission.canDeleteRole ? 'Supprimer' : '⛔ Pas de permission' }}
                  </v-tooltip>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="d-flex justify-space-between align-center pa-4 border-t">
        <p class="text-caption text-grey">
          Affichage {{ (store.pagination.page - 1) * store.pagination.pageSize + 1 }} à
          {{
            Math.min(store.pagination.page * store.pagination.pageSize, store.filteredRoles.length)
          }}
          sur {{ store.filteredRoles.length }}
        </p>
        <v-pagination
          v-model="store.pagination.page"
          :length="store.totalPages"
          total-visible="5"
          rounded="circle"
          @update:modelValue="store.setPage"
        />
      </div>
    </v-card>
  </div>

  <!-- Dialog Créer/Modifier -->
  <v-dialog v-model="showFormDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ isEditing ? 'Modifier le Rôle' : 'Créer un Rôle' }}</span>
        <v-btn icon variant="text" @click="closeFormDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="submitForm">
          <v-text-field
            v-model="formData.name"
            label="Nom du rôle"
            placeholder="Ex: Administrator, Editor, Viewer"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-shield-account"
            :rules="[required]"
            class="mb-4"
          />

          <!-- Message d'erreur du formulaire -->
          <v-alert
            v-if="formError"
            type="error"
            dismissible
            class="mt-4"
            @click:close="formError = null"
          >
            {{ formError }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="closeFormDialog"> Annuler </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="submitForm"
          :loading="store.loading"
          :disabled="!isFormValid"
        >
          {{ isEditing ? 'Mettre à jour' : 'Créer' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Confirmation suppression -->
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="d-flex align-center gap-2">
        <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
        Confirmer la suppression
      </v-card-title>

      <v-card-text class="pa-6">
        <p>
          Êtes-vous sûr de vouloir supprimer le rôle
          <strong>{{ selectedRole?.name }}</strong> ?
        </p>
        <p class="text-caption text-error mt-4">⚠️ Cette action est irréversible.</p>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="showDeleteDialog = false"> Annuler </v-btn>
        <v-btn color="error" variant="elevated" @click="confirmDelete" :loading="store.loading">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { useNotification } from '@/composables/useNotification'
import { usePermission } from '@/composables/usePermission'

const store = useRoleStore()
const { success: notifySuccess, error: notifyError } = useNotification()
const permission = usePermission()
const form = ref(null)

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Nom', value: 'name' },
]

// States
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedRole = ref(null)
const isEditing = ref(false)
const formError = ref(null)

const formData = ref({
  name: '',
})

const required = (v) => !!v || 'Ce champ est requis'
const isFormValid = computed(() => formData.value.name && formData.value.name.trim().length > 0)

// Lifecycle
onMounted(() => {
  store.fetchAll()
})

// Methods
const openCreateDialog = () => {
  isEditing.value = false
  formData.value = { name: '' }
  formError.value = null
  showFormDialog.value = true
}

const openEditDialog = (role) => {
  isEditing.value = true
  selectedRole.value = role
  formData.value = {
    name: role.name,
  }
  formError.value = null
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  formData.value = { name: '' }
  formError.value = null
}

const submitForm = async () => {
  try {
    if (isEditing.value) {
      await store.update(selectedRole.value.id, formData.value)
      notifySuccess('Rôle mis à jour avec succès!')
    } else {
      await store.createNew(formData.value)
      notifySuccess('Rôle créé avec succès!')
    }
    closeFormDialog()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Une erreur est survenue'
    notifyError(formError.value)
  }
}

const openDeleteDialog = (role) => {
  selectedRole.value = role
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await store.remove(selectedRole.value.id)
    notifySuccess(`Rôle "${selectedRole.value.name}" supprimé avec succès!`)
    showDeleteDialog.value = false
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression'
    notifyError(errorMsg)
  }
}
</script>

<style scoped>
.roles-container {
  padding: 1.5rem 0;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  color: var(--v-primary-base);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 0.5rem;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}
</style>
