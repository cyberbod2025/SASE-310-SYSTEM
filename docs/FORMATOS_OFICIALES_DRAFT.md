# Formatos Oficiales (Actualizados a Linea Institucional)

Estos formatos estan alineados con las plantillas activas de SASE-310 y la
identidad institucional definida en `src/config/sase.config.ts`.

Institucion: Escuela Secundaria Diurna No. 310 "Presidentes de Mexico"
CCT: 09DES4310M
Turno: Vespertino

---

## Encabezado institucional (uso comun)

```html
<div style="text-align:center; margin-bottom:30px; border-bottom:2px solid #1e3a8a; padding-bottom:20px;">
  <p style="font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:3px; color:#64748b; margin:0;">
    SECRETARIA DE EDUCACION PUBLICA
  </p>
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:4px 0;">
    AUTORIDAD EDUCATIVA FEDERAL EN LA CIUDAD DE MEXICO
  </p>
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:4px 0;">
    DIRECCION GENERAL DE EDUCACION SECUNDARIA
  </p>
  <h1 style="font-size:18px; font-weight:900; color:#1e3a8a; margin:16px 0 4px; text-transform:uppercase; letter-spacing:1px;">
    ESCUELA SECUNDARIA DIURNA No. 310
  </h1>
  <p style="font-size:10px; color:#94a3b8; margin:0; font-weight:600;">
    "PRESIDENTES DE MEXICO" — TURNO VESPERTINO — C.C.T. 09DES4310M
  </p>
  <p style="font-size:10px; color:#cbd5e1; margin:8px 0 0; font-weight:700;">
    FOLIO: [FOLIO] | FECHA: [FECHA]
  </p>
</div>
```

---

## 1) Citatorio a Padres de Familia o Tutores

Uso: Solicitar la presencia del tutor para tratar asuntos academicos o conductuales.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  CITATORIO A PADRES DE FAMILIA O TUTORES
</h2>

<table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:12px;">
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; width:30%; text-transform:uppercase; font-size:10px;">Alumno(a)</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[NOMBRE_ALUMNO]</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Grupo</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[GRUPO]</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Fecha del incidente</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[FECHA_INCIDENTE] a las [HORA] hrs.</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Lugar</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[LUGAR]</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Reporta</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[DOCENTE_REPORTA]</td>
  </tr>
</table>

<div style="margin:20px 0; padding:16px; background:#fef3c7; border:1px solid #fbbf24; border-radius:8px; text-align:center;">
  <p style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">
    Se cita para presentarse el dia
  </p>
  <p style="font-size:18px; font-weight:900; margin:0;">
    [FECHA_CITA] a las [HORA_CITA] hrs.
  </p>
  <p style="font-size:10px; margin:8px 0 0;">
    En la Oficina de Orientacion y Tutoria Educativa de este plantel.
  </p>
</div>
```

---

## 2) Acta Circunstanciada de Hechos

Uso: Narrativa oficial de un suceso relevante (conflicto, accidente, falta grave).

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  ACTA CIRCUNSTANCIADA DE HECHOS
</h2>

<table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:12px;">
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; width:30%; text-transform:uppercase; font-size:10px;">Alumno(a)</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[NOMBRE_ALUMNO]</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Grupo</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[GRUPO]</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Fecha del incidente</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[FECHA_INCIDENTE] a las [HORA] hrs.</td>
  </tr>
  <tr>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px;">Lugar</td>
    <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">[LUGAR]</td>
  </tr>
</table>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [RELATO_DE_HECHOS]
</div>
```

---

## 3) Hoja de Acuerdos y Compromisos

Uso: Registro de acuerdos posteriores a una incidencia o citatorio.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  HOJA DE ACUERDOS Y COMPROMISOS
</h2>

<div style="margin:20px 0;">
  <p style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
    Acuerdos y compromisos establecidos
  </p>
  <ol style="font-size:12px; line-height:2; padding-left:20px;">
    <li>[ACUERDO_1]</li>
    <li>[ACUERDO_2]</li>
    <li>[ACUERDO_3]</li>
  </ol>
</div>
```

---

## 4) Informe de Caso

Uso: Documento de seguimiento para casos especiales.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  INFORME DE CASO
</h2>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [CONTENIDO_INFORME]
</div>
```

---

## 5) Informe de Supervision

Uso: Reporte de supervision interna o externa.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  INFORME DE SUPERVISION
</h2>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [CONTENIDO_SUPERVISION]
</div>
```

---

## 6) Circular Interna

Uso: Comunicaciones internas al personal docente.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  CIRCULAR INTERNA
</h2>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [CONTENIDO_CIRCULAR]
</div>
```

---

## 7) Aviso a la Comunidad Escolar

Uso: Comunicados generales para la comunidad escolar.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  AVISO A LA COMUNIDAD ESCOLAR
</h2>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [CONTENIDO_AVISO]
</div>
```

---

## 8) Minuta del Consejo Tecnico Escolar

Uso: Registro de acuerdos del CTE.

```html
<!-- ENCABEZADO INSTITUCIONAL -->

<h2 style="text-align:center; font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px;">
  MINUTA DEL CONSEJO TECNICO ESCOLAR
</h2>

<div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
  [CONTENIDO_MINUTA]
</div>
```
