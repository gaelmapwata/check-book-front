import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBanks, createBank, updateBank, deleteBank } from '@/services/api'

// Fonction pour transformer les données du backend (snake_case -> camelCase)
const mapBankData = (bank) => ({
  id: bank.id,
  label: bank.label,
  bank_id: bank.bank_id,
  countryName: bank.countryName,
})

export const useBankStore = defineStore('bank', () => {
  // State
  const banks = ref([])
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
  const filteredBanks = computed(() => {
    let filtered = [...banks.value]

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.label?.toLowerCase().includes(query) ||
          b.bank_id?.toLowerCase().includes(query) ||
          b.countryName?.toLowerCase().includes(query) ||
          b.id?.toString().includes(query),
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

  const paginatedBanks = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredBanks.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredBanks.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchBanks()
      banks.value = (data || []).map(mapBankData)
      pagination.value.total = banks.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      banks.value = []
    } finally {
      loading.value = false
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newBank = await createBank(payload)
      const mappedBank = mapBankData(newBank)
      banks.value.push(mappedBank)
      return mappedBank
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
      const updated = await updateBank(id, payload)
      const mappedBank = mapBankData(updated)
      const index = banks.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        banks.value[index] = mappedBank
      }
      return mappedBank
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
      await deleteBank(id)
      banks.value = banks.value.filter((b) => b.id !== id)
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
    banks,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredBanks,
    paginatedBanks,
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
