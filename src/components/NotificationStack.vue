<template>
  <transition-group name="notification">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="getColor(notification.type)"
      timeout="-1"
      location="top right"
      class="notification-snackbar"
      @update:modelValue="removeNotification(notification.id)"
    >
      <div class="d-flex align-center gap-2">
        <v-icon size="20">{{ getIcon(notification.type) }}</v-icon>
        <span>{{ notification.message }}</span>
      </div>
    </v-snackbar>
  </transition-group>
</template>

<script setup>
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

const getColor = (type) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }
  return colors[type] || 'info'
}

const getIcon = (type) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
  return icons[type] || 'mdi-information'
}
</script>

<style scoped>
.notification-snackbar {
  margin-bottom: 1rem;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
