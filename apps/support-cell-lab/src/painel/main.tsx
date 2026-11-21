import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '../index.css'
import { Painel } from './Painel'

createRoot(document.getElementById('root')!).render(<Painel />)
