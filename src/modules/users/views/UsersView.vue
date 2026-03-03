<template>
  <div class="users-container">
    <!-- En-tête avec titre et bouton créer -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Utilisateurs</h1>
        <p class="text-grey-darken-1">Gestion complète des utilisateurs</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        :disabled="store.loading || !permission.canCreateUser"
      >
        Nouvel Utilisateur
        <v-tooltip v-if="!permission.canCreateUser" activator="parent" location="bottom">
          ⛔ Vous n'avez pas les permissions pour créer
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Barre de recherche et filtres -->
    <v-card class="mb-6 pa-4" elevation="2">
      <v-row align="center" class="ga-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.searchQuery"
            placeholder="Rechercher par email ou branche..."
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

    <!-- Tableau des utilisateurs -->
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
          <tr v-if="store.paginatedUsers.length === 0">
            <td :colspan="headers.length + 1" class="text-center pa-6">
              <v-icon class="mb-3 d-block" size="48" color="grey-lighten-1"> mdi-inbox </v-icon>
              <p class="text-grey-darken-1">Aucun utilisateur trouvé</p>
            </td>
          </tr>
          <tr v-for="user in store.paginatedUsers" :key="user.id">
            <td>
              <span class="font-weight-bold">{{ user.id }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <v-chip v-if="user.branchName" size="small" color="info" variant="tonal">
                {{ user.branchName }}
              </v-chip>
              <span v-else class="text-grey">---</span>
            </td>
            <td>
              <v-chip v-if="user.isLocked" size="small" color="error" variant="tonal">
                <template #prepend>
                  <v-icon>mdi-lock</v-icon>
                </template>
                Verrouillé
              </v-chip>
              <v-chip v-else size="small" color="success" variant="tonal">
                <template #prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                Actif
              </v-chip>
            </td>
            <td>
              <v-chip v-if="user.isValidated" size="small" color="primary" variant="tonal">
                <template #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
                Validé
              </v-chip>
              <v-chip v-else size="small" color="warning" variant="tonal">
                <template #prepend>
                  <v-icon>mdi-clock</v-icon>
                </template>
                En attente
              </v-chip>
            </td>
            <td class="text-center">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="x-small" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item @click="openEditDialog(user)" :disabled="!permission.canUpdateUser">
                    <v-icon icon="mdi-pencil" class="mr-2" />
                    <span>Éditer</span>
                  </v-list-item>
                  <v-list-item
                    v-if="!user.isLocked"
                    @click="lockUserConfirm(user)"
                    :disabled="!permission.canLockUser"
                  >
                    <v-icon icon="mdi-lock" class="mr-2" />
                    <span>Verrouiller</span>
                  </v-list-item>
                  <v-list-item
                    v-else
                    @click="unlockUserConfirm(user)"
                    :disabled="!permission.canUnlockUser"
                  >
                    <v-icon icon="mdi-unlock" class="mr-2" />
                    <span>Déverrouiller</span>
                  </v-list-item>
                  <v-list-item
                    v-if="!user.isValidated"
                    @click="validateUserConfirm(user)"
                    :disabled="!permission.canValidateUser"
                  >
                    <v-icon icon="mdi-check" class="mr-2" />
                    <span>Valider</span>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="confirmDelete(user)" :disabled="!permission.canDeleteUser">
                    <v-icon icon="mdi-delete" class="mr-2" color="error" />
                    <span class="text-error">Supprimer</span>
                  </v-list-item>
                </v-list>
              </v-menu>
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
          {{ isEditing ? "Éditer l'Utilisateur" : 'Créer un Nouvel Utilisateur' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="saveUser">
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              variant="outlined"
              placeholder="user@example.com"
              required
              class="mb-4"
              :rules="[
                (v) => !!v || 'L\'email est obligatoire',
                (v) => /.+@.+\..+/.test(v) || 'Email invalide',
              ]"
            />

            <v-text-field
              v-if="!isEditing"
              v-model="formData.password"
              label="Mot de passe"
              type="password"
              variant="outlined"
              placeholder="••••••••"
              required
              class="mb-4"
              :rules="[
                (v) => !!v || 'Le mot de passe est obligatoire',
                (v) => v.length >= 6 || 'Minimum 6 caractères',
              ]"
            />

            <v-select
              v-model="formData.branchId"
              :items="branchOptions"
              item-title="label"
              item-value="id"
              label="Branche"
              variant="outlined"
              placeholder="Sélectionner une branche"
              required
              class="mb-6"
              :rules="[(v) => !!v || 'La branche est obligatoire']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="closeDialog"> Annuler </v-btn>
          <v-btn color="primary" :loading="store.loading" @click="saveUser">
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
            Êtes-vous sûr de vouloir supprimer l'utilisateur
            <strong>{{ selectedUser?.email }}</strong> ?
          </p>
          <p class="text-body2 text-grey-darken-1 mt-3">Cette action est irréversible.</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteConfirm = false"> Annuler </v-btn>
          <v-btn color="error" :loading="store.loading" @click="deleteUser"> Supprimer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Action Confirmation (Lock/Unlock/Validate) -->
    <v-dialog v-model="showActionConfirm" width="400">
      <v-card>
        <v-card-title class="bg-warning text-white py-4"> Confirmation </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body1">{{ actionConfirmMessage }}</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="showActionConfirm = false"> Annuler </v-btn>
          <v-btn color="warning" :loading="store.loading" @click="executeAction"> Confirmer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useBranchStore } from '@/stores/branchStore'
