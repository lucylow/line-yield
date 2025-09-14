import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const initLiff = async () => {
  try {
    // Dynamic import for LIFF
    const liff = await import('@line/liff')
    await liff.default.init({ liffId: import.meta.env.VITE_LIFF_ID })
    console.log('LIFF initialized successfully')
  } catch (error) {
    console.error('LIFF initialization failed:', error)
  }
}

initLiff().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})