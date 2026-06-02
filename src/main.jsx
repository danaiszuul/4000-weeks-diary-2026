import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { DiaryProvider } from './data/DiaryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DiaryProvider>
        <App />
      </DiaryProvider>
    </AuthProvider>
  </StrictMode>,
)
