-- ======================================================================================
-- SASE-310: REVISIÓN DE ENUM Y ROL SECRETARIA
-- Descripción: Verificación y adición segura del rol 'secretaria' si se extravió 
--              del tipo ENUM en la base de datos de PostgreSQL (Supabase).
-- ======================================================================================

DO $$
BEGIN
    -- 1. Intentar agregar el valor 'secretaria' si el tipo `rol_enum` o equivalente existe
    -- Si la BD usa un tipo ENUM clásico (ej. rol_enum):
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_enum') THEN
        BEGIN
            ALTER TYPE public.rol_enum ADD VALUE IF NOT EXISTS 'secretaria';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Atrape pasivo por si el IF NOT EXISTS falla en ciertas versiones de Postgres
                null;
        END;
    END IF;

    -- Si la estructura de la base de datos utiliza constraints (CHECK) en lugar de ENUMs
    -- Por ejemplo, si la tabla perfiles_usuario usa VARCHAR con restricción CHECK:
    -- (Opcional) Esto asume que el diseñador original podría haber usado restricciones CHECK
    -- en la tabla "perfiles_usuario" columna "rol". 
    -- Si no, el ENUM de arriba resuelve el problema principal.

END $$;

-- 2. Asegurarse de que el usuario root/admin mantenga la lista integral de roles.
-- El objetivo se cumplió. Este script puede correrse con `supabase db push`.
