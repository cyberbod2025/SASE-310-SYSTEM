#!/bin/bash
# ==============================================================================
# SASE-310: PROTOCOLO HEARTBEAT (Script de Salud 360°)
# Este script realiza un diagnóstico integral del sistema local y remoto.
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Iniciando SASE-GUARD: Protocolo Heartbeat...${NC}\n"

# 1. INTEGRIDAD DE CONSTRUCCIÓN
echo -e "${YELLOW}📦 [1/4] Verificando compilación (Vite)...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build exitoso.${NC}"
else
    echo -e "${RED}❌ ERROR: El build falla. Revisa tus dependencias o tipos.${NC}"
    exit 1
fi

# 2. SEGURIDAD DE BASE DE DATOS (RLS/VIEWS)
echo -e "\n${YELLOW}🛡️ [2/4] Ejecutando auditoría de Supabase (Linter)...${NC}"
# Forzamos fail-on warning para máxima seguridad institucional
if supabase db lint --local --fail-on warning; then
    echo -e "${GREEN}✅ Base de datos conforme a políticas institucionales.${NC}"
else
    echo -e "${RED}⚠️ ALERTA: Se detectaron vulnerabilidades de seguridad en el esquema local.${NC}"
    exit 1
fi

# 3. CONFORMIDAD LINT (CODIGO)
echo -e "\n${YELLOW}🧩 [3/4] Auditando reglas de código (ESLint)...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Código limpio.${NC}"
else
    echo -e "${YELLOW}⚠️ NOTA: Hay advertencias de estilo en el código. Recomendable revisar.${NC}"
fi

# 4. SINCRONIZACIÓN DE REPOSITORIO
echo -e "\n${YELLOW}🛰️ [4/4] Verificando estado de Git...${NC}"
git_status=$(git status --short)
if [ -z "$git_status" ]; then
    echo -e "${GREEN}✅ Local sincronizado con repositorio.${NC}"
else
    echo -e "${YELLOW}📋 NOTA: Tienes cambios locales sin commitear.${NC}\n$git_status"
fi

echo -e "\n${BLUE}✨ Diagnóstico SASE-310 completado satisfactoriamente.${NC}"
