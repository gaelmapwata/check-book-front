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
  COUNTRY: {
    READ: 'COUNTRY:READ',
    CREATE: 'COUNTRY:CREATE',
    UPDATE: 'COUNTRY:UPDATE',
    DELETE: 'COUNTRY:DELETE',
  },
  BANK: {
    READ: 'BANK:READ',
    CREATE: 'BANK:CREATE',
    UPDATE: 'BANK:UPDATE',
    DELETE: 'BANK:DELETE',
  },
  BRANCH: {
    READ: 'Branch:READ',
    CREATE: 'Branch:CREATE',
    UPDATE: 'Branch:UPDATE',
    DELETE: 'Branch:DELETE',
  },
  USER: {
    READ: 'USER:READ',
    CREATE: 'USER:CREATE',
    UPDATE: 'USER:UPDATE',
    DELETE: 'USER:DELETE',
    LOCK: 'USER:LOCK',
    UNLOCK: 'USER:UNLOCK',
    VALIDATE: 'USER:VALIDATE',
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

  // Vérifier les permissions pour COUNTRY
  const canReadCountry = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.COUNTRY.READ),
  )
  const canCreateCountry = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.COUNTRY.CREATE),
  )
  const canUpdateCountry = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.COUNTRY.UPDATE),
  )
  const canDeleteCountry = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.COUNTRY.DELETE),
  )

  // Vérifier les permissions pour BANK
  const canReadBank = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BANK.READ),
  )
  const canCreateBank = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BANK.CREATE),
  )
  const canUpdateBank = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BANK.UPDATE),
  )
  const canDeleteBank = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BANK.DELETE),
  )

  // Vérifier les permissions pour BRANCH
  const canReadBranch = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BRANCH.READ),
  )
  const canCreateBranch = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BRANCH.CREATE),
  )
  const canUpdateBranch = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BRANCH.UPDATE),
  )
  const canDeleteBranch = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.BRANCH.DELETE),
  )

  // Vérifier les permissions pour USER
  const canReadUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.READ),
  )
  const canCreateUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.CREATE),
  )
  const canUpdateUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.UPDATE),
  )
  const canDeleteUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.DELETE),
  )
  const canLockUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.LOCK),
  )
  const canUnlockUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.UNLOCK),
  )
  const canValidateUser = computed(() =>
    isAdmin.value && hasPermission(PERMISSIONS.USER.VALIDATE),
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
    canReadCountry,
    canCreateCountry,
    canUpdateCountry,
    canDeleteCountry,
    canReadBank,
    canCreateBank,
    canUpdateBank,
    canDeleteBank,
    canReadBranch,
    canCreateBranch,
    canUpdateBranch,
    canDeleteBranch,
    canReadUser,
    canCreateUser,
    canUpdateUser,
    canDeleteUser,
    canLockUser,
    canUnlockUser,
    canValidateUser,
  }
}
