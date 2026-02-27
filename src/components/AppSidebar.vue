<template>
  <v-navigation-drawer v-model="drawer" app color="#DA291C" dark width="260">
    <v-list dense>
      <v-list-item class="text-h6 font-weight-bold" two-line>
        <v-list-item-title>UBA Admin</v-list-item-title>
        <v-list-item-subtitle>CheckBook</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="mb-2"></v-divider>

      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" router link>
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', route: '/' },
  { title: 'Users', icon: 'mdi-account-group-outline', route: '/users' },
  { title: 'Transactions', icon: 'mdi-bank-transfer', route: '/transactions' },
  { title: 'Reports', icon: 'mdi-chart-bar', route: '/reports' },
]
</script>
