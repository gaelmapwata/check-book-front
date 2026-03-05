<template>
  <v-app>
    <NotificationStack />
    <router-view />
  </v-app>
</template>

<script setup>
import NotificationStack from '@/components/NotificationStack.vue'
import { usePermission } from '@/composables/usePermission'
import { onMounted } from 'vue'

const permission = usePermission()

onMounted(() => {
  // Extraire le token du localStorage au chargement
  const token = localStorage.getItem('token')
  if (token) {
    permission.extractFromToken(token)
  }
})
</script>
