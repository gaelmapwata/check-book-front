import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const signin = async (email, encryptedPassword) => {
  const response = await api.post('/auth/signin', { email, password: encryptedPassword })
  return response.data // retourne PASSWORD_TOKEN
}

export const verifyOtp = async (otp, token) => {
  const response = await api.post(
    '/otp/verify',
    { otp },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data // retourne MAIN_TOKEN
}

export default api
