Adopta este repo con el kit `tooling/repo-governance-kit/` y ejecuta una auditoria brownfield inicial.

Ademas de crear la base SDD:
- audita GitHub workflows
- audita secretos y scripts peligrosos
- audita Supabase/RLS si existe
- audita deriva visual si es frontend

Entrega:
1. constitucion local
2. canon local
3. spec `001-gobernanza-brownfield`
4. hallazgos priorizados
5. plan de remediacion por fases

Reglas:
- no copies reglas de dominio desde SASE
- si docs y config se contradicen, manda config/codigo ejecutable
- no implementes fixes salvo que se pidan explicitamente
