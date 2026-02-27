<template>
  <v-app-bar flat color="#DA291C" dark>
    <v-toolbar-title class="font-weight-bold white--text">Dashboard</v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Notifications -->
    <v-btn icon>
      <v-badge dot color="yellow">
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <!-- User Menu -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-avatar size="36">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
