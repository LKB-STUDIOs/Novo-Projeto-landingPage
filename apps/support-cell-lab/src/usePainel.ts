import { useEffect, useState } from 'react'
import { PAINEL_EVENT, loadPainel, type PainelStore } from './data'

/** Preços do painel, atualizados quando o painel salva (inclusive em outra aba). */
export function usePainel(): PainelStore {
  const [store, setStore] = useState(loadPainel)
  useEffect(() => {
    const reload = () => setStore(loadPainel())
    window.addEventListener(PAINEL_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(PAINEL_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [])
  return store
}
