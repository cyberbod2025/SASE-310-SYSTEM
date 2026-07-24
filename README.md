# SASE 310 — Sistema de Acompañamiento y Seguimiento Escolar

**Versión:** 3.10.0 — Piloto Institucional  
**Institución:** Escuela Secundaria Diurna No. 310 "Presidentes de México" (CCT 09DES4310M)  
**Plataforma:** Sistema nervioso institucional para organizar, registrar, consultar y dar seguimiento a la vida escolar.

---

## ¿Qué es SASE 310?

SASE 310 centraliza la información escolar relevante de alumnos, grupos, incidencias, expedientes, orientación, prefectura, dirección, salud, UDEII, documentos, notificaciones y auditoría, para mejorar el seguimiento institucional, la comunicación interna, la toma de decisiones y la protección de la comunidad escolar.

No es una app de alumnos, ni un dashboard bonito, ni un repositorio de reportes. Es el sistema para que la escuela pueda **ver, cuidar, actuar y recordar**.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 6 |
| **Estado** | Zustand 5 + Context API |
| **Estilos** | Tailwind CSS 3 (Luminous Refraction design system) |
| **Backend** | Supabase (PostgreSQL 17 + Edge Functions Deno) |
| **IA** | Google Gemini API + OpenRouter (Sasito Assistant) |
| **Auth** | Supabase Auth (JWT) + RLS granular por rol |
| **Tests** | Vitest + Testing Library + Playwright + TestSprite |
| **CI/CD** | GitHub Actions + Husky |

---

## Módulos Principales (37 implementados)

- **Login / Auth** — Autenticación con Supabase, registro personal mínimo
- **Onboarding 30-60-90** — Desbloqueo progresivo de módulos según fase
- **Dashboards por rol** — Docente, Prefectura, Dirección, Subdirección, Orientación, Trabajo Social, Salud, UDEII, Promotora Lectura, Secretaría, Developer
- **Expedientes** — Expediente institucional por alumno con línea de tiempo
- **Incidencias** — Registro rápido y flujo completo con clasificación
- **Agenda Escolar** — Eventos y seguimiento
- **Asistencia / Pase de Lista**
- **Protocolos** — Convivencia, salud, emergencia
- **Bitácora de Auditoría (Caja Negra)** — Trazabilidad completa de acciones
- **Matrícula Inteligente** — Gestión de matrícula y movimientos
- **Cierre de Ciclo** — Promociones y cierre
- **Documentación Institucional** — 9 tipos de documentos (citatorios, actas, etc.)
- **IA Sasito** — Asistente institucional con clasificación y recomendaciones
- **SOS Emergencia** — Alertas con auto-escalamiento
- **Persistencia por área** — Trabajo Social, UDEII, Salud, Prefectura, Dirección

---

## Requisitos

- Node.js >= 20
- pnpm >= 9.15

## Instalación y desarrollo local

```bash
pnpm install
pnpm dev       # http://localhost:3101
pnpm test      # Vitest (253+ tests)
pnpm build     # Producción
pnpm lint      # ESLint
pnpm type-check # TypeScript
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y configurar:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Conexión a Supabase
- `GOOGLE_API_KEY` / `OPENROUTER_API_KEY` — API keys para IA
- `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` — Notificaciones WhatsApp
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Rate limiting

Ver `.env.example` para todas las variables requeridas.

---

## Licencia

Propietaria — Uso exclusivo institucional. Copyright © 2026 ESD 310.
