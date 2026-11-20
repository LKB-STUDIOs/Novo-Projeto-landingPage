import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App'

// Sem StrictMode: o duplo-montar em dev conflita com as raízes do <Html> do drei.
createRoot(document.getElementById('root')!).render(<App />)
