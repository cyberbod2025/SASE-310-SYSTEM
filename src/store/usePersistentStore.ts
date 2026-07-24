import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppModule } from '../types'

interface PersistentState {
  user: any | null; // Placeholder segun solicito el usuario, aunque el sistema use Supabase
  currentModule: AppModule;
  setCurrentModule: (module: AppModule) => void;
  setUser: (user: any) => void;
}

/**
 * @deprecated Usar `useStore.ts` (useStore) en su lugar.
 * Ambos stores persistian bajo la misma clave 'sase-storage'.
 * Este archivo queda como referencia; no importar en codigo nuevo.
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
      name: 'sase-storage',
    }
  )
)
