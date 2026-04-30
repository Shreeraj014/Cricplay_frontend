import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const API_HOST = (
  import.meta.env.VITE_API_URL || 'https://cricplaybackend-production.up.railway.app'
).replace(/\/api\/?$/, '').replace(/\/+$/, '')

axios.defaults.baseURL = API_HOST

axios.defaults.headers.common.Accept = 'application/json'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
