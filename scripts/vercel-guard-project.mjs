#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_PROJECT = 'sase-310-system';

const projectName = process.env.VERCEL_PROJECT_NAME;
if (!projectName) {
  console.error('❌ Falta VERCEL_PROJECT_NAME. Ejecuta este check dentro de Vercel o define la variable localmente.');
  process.exit(1);
}

if (projectName !== EXPECTED_PROJECT) {
  console.error(`❌ Proyecto Vercel incorrecto: "${projectName}". Debe ser "${EXPECTED_PROJECT}".`);
  console.error('   Esto evita despliegues duplicados en proyectos equivocados.');
  process.exit(1);
}

const vercelJsonPath = resolve('vercel.json');
if (!existsSync(vercelJsonPath)) {
  console.error('❌ No existe vercel.json en la raíz.');
  process.exit(1);
}

try {
  JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
} catch {
  console.error('❌ vercel.json no es JSON válido.');
  process.exit(1);
}

console.log(`✅ Proyecto verificado: ${projectName}`);
