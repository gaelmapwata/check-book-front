import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  fetchResources,
  addRolesToPermission,
  fetchRoles,
} from '@/services/api'

export const usePermissionStore = defineStore('permission', () => {
  // State
  const permissions = ref([])
  const resources = ref([]) // Pour le select resource
  const roles = ref([]) // Pour le select roles
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
  const filteredPermissions = computed(() => {
    let filtered = [...permissions.value]

    // Filtre par recherche
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.slug?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.resourceName?.toLowerCase().includes(query) ||
          p.id?.toString().includes(query),
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

  const paginatedPermissions = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredPermissions.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredPermissions.value.length / pagination.value.pageSize),
  )

  // Actions
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchPermissions()
      permissions.value = data || []
      pagination.value.total = permissions.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      console.error('Fetch error:', err)
      permissions.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchAllResources = async () => {
    try {
      const data = await fetchResources()
      console.log('Resources loaded:', data)
      resources.value = Array.isArray(data) ? data : []
    } catch (err) {
      if (err.response?.status === 403) {
        console.warn('Permissions insuffisantes pour charger les ressources (RESOURCE:READ manquant)')
        error.value = '⛔ Permissions insuffisantes pour charger les ressources'
      } else {
        console.error('Error fetching resources:', err)
      }
      resources.value = []
    }
  }

  const fetchAllRoles = async () => {
    try {
      const data = await fetchRoles()
      console.log('Roles loaded:', data)
      roles.value = Array.isArray(data) ? data : []
    } catch (err) {
      console.error('Error fetching roles:', err)
      roles.value = []
    }
  }

  const createNew = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const newPermission = await createPermission(payload)
      permissions.value.push(newPermission)
      return newPermission
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
      const updated = await updatePermission(id, payload)
      const index = permissions.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        permissions.value[index] = updated
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
      await deletePermission(id)
      permissions.value = permissions.value.filter((p) => p.id !== id)
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

  const addRoles = async (permissionId, roleIds) => {
    loading.value = true
    error.value = null
    try {
      const updated = await addRolesToPermission(permissionId, roleIds)
      const index = permissions.value.findIndex((p) => p.id === permissionId)
      if (index !== -1) {
        permissions.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout des rôles'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    permissions,
    resources,
    roles,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    // Actions
    fetchAll,
    fetchAllResources,
    fetchAllRoles,
    createNew,
    update,
    remove,
    addRoles,
    setSortBy,
    setPage,
    setSearchQuery,
    clearError,
  }
})
