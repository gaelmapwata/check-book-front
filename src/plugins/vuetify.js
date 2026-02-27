import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'ubaTheme',
    themes: {
      ubaTheme: {
        dark: false,
        colors: {
          primary: '#D71920',      // Rouge UBA
          secondary: '#000000',    // Noir
          background: '#F5F5F5',   // Gris clair propre
          surface: '#FFFFFF',
          error: '#B00020',
          success: '#2E7D32',
          warning: '#ED6C02'
        }
      }
    },
  defaults: {
    VBtn: {
      rounded: 'xl',
      elevation: 0,
      color: 'primary',
    },
    VCard: {
      rounded: 'xl',
      elevation: 12,
    },
  },
  }
})
