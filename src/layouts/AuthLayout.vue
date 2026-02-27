<template>
  <v-app>
    <v-main class="auth-background d-flex align-center justify-center">
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-background {
  background: linear-gradient(135deg, #d71920 0%, #b71c1c 100%);
  min-height: 100vh;
}
</style>
