import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole, AppModule } from '../types';

/**
 * 🛰️ SASE GLOBAL PERSISTENT STORE
 * Implementación de persistencia para el estado institucional de SASE-310.
 * Este store asegura que la trayectoria del usuario, el rol activo y los
 * estados de la interfaz (asistente, tutoriales) sobrevivan a recargas (F5).
 */
interface SaseState {
  // Identidad y Navegación
  user: any | null;
  currentUserRole: UserRole;
  currentModule: AppModule;
  
  // Estados de Interfaz
  isAssistantOpen: boolean;
  isTutorMode: boolean;
  isTourActive: boolean;
  onboardingPhase: 'intro' | 'learning' | 'active' | 'master';
  
  // Acciones
  setUser: (user: any) => void;
  setRole: (role: UserRole) => void;
  setModule: (module: AppModule) => void;
  toggleAssistant: () => void;
  toggleTutorMode: () => void;
  setTourActive: (active: boolean) => void;
  resetStore: () => void;
}

export const useStore = create<SaseState>()(
  persist(
    (set) => ({
      // Estado Inicial
      user: null,
      currentUserRole: UserRole.GUEST,
      currentModule: AppModule.WELCOME,
      isAssistantOpen: false,
      isTutorMode: false,
      isTourActive: false,
      onboardingPhase: 'intro',

      // Mutadores
      setUser: (user) => set({ user }),
      setRole: (role) => set({ currentUserRole: role }),
      setModule: (module) => set({ currentModule: module }),
      toggleAssistant: () => set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),
      toggleTutorMode: () => set((state) => ({ isTutorMode: !state.isTutorMode })),
      setTourActive: (active) => set({ isTourActive: active }),
      resetStore: () => set({
        currentModule: AppModule.WELCOME,
        isAssistantOpen: false,
        isTutorMode: false,
        isTourActive: false
      }),
    }),
    {
      name: 'sase-storage', // Clave única en LocalStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estados que tienen sentido tras un refresh
      partialize: (state) => ({ 
        currentUserRole: state.currentUserRole,
        currentModule: state.currentModule,
        isTutorMode: state.isTutorMode,
        onboardingPhase: state.onboardingPhase
      }),
    }
  )
);

export default useStore;
