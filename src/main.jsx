import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://cricplaybackend-production.up.railway.app'
    : 'http://127.0.0.1:8000')

axios.defaults.baseURL = apiBaseUrl.replace(/\/+$/, '')
axios.defaults.headers.common.Accept = 'application/json'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
