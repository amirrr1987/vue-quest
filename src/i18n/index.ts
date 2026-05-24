import i18next from 'i18next'
import faIR from '../locales/fa_IR.json'

void i18next.init({
  lng: 'fa',
  fallbackLng: 'fa',
  resources: {
    fa: {
      translation: faIR,
    },
  },
})

export default i18next