import { usePermission } from '@/composables/usePermission'
import { useNotification } from '@/composables/useNotification'

const store = useUserStore()
const branchStore = useBranchStore()
const permission = usePermission()
const { success, error } = useNotification()

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Email', value: 'email' },
  { text: 'Branche', value: 'branchName' },
  { text: 'Statut', value: 'isLocked' },
  { text: 'Validation', value: 'isValidated' },
]

const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const showActionConfirm = ref(false)
const isEditing = ref(false)
const selectedUser = ref(null)
const form = ref(null)
const pendingAction = ref(null)
const actionConfirmMessage = ref('')

const formData = ref({
  email: '',
  password: '',
  branchId: null,
})

const branchOptions = computed(() => branchStore.branches)

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    email: '',
    password: '',
    branchId: null,
  }
  showDialog.value = true
}

const openEditDialog = (user) => {
  isEditing.value = true
  selectedUser.value = user
  const branch = branchStore.branches.find((b) => b.label === user.branchName)
  formData.value = {
    email: user.email,
    password: '',
    branchId: branch?.id || null,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  form.value?.reset()
}

const saveUser = async () => {
  if (!form.value || !(await form.value.validate())) return

  try {
    const payload = {
      email: formData.value.email,
      password: formData.value.password,
      branchId: formData.value.branchId,
    }

    if (isEditing.value) {
      await store.update(selectedUser.value.id, payload)
      success('✅ Utilisateur mis à jour avec succès')
    } else {
      await store.createNew(payload)
      success('✅ Utilisateur créé avec succès')
    }
    closeDialog()
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

const confirmDelete = (user) => {
  selectedUser.value = user
  showDeleteConfirm.value = true
}

const deleteUser = async () => {
  try {
    await store.remove(selectedUser.value.id)
    success('✅ Utilisateur supprimé avec succès')
    showDeleteConfirm.value = false
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

const lockUserConfirm = (user) => {
  selectedUser.value = user
  pendingAction.value = 'lock'
  actionConfirmMessage.value = `Êtes-vous sûr de vouloir verrouiller l'utilisateur ${user.email} ?`
  showActionConfirm.value = true
}

const unlockUserConfirm = (user) => {
  selectedUser.value = user
  pendingAction.value = 'unlock'
  actionConfirmMessage.value = `Êtes-vous sûr de vouloir déverrouiller l'utilisateur ${user.email} ?`
  showActionConfirm.value = true
}

const validateUserConfirm = (user) => {
  selectedUser.value = user
  pendingAction.value = 'validate'
  actionConfirmMessage.value = `Êtes-vous sûr de vouloir valider l'utilisateur ${user.email} ?`
  showActionConfirm.value = true
}

const executeAction = async () => {
  try {
    if (pendingAction.value === 'lock') {
      await store.lock(selectedUser.value.id)
      success('✅ Utilisateur verrouillé avec succès')
    } else if (pendingAction.value === 'unlock') {
      await store.unlock(selectedUser.value.id)
      success('✅ Utilisateur déverrouillé avec succès')
    } else if (pendingAction.value === 'validate') {
      await store.validate(selectedUser.value.id)
      success('✅ Utilisateur validé avec succès')
    }
    showActionConfirm.value = false
    pendingAction.value = null
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), branchStore.fetchAll()])
})
</script>

<style scoped>
.users-container {
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
