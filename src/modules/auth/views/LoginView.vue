<template>
  <v-container class="fill-height" fluid style="background-color: #ffeded">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-8" elevation="12" rounded="xl">
          <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold">UBA CheckBook</h2>
            <span class="text-grey-darken-1">Secure Administration Portal</span>
          </div>

          <!-- Formulaire login -->
          <v-form v-if="!showOtpForm" @submit.prevent="handleSignin">
            <v-text-field
              v-model="email"
              label="Email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              required
            />

            <v-text-field
              v-model="password"
              label="Mot de passe"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              required
            />

            <v-btn type="submit" color="primary" size="large" block class="mt-4" :loading="loading">
              Sign In
            </v-btn>
          </v-form>

          <!-- Formulaire OTP -->
          <v-form v-if="showOtpForm" @submit.prevent="handleOtpVerify" class="mt-6">
            <div class="d-flex justify-center ga-2">
              <v-text-field
                v-for="(digit, index) in otpDigits"
                :key="index"
                :ref="(el) => (otpRefs[index] = el)"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                class="otp-input"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:modelValue="handleInput($event, index)"
                @keydown.backspace="handleBackspace(index)"
                @paste="handlePaste($event)"
              />
            </div>

            <v-btn
              type="submit"
              color="error"
              size="large"
              block
              class="mt-4"
              :disabled="otp.length !== 8"
              :loading="loading"
            >
              Vérifier OTP
            </v-btn>
          </v-form>

          <!-- Message d'erreur -->
          <v-alert v-if="errorMessage" type="error" dense class="mt-4" border="left" colored-border>
            {{ errorMessage }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { signin, verifyOtp } from '@/services/api.js'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY
const IV = CryptoJS.enc.Utf8.parse('1234567890123456')
const router = useRouter()

// Form data
const email = ref('')
const password = ref('')
const otpDigits = ref(Array(8).fill(''))
const otpRefs = []
const showOtpForm = ref(false)
const passwordToken = ref(null)
const errorMessage = ref('')
const loading = ref(false)

// Construit le OTP complet
const otp = computed(() => otpDigits.value.join(''))

// Gestion login
const handleSignin = async () => {
  loading.value = true
  try {
    const encryptedPassword = CryptoJS.AES.encrypt(
      password.value,
      CryptoJS.enc.Utf8.parse(SECRET_KEY),
      {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    ).toString()
    const data = await signin(email.value, encryptedPassword)
    passwordToken.value = data.token
    showOtpForm.value = true
    errorMessage.value = ''
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Échec de la connexion. Vérifiez vos identifiants.'
  } finally {
    loading.value = false
  }
}

// Gestion OTP
const handleOtpVerify = async () => {
  loading.value = true
  try {
    const data = await verifyOtp(otp.value, passwordToken.value)
    localStorage.setItem('token', data.token)
    errorMessage.value = ''
    // Router.push va déclencher App.vue qui va charger automatiquement les permissions
    router.push('/')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'OTP incorrect ou expiré.'
  } finally {
    loading.value = false
  }
}

const handleInput = async (value, index) => {
  // Autoriser uniquement les chiffres
  const digit = value.replace(/[^0-9]/g, '')
  otpDigits.value[index] = digit

  // Focus automatique au suivant
  if (digit && index < 7) {
    await nextTick()
    otpRefs[index + 1]?.focus()
  }
}

const handleBackspace = async (index) => {
  if (!otpDigits.value[index] && index > 0) {
    await nextTick()
    otpRefs[index - 1]?.focus()
  }
}
const handlePaste = async (event) => {
  event.preventDefault()

  const pastedData = event.clipboardData.getData('text')

  // Extraire uniquement les chiffres
  const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 8)

  if (!digits) return

  // Remplir les champs
  for (let i = 0; i < digits.length; i++) {
    otpDigits.value[i] = digits[i]
  }

  // Focus sur la dernière case remplie
  await nextTick()
  const lastIndex = digits.length - 1
  otpRefs[lastIndex]?.focus()
}
</script>

<style scoped>
.otp-input input {
  text-align: center;
  font-size: 1.5rem;
  width: 3rem;
  padding: 0.5rem;
}
</style>
