import axios from 'axios'
import { useNotification } from '@/composables/useNotification'
import { usePermission } from '@/composables/usePermission'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Extraire les permissions du token
    const { extractFromToken } = usePermission()
    extractFromToken(token)
  }
  return config
})

// Interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { error: notifyError } = useNotification()

    if (error.response?.status === 403) {
      notifyError('⛔ Accès refusé. Vous n\'avez pas les permissions nécessaires.')
      console.error('403 Forbidden:', error.response.data)
    } else if (error.response?.status === 401) {
      notifyError('🔐 Votre session a expiré. Veuillez vous reconnecter.')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 500) {
      notifyError('❌ Erreur serveur. Veuillez réessayer plus tard.')
    }

    return Promise.reject(error)
  },
)

// Auth endpoints
export const signin = async (email, encryptedPassword) => {
  const response = await api.post('/auth/signin', { email, password: encryptedPassword })
  return response.data // retourne PASSWORD_TOKEN
}

export const verifyOtp = async (otp, token) => {
  const response = await api.post(
    '/otp/verify',
    { otp },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data // retourne MAIN_TOKEN
}

// Resource endpoints
export const fetchResources = async () => {
  const response = await api.get('/resources')
  return response.data
}

export const fetchRessources = async () => {
  const response = await api.get('/resources')
  return response.data
}

export const getRessourceById = async (id) => {
  const response = await api.get(`/resources/${id}`)
  return response.data
}

export const createRessource = async (payload) => {
  const response = await api.post('/resources', payload)
  return response.data
}

export const updateRessource = async (id, payload) => {
  const response = await api.put(`/resources/${id}`, payload)
  return response.data
}

export const deleteRessource = async (id) => {
  const response = await api.delete(`/resources/${id}`)
  return response.data
}

// Permission endpoints
export const fetchPermissions = async () => {
  const response = await api.get('/permissions')
  return response.data
}

export const getPermissionById = async (id) => {
  const response = await api.get(`/permissions/${id}`)
  return response.data
}

export const createPermission = async (payload) => {
  const response = await api.post('/permissions', payload)
  return response.data
}

export const updatePermission = async (id, payload) => {
  const response = await api.put(`/permissions/${id}`, payload)
  return response.data
}

export const deletePermission = async (id) => {
  const response = await api.delete(`/permissions/${id}`)
  return response.data
}

export const addRolesToPermission = async (permissionId, roleIds) => {
  const response = await api.post(`/admin/permissions/${permissionId}/roles`, {
    roleIds,
  })
  return response.data
}

// Role endpoints
export const fetchRoles = async () => {
  const response = await api.get('/roles')
  return response.data
}

export const getRoleById = async (id) => {
  const response = await api.get(`/roles/${id}`)
  return response.data
}

export const createRole = async (payload) => {
  const response = await api.post('/roles', payload)
  return response.data
}

export const updateRole = async (id, payload) => {
  const response = await api.put(`/roles/${id}`, payload)
  return response.data
}

export const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`)
  return response.data
}

// Country endpoints
export const fetchCountries = async () => {
  const response = await api.get('/countries')
  return response.data
}

export const getCountryById = async (id) => {
  const response = await api.get(`/countries/${id}`)
  return response.data
}

export const createCountry = async (payload) => {
  const response = await api.post('/countries', payload)
  return response.data
}

export const updateCountry = async (id, payload) => {
  const response = await api.put(`/countries/${id}`, payload)
  return response.data
}

export const deleteCountry = async (id) => {
  const response = await api.delete(`/countries/${id}`)
  return response.data
}

// Bank endpoints
export const fetchBanks = async () => {
  const response = await api.get('/banks')
  return response.data
}

export const getBankById = async (id) => {
  const response = await api.get(`/banks/${id}`)
  return response.data
}

export const createBank = async (payload) => {
  const response = await api.post('/banks', payload)
  return response.data
}

export const updateBank = async (id, payload) => {
  const response = await api.put(`/banks/${id}`, payload)
  return response.data
}

export const deleteBank = async (id) => {
  const response = await api.delete(`/banks/${id}`)
  return response.data
}

// Branch endpoints
export const fetchBranches = async () => {
  const response = await api.get('/branches')
  return response.data
}

export const getBranchById = async (id) => {
  const response = await api.get(`/branches/${id}`)
  return response.data
}

export const createBranch = async (payload) => {
  const response = await api.post('/branches', payload)
  return response.data
}

export const updateBranch = async (id, payload) => {
  const response = await api.put(`/branches/${id}`, payload)
  return response.data
}

export const deleteBranch = async (id) => {
  const response = await api.delete(`/branches/${id}`)
  return response.data
}

// User endpoints
export const fetchUsers = async () => {
  const response = await api.get('/users')
  return response.data
}

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export const createUser = async (payload) => {
  const response = await api.post('/users', payload)
  return response.data
}

export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, payload)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

export const lockUser = async (id) => {
  const response = await api.post(`/users/${id}/lock`)
  return response.data
}

export const unlockUser = async (id) => {
  const response = await api.post(`/users/${id}/unlock`)
  return response.data
}

export const validateUser = async (id) => {
  const response = await api.post(`/users/${id}/validate`)
  return response.data
}

export const addRolesToUser = async (id, roleIds) => {
  const response = await api.post(`/users/${id}/roles`, roleIds)
  return response.data
}

export default api
