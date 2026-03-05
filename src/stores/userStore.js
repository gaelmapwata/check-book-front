import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchUsers, createUser, updateUser, deleteUser, lockUser, unlockUser, validateUser, addRolesToUser } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
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
  const filteredUsers = computed(() => {
    let filtered = [...users.value]

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.branchName?.toLowerCase().includes(query) ||
          u.id?.toString().includes(query),
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

  const paginatedUsers = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredUsers.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredUsers.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchUsers()
      console.log('Raw users data:', data)
      users.value = data || []
      pagination.value.total = users.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newUser = await createUser(payload)
      users.value.push(newUser)
      return newUser
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
      const updated = await updateUser(id, payload)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = updated
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
      await deleteUser(id)
      users.value = users.value.filter((u) => u.id !== id)
      pagination.value.total--
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      loading.value = false
    }
  }

  const lock = async (id) => {
    loading.value = true
    error.value = null
    try {
      const updated = await lockUser(id)
      console.log('API lock response:', updated)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        // Si la réponse contient un objet utilisateur complet
        if (updated && typeof updated === 'object' && updated.id) {
          users.value[index] = updated
        } else {
          // Sinon, marquer le serveur comme étant verrouillé directement
          users.value[index].isLocked = true
        }
      }
      console.log('Updated user in store:', users.value[index])
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du verrouillage'
      throw err
    } finally {
      loading.value = false
    }
  }

  const unlock = async (id) => {
    loading.value = true
    error.value = null
    try {
      const updated = await unlockUser(id)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        // Si la réponse contient un objet utilisateur complet
        if (updated && typeof updated === 'object' && updated.id) {
          users.value[index] = updated
        } else {
          // Sinon, marquer le serveur comme étant déverrouillé directement
          users.value[index].isLocked = false
        }
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du déverrouillage'
      throw err
    } finally {
      loading.value = false
    }
  }

  const validate = async (id) => {
    loading.value = true
    error.value = null
    try {
      const updated = await validateUser(id)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la validation'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addRoles = async (id, roleIds) => {
    loading.value = true
    error.value = null
    try {
      const updated = await addRolesToUser(id, roleIds)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'assignation des rôles'
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
    users,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredUsers,
    paginatedUsers,
    totalPages,
    // Actions
    fetchAll,
    createNew,
    update,
    remove,
    lock,
    unlock,
    validate,
    addRoles,
    setSortBy,
    setPage,
    setSearchQuery,
    clearError,
  }
})
