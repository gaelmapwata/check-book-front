import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchCountries, createCountry, updateCountry, deleteCountry } from '@/services/api'

export const useCountryStore = defineStore('country', () => {
  // State
  const countries = ref([])
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
  const filteredCountries = computed(() => {
    let filtered = [...countries.value]

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.label?.toLowerCase().includes(query) ||
          c.code2?.toLowerCase().includes(query) ||
          c.code3?.toLowerCase().includes(query) ||
          c.id?.toString().includes(query),
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy.value]
      const bVal = b[sortBy.value]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  })

  const paginatedCountries = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredCountries.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredCountries.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchCountries()
      countries.value = data || []
      pagination.value.total = countries.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      countries.value = []
    } finally {
      loading.value = false
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newCountry = await createCountry(payload)
      countries.value.push(newCountry)
      return newCountry
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
      const updated = await updateCountry(id, payload)
      const index = countries.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        countries.value[index] = updated
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
      await deleteCountry(id)
      countries.value = countries.value.filter((c) => c.id !== id)
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
    countries,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredCountries,
    paginatedCountries,
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
