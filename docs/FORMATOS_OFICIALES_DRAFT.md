# Propuesta de Formatos Oficiales (Estándar AEFCM/SEP)

Basado en la normativa para Escuelas Secundarias Diurnas en la CDMX, he redactado las siguientes plantillas. Estos formatos incluyen los elementos legales y administrativos obligatorios.

---

## 1. Citatorio a Padres de Familia

**Uso:** Solicitar la presencia del tutor para tratar asuntos académicos o conductuales.

```html
<!-- ENCABEZADO OFICIAL -->
<div style="text-align: center; font-weight: bold;">
  SECRETARÍA DE EDUCACIÓN PÚBLICA<br />
  AUTORIDAD EDUCATIVA FEDERAL EN LA CIUDAD DE MÉXICO<br />
  DIRECCIÓN GENERAL DE OPERACIÓN DE SERVICIOS EDUCATIVOS<br />
  ESCUELA SECUNDARIA DIURNA No. 310 "MÉXICO-TENOCHTITLAN"<br />
  C.C.T. 09DES4310Z
</div>

<div style="text-align: right; margin-top: 20px;">
  <strong>Asunto:</strong> Citatorio<br />
  <strong>Fecha:</strong> [FECHA_ACTUAL]
</div>

<p>
  <strong>C. PADRE, MADRE DE FAMILIA O TUTOR(A)</strong><br />
  DEL ALUMNO(A): <strong>[NOMBRE_ALUMNO]</strong><br />
  GRADO Y GRUPO: <strong>[GRADO_GRUPO]</strong><br />
  PRESENTE.
</p>

<p>
  Por medio del presente, se le solicita de la manera más atenta presentarse en
  las instalaciones de este plantel educativo el día
  <strong>[FECHA_CITA]</strong> a las <strong>[HORA_CITA]</strong> horas.
</p>

<p>
  <strong>Motivo:</strong><br />
  [DESCRIPCION_MOTIVO] (Ej. Revisión de desempeño académico / Situación
  conductual / Firma de boleta)
</p>

<p>
  Se le ruega puntualidad. Agradecemos su compromiso con la educación de su
  hijo(a).
</p>

<div style="margin-top: 50px; text-align: center;">
  ATENTAMENTE<br /><br />
  _________________________________<br />
  <strong>[NOMBRE_SOLICITANTE]</strong><br />
  [CARGO_SOLICITANTE]
</div>

<div
  style="margin-top: 40px; border-top: 1px dashed black; padding-top: 10px; font-size: 0.8em;"
>
  <strong>ACUSE DE RECIBO</strong><br />
  Nombre y Firma del Tutor: _____________________________________ Fecha:
  ___________
</div>
```

---

## 2. Acta de Hechos (Incidencias)

**Uso:** Narrativa oficial de un suceso relevante (conflicto, accidente, falta grave).

```html
<!-- ENCABEZADO IGUAL AL ANTERIOR -->

<h3 style="text-align: center;">ACTA DE HECHOS</h3>

<p style="text-align: justify;">
  En la Ciudad de México, siendo las <strong>[HORA]</strong> horas del día
  <strong>[FECHA]</strong>, reunidos en el área de
  <strong>[LUGAR_ESCUELA]</strong> de la Escuela Secundaria Diurna No. 310, se
  hace constar los siguientes hechos relacionados con el alumno(a):
  <strong>[NOMBRE_ALUMNO]</strong> del grupo <strong>[GRUPO]</strong>.
</p>

<h4>NARRATIVA DE LOS HECHOS:</h4>
<p
  style="text-align: justify; border: 1px solid #ccc; padding: 10px; min-height: 100px;"
>
  [DESCRIPCION_DETALLADA_HECHOS]
  <!-- Ejemplo: El alumno fue sorprendido utilizando el dispositivo móvil en clase sin autorización, procediendo a agredir verbalmente al docente al solicitársele su entrega... -->
</p>

<h4>INTERVIENEN:</h4>
<ul>
  <li>Por la Escuela: [NOMBRE_AUTORIDAD] ([CARGO])</li>
  <li>Alumno(a): [NOMBRE_ALUMNO]</li>
  <li>Testigos (si aplica): [NOMBRES_TESTIGOS]</li>
</ul>

<h4>ACUERDOS / MEDIDAS PRECAUTORIAS:</h4>
<ol>
  <li>[MEDIDA_1] (Ej. Citatorio a padres para el día X)</li>
  <li>[MEDIDA_2] (Ej. Suspensión temporal de X actividad)</li>
</ol>

<p>
  No habiendo otro asunto que tratar, se cierra la presente acta a las
  <strong>[HORA_CIERRE]</strong> horas del mismo día, firmando al calce los que
  en ella intervinieron para constancia legal.
</p>

<!-- FIRMAS -->
<table style="width: 100%; margin-top: 50px; text-align: center;">
  <tr>
    <td>__________________________<br />Firma Alumno(a)</td>
    <td>__________________________<br />Firma Autoridad Escolar</td>
  </tr>
  <tr>
    <td colspan="2">
      <br /><br />__________________________<br />Testigo (Opcional)
    </td>
  </tr>
</table>
```

---

## 3. Carta Compromiso de Conducta

**Uso:** Acuerdo firmado por padres y alumno tras acumulación de faltas o falta grave.

```html
<!-- ENCABEZADO IGUAL AL ANTERIOR -->

<h3 style="text-align: center;">CARTA COMPROMISO DE CONVIVENCIA ESCOLAR</h3>

<p style="text-align: justify;">
  Por medio de la presente, yo <strong>[NOMBRE_TUTOR]</strong>, padre/madre o
  tutor(a) del alumno(a) <strong>[NOMBRE_ALUMNO]</strong> inscrito en el grado y
  grupo <strong>[GRADO_GRUPO]</strong>, estoy enterado(a) de la situación
  conductual de mi hijo(a) consistente en:
</p>

<p style="background-color: #f0f0f0; padding: 10px;">
  <strong>Falta al Marco para la Convivencia Escolar:</strong><br />
  [DESCRIPCION_FALTA]
</p>

<p>
  Derivado de lo anterior, y con el objetivo de favorecer su formación integral,
  <strong>NOS COMPROMETEMOS</strong> a:
</p>

<ol>
  <li>
    Respetar y cumplir cabalmente el Marco para la Convivencia Escolar de la
    AEFCM.
  </li>
  <li>Vigilar el cumplimiento de tareas y asistencia puntual a clases.</li>
  <li>Mantener comunicación constante con Trabajo Social y Prefectura.</li>
  <li>[COMPROMISO_ESPECIFICO] (Ej. Asistir a terapias externas si aplica).</li>
</ol>

<p style="text-align: justify;">
  Estamos conscientes de que el incumplimiento de estos compromisos derivará en
  las acciones disciplinarias correspondientes marcadas por la normativa
  vigente, que pueden incluir el cambio de ambiente escolar si la integridad de
  la comunidad educativa se ve afectada.
</p>

<div style="text-align: center; margin-top: 60px;">
  <div style="display: inline-block; width: 45%;">
    _________________________________<br />
    <strong>[NOMBRE_TUTOR]</strong><br />
    PADRE O TUTOR
  </div>
  <div style="display: inline-block; width: 45%;">
    _________________________________<br />
    <strong>[NOMBRE_ALUMNO]</strong><br />
    ALUMNO(A)
  </div>
</div>

<div style="text-align: center; margin-top: 40px;">
  _________________________________<br />
  <strong>DIRECCIÓN DEL PLANTEL</strong><br />
  Vo. Bo.
</div>
```
