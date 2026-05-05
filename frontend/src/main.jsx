import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Router is enabled from day one for multi-page flows. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
