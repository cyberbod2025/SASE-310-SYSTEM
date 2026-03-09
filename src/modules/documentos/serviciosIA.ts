async function callGeminiProxy(prompt: string, model: string): Promise<string> {
  const response = await fetch("/api/ai/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || response.statusText);
  }

  const data = await response.json();
  return (data?.text || "").trim();
}

/**
 * Servicio de mejora de redacción institucional con IA.
 * Toma el texto del docente y lo mejora manteniendo la objetividad
 * según el Marco para la Convivencia Escolar CDMX.
 */
export async function mejorarRedaccionInstitucional(
  textoOriginal: string,
): Promise<{ textoMejorado: string; cambiosRealizados: string[] }> {
  const prompt = `Eres el sistema IA-SASE de una escuela secundaria oficial en la Ciudad de México.
Tu tarea es MEJORAR la redacción del siguiente texto para hacerlo institucional y formal, 
manteniendo estricta adherencia al "Marco para la Convivencia Escolar en las Escuelas de Educación Básica del Distrito Federal".

REGLAS:
1. Mantén TODOS los hechos y datos tal cual — NO inventes información.
2. Reemplaza lenguaje coloquial o subjetivo por lenguaje técnico-pedagógico.
3. Reemplaza "castigo" por "acción formativa" o "medida disciplinaria formativa".
4. Reemplaza adjetivos calificativos (grosero, flojo, agresivo) por descripciones objetivas de conducta.
5. Usa tercera persona formal.
6. Estructura en párrafos claros con narración cronológica.
7. NO añadas encabezados, firmas ni formato — solo el cuerpo del texto mejorado.

Al final, lista los cambios principales en una línea separada con el formato:
CAMBIOS: [cambio1] | [cambio2] | [cambio3]

TEXTO ORIGINAL:
${textoOriginal}

TEXTO MEJORADO:`;

  try {
    const texto = await callGeminiProxy(prompt, "gemini-flash-latest");

    // Separar texto mejorado de la lista de cambios
    const partes = texto.split("CAMBIOS:");
    const textoMejorado = partes[0].trim();
    const cambiosStr = partes[1]?.trim() || "";
    const cambiosRealizados = cambiosStr
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    return { textoMejorado, cambiosRealizados };
  } catch (proxyError) {
    console.error("[MEJORAR_REDACCION] Error:", proxyError);
    return {
      textoMejorado: textoOriginal,
      cambiosRealizados: ["Error de conexión con IA — texto sin cambios."],
    };
  }
}

/**
 * Detecta incidencias previas de un alumno consultando Supabase.
 */
export async function detectarIncidenciasPrevias(
  supabase: any,
  alumnoId: string,
): Promise<{ cantidad: number; resumen: string[] }> {
  try {
    const { data, error } = await supabase
      .from("incidencias")
      .select("id, tipo, descripcion, fecha, estado")
      .eq("alumno_id", alumnoId)
      .order("fecha", { ascending: false })
      .limit(10);

    if (error || !data) {
      return { cantidad: 0, resumen: [] };
    }

    const resumen = data.map(
      (inc: any) =>
        `${inc.fecha || "S/F"} — ${inc.tipo || "Sin tipo"}: ${(inc.descripcion || "").substring(0, 60)}...`,
    );

    return { cantidad: data.length, resumen };
  } catch {
    return { cantidad: 0, resumen: [] };
  }
}

/**
 * Ejecuta una acción genérica de IA con un prompt dado.
 * Usado por los botones del editor ("Hacer formal", "Resumir").
 */
async function ejecutarAccionIA(
  prompt: string,
  textoOriginal: string,
): Promise<string> {
  try {
    return await callGeminiProxy(prompt, "gemini-flash-latest");
  } catch (proxyError) {
    console.error("[ACCION_IA] Error:", proxyError);
    return textoOriginal;
  }
}

/**
 * Hace un texto más formal e institucional.
 */
export async function hacerMasFormal(texto: string): Promise<string> {
  const { promptHacerFormal } = await import("./prompts");
  return ejecutarAccionIA(promptHacerFormal(texto), texto);
}

/**
 * Resume un texto manteniendo datos clave.
 */
export async function resumirTexto(texto: string): Promise<string> {
  const { promptResumir } = await import("./prompts");
  return ejecutarAccionIA(promptResumir(texto), texto);
}
