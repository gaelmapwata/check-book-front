import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '@/services/api'

// Fonction pour transformer les données du backend
const mapBranchData = (branch) => ({
  id: branch.id,
  label: branch.label,
  solId: branch.solId,
  bankName: branch.bankName,
})

export const useBranchStore = defineStore('branch', () => {
  // State
  const branches = ref([])
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
  const filteredBranches = computed(() => {
    let filtered = [...branches.value]

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.label?.toLowerCase().includes(query) ||
          b.solId?.toString().includes(query) ||
          b.bankName?.toLowerCase().includes(query) ||
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

  const paginatedBranches = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredBranches.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredBranches.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchBranches()
      console.log('Raw data from API:', data)
      branches.value = (data || []).map(mapBranchData)
      console.log('Mapped branches:', branches.value)
      pagination.value.total = branches.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      branches.value = []
    } finally {
      loading.value = false
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newBranch = await createBranch(payload)
      const mappedBranch = mapBranchData(newBranch)
      branches.value.push(mappedBranch)
      return mappedBranch
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
      const updated = await updateBranch(id, payload)
      const mappedBranch = mapBranchData(updated)
      const index = branches.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        branches.value[index] = mappedBranch
      }
      return mappedBranch
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
      await deleteBranch(id)
      branches.value = branches.value.filter((b) => b.id !== id)
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
    branches,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredBranches,
    paginatedBranches,
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
