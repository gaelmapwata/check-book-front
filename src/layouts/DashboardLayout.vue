<template>
  <v-app>
    <AppSidebar />

    <v-main class="dashboard-main">
      <AppNavbar />

      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<style scoped>
.dashboard-main {
  background-color: #fff; /* fond blanc UBA */
}
</style>
