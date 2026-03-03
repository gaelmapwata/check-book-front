<template>
  <div class="countries-container">
    <!-- En-tête avec titre et bouton créer -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Pays</h1>
        <p class="text-grey-darken-1">Gestion complète des pays</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        :disabled="store.loading || !permission.canCreateCountry"
      >
        Nouveau Pays
        <v-tooltip v-if="!permission.canCreateCountry" activator="parent" location="bottom">
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
            placeholder="Rechercher par label, code2, code3..."
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

    <!-- Tableau des pays -->
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
          <tr v-if="store.paginatedCountries.length === 0">
            <td :colspan="headers.length + 1" class="text-center pa-6">
              <v-icon class="mb-3 d-block" size="48" color="grey-lighten-1"> mdi-inbox </v-icon>
              <p class="text-grey-darken-1">Aucun pays trouvé</p>
            </td>
          </tr>
          <tr v-for="country in store.paginatedCountries" :key="country.id">
            <td>
              <span class="font-weight-bold">{{ country.id }}</span>
            </td>
            <td>{{ country.label }}</td>
            <td>
              <v-chip size="small" variant="outlined">{{ country.code2 }}</v-chip>
            </td>
            <td>
              <v-chip size="small" variant="outlined">{{ country.code3 }}</v-chip>
            </td>
            <td>{{ country.telPrefixNum || '---' }}</td>
            <td class="text-center">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                @click="openEditDialog(country)"
                :disabled="!permission.canUpdateCountry"
              />
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                @click="confirmDelete(country)"
                :disabled="!permission.canDeleteCountry"
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
          {{ isEditing ? 'Éditer le Pays' : 'Créer un Nouveau Pays' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="saveCountry">
            <v-text-field
              v-model="formData.label"
              label="Label"
              variant="outlined"
              placeholder="Ex: France"
              required
              class="mb-4"
              :rules="[(v) => !!v || 'Le label est obligatoire']"
            />

            <v-text-field
              v-model="formData.code2"
              label="Code ISO 2"
              variant="outlined"
              placeholder="Ex: FR"
              maxlength="2"
              required
              class="mb-4"
              :rules="[
                (v) => !!v || 'Le code2 est obligatoire',
                (v) => v.length === 2 || 'Le code2 doit avoir exactement 2 caractères',
              ]"
            />

            <v-text-field
              v-model="formData.code3"
              label="Code ISO 3"
              variant="outlined"
              placeholder="Ex: FRA"
              maxlength="3"
              required
              class="mb-4"
              :rules="[
                (v) => !!v || 'Le code3 est obligatoire',
                (v) => v.length === 3 || 'Le code3 doit avoir exactement 3 caractères',
              ]"
            />

            <v-text-field
              v-model="formData.telPrefixNum"
              label="Préfixe Téléphonique"
              variant="outlined"
              placeholder="Ex: +33"
              class="mb-6"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="closeDialog"> Annuler </v-btn>
          <v-btn color="primary" :loading="store.loading" @click="saveCountry">
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
            Êtes-vous sûr de vouloir supprimer le pays
            <strong>{{ selectedCountry?.label }}</strong> ?
          </p>
          <p class="text-body2 text-grey-darken-1 mt-3">Cette action est irréversible.</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteConfirm = false"> Annuler </v-btn>
          <v-btn color="error" :loading="store.loading" @click="deleteCountry"> Supprimer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCountryStore } from '@/stores/countryStore'
import { usePermission } from '@/composables/usePermission'
import { useNotification } from '@/composables/useNotification'

const store = useCountryStore()
const permission = usePermission()
const { success, error } = useNotification()

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Label', value: 'label' },
  { text: 'Code 2', value: 'code2' },
  { text: 'Code 3', value: 'code3' },
  { text: 'Préfixe Tél.', value: 'telPrefixNum' },
]

const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const selectedCountry = ref(null)
const form = ref(null)

const formData = ref({
  label: '',
  code2: '',
  code3: '',
  telPrefixNum: '',
})

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    label: '',
    code2: '',
    code3: '',
    telPrefixNum: '',
  }
  showDialog.value = true
}

const openEditDialog = (country) => {
  isEditing.value = true
  selectedCountry.value = country
  formData.value = {
    ...country,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  form.value?.reset()
}

const saveCountry = async () => {
  if (!form.value || !(await form.value.validate())) return

  try {
    if (isEditing.value) {
      await store.update(selectedCountry.value.id, formData.value)
      success('✅ Pays mis à jour avec succès')
    } else {
      await store.createNew(formData.value)
      success('✅ Pays créé avec succès')
    }
    closeDialog()
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

const confirmDelete = (country) => {
  selectedCountry.value = country
  showDeleteConfirm.value = true
}

const deleteCountry = async () => {
  try {
    await store.remove(selectedCountry.value.id)
    success('✅ Pays supprimé avec succès')
    showDeleteConfirm.value = false
  } catch (err) {
    error('❌ ' + (err.response?.data?.message || 'Une erreur est survenue'))
  }
}

onMounted(async () => {
  await store.fetchAll()
})
</script>

<style scoped>
.countries-container {
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
