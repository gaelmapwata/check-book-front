import { ref, computed } from 'vue'

// Structure des permissions par ressource
const PERMISSIONS = {
  RESSOURCE: {
    READ: 'RESSOURCE:READ',
    CREATE: 'RESSOURCE:CREATE',
    UPDATE: 'RESSOURCE:UPDATE',
    DELETE: 'RESSOURCE:DELETE',
  },
  PERMISSION: {
    READ: 'PERMISSION:READ',
    CREATE: 'PERMISSION:CREATE',
    UPDATE: 'PERMISSION:UPDATE',
    DELETE: 'PERMISSION:DELETE',
  },
  ROLE: {
    READ: 'ROLE:READ',
    CREATE: 'ROLE:CREATE',
    UPDATE: 'ROLE:UPDATE',
    DELETE: 'ROLE:DELETE',
  },
}

const userPermissions = ref([])
const userRole = ref(null)

export const usePermission = () => {
  // Decode JWT et extraire permissions
  const extractFromToken = (token) => {
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userRole.value = payload.role || payload.authorities?.[0]
      userPermissions.value = payload.authorities || payload.permissions || []
    } catch (err) {
      console.error('Error decoding token:', err)
    }
  }

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  // Vérifier si l'utilisateur a le rôle ADMIN
  const isAdmin = computed(() => {
    return userRole.value === 'ADMIN' || userPermissions.value.includes('ROLE_ADMIN')
  })

  // Vérifier les permissions pour RESSOURCE
  const canRead = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.RESSOURCE.READ),
  )
  const canCreate = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.RESSOURCE.CREATE),
  )
  const canUpdate = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.RESSOURCE.UPDATE),
  )
  const canDelete = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.RESSOURCE.DELETE),
  )

  // Vérifier les permissions pour PERMISSION
  const canReadPermissions = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.PERMISSION.READ),
  )
  const canCreatePermissions = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.PERMISSION.CREATE),
  )
  const canUpdatePermissions = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.PERMISSION.UPDATE),
  )
  const canDeletePermissions = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.PERMISSION.DELETE),
  )

  // Vérifier les permissions pour ROLE
  const canReadRole = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.ROLE.READ),
  )
  const canCreateRole = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.ROLE.CREATE),
  )
  const canUpdateRole = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.ROLE.UPDATE),
  )
  const canDeleteRole = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.ROLE.DELETE),
  )

  return {
    PERMISSIONS,
    userPermissions,
    userRole,
    extractFromToken,
    hasPermission,
    isAdmin,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canReadPermissions,
    canCreatePermissions,
    canUpdatePermissions,
    canDeletePermissions,
    canReadRole,
    canCreateRole,
    canUpdateRole,
    canDeleteRole,
  }
}
