import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchRessources,
  createRessource,
  updateRessource,
  deleteRessource,
} from '@/services/api'

export const useRessourceStore = defineStore('ressource', () => {
  // State
  const ressources = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  const searchQuery = ref('')
  const sortBy = ref('id')
  const sortOrder = ref('asc')

  // Getters
  const filteredRessources = computed(() => {
    let filtered = [...ressources.value]

    // Filtre par recherche
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.id?.toString().includes(query),
      )
    }

    // Tri
    filtered.sort((a, b) => {
      const aVal = a[sortBy.value]
      const bVal = b[sortBy.value]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  })

  const paginatedRessources = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredRessources.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredRessources.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchRessources()
      ressources.value = data || []
      pagination.value.total = ressources.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      ressources.value = []
    } finally {
      loading.value = false
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newRessource = await createRessource(payload)
      ressources.value.push(newRessource)
      return newRessource
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création'
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const updated = await updateRessource(id, payload)
      const index = ressources.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        ressources.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteRessource(id)
      ressources.value = ressources.value.filter((r) => r.id !== id)
      pagination.value.total--
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setSortBy = (field) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
    pagination.value.page = 1
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    ressources,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredRessources,
    paginatedRessources,
    totalPages,
    // Actions
    fetchAll,
    createNew,
    update,
    remove,
    setSortBy,
    setPage,
    setSearchQuery,
    clearError,
  }
})
