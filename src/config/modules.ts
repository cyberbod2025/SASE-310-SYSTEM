/**
 * URLs de módulos externos de SASE.
 * Mantener acá para evitar URLs hardcodeadas en componentes.
 */

export const DIAGNOSTICO_URL = import.meta.env.VITE_DIAGNOSTICO_URL
  ?? "https://diagnostico-colectivo.vercel.app/"

export const FERIA_URL = import.meta.env.VITE_FERIA_URL
  ?? "https://feria-selector.vercel.app/"
