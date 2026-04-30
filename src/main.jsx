import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Temporary hardcoded API root to rule out Railway env var injection issues.
const API_URL = 'https://cricplaybackend-production.up.railway.app/api'

axios.defaults.baseURL = API_URL.replace(/\/+$/, '')

axios.interceptors.request.use((config) => {
  if (typeof config.url === 'string') {
    config.url = config.url.replace(/^\/api\//, '/')
  }

  return config
})

axios.defaults.headers.common.Accept = 'application/json'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
