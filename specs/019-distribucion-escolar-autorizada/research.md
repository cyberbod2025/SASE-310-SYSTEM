# Investigación

## Hallazgos

- El endpoint está desplegable por su ubicación bajo `api/`, aunque no se encontró
  una llamada desde `src/`.
- Usa `service_role` antes de identificar a una persona.
- CORS solo añade encabezados cuando reconoce el origen, pero no rechaza los demás.
- La consulta trae `nombre_completo` y `datos_bap`; ninguno se utiliza.
- El algoritmo ordena por `puntaje_riesgo` y distribuye en ronda, sin guardar.
- La respuesta contiene identificadores de alumno y grupos sugeridos.
- No existe propósito, rate limit ni auditoría.
- El `catch` devuelve `err.message` al cliente.

## Decisiones

- Endurecer el endpoint en lugar de borrarlo, porque la propuesta puede apoyar una
  futura planeación institucional.
- Mantener la regla actual solo como una propuesta técnica, no como decisión
  pedagógica.
- No crear una migración: la bitácora canónica `auditoria` ya acepta escrituras
  server-side con actor, propósito y origen.
- Auditar el volumen y el ciclo, no los puntajes ni la lista de alumnos.
- Resolver empates por identificador y ordenar grupos por nombre para que una misma
  entrada produzca la misma propuesta.
