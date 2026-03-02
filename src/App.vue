<template>
  <v-app>
    <NotificationStack />
    <router-view />
  </v-app>
</template>

<script setup>
import NotificationStack from '@/components/NotificationStack.vue'
</script>
