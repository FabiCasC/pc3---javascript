import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
// Initialize Firebase first - must be imported before any other code uses it
import './lib/firebase'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider storageKey="creaza-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

