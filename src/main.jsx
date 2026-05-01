import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const FALLBACK_API_HOST = 'https://cricplaybackend-production.up.railway.app'

const normalizeApiHost = (rawValue) => {
  const trimmedValue = String(rawValue || '').trim()

  if (!trimmedValue) {
    return FALLBACK_API_HOST
  }

  const markdownLinkMatch = trimmedValue.match(/\((https?:\/\/[^)\s]+)\)/)
  const directUrlMatch = trimmedValue.match(/https?:\/\/[^\s)\]]+/)
  const candidate = markdownLinkMatch?.[1] || directUrlMatch?.[0] || trimmedValue

  try {
    const normalizedUrl = new URL(candidate)
    return normalizedUrl.toString().replace(/\/api\/?$/, '').replace(/\/+$/, '')
  } catch {
    console.warn('Invalid VITE_API_URL value detected. Falling back to Railway backend.')
    return FALLBACK_API_HOST
  }
}

const API_HOST = normalizeApiHost(import.meta.env.VITE_API_URL)

axios.defaults.baseURL = API_HOST

axios.defaults.headers.common.Accept = 'application/json'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
