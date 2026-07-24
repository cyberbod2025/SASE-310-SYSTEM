import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppModule } from '../types'

interface PersistentState {
  user: any | null; // Placeholder según solicitó el usuario, aunque el sistema use Supabase
  currentModule: AppModule;
  setCurrentModule: (module: AppModule) => void;
  setUser: (user: any) => void;
}

/**
 * @deprecated Usar `useStore.ts` (useStore) en su lugar.
 * Ambos stores persistían bajo la misma clave 'sase-storage'.
 * Este archivo queda como referencia; no importar en código nuevo.
 */
 * 🔮 SASE PERSISTENT STORE
 * Gestiona el estado que debe sobrevivir a recargas de página (F5).
 * Específicamente la vista actual y datos ligeros de sesión.
 */
export const usePersistentStore = create<PersistentState>()(
  persist(
    (set) => ({
      user: null,
      currentModule: AppModule.WELCOME,
      setCurrentModule: (module) => set({ currentModule: module }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'sase-storage', // Key en localStorage
    }
  )
)
