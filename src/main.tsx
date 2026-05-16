import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

if (!window.location.hash && /^\/auth\/?$/.test(window.location.pathname)) {
  window.location.replace(`/#/auth${window.location.search}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
