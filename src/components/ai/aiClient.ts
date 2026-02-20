import { AIRequest, AIResponse } from "./types";
import { SECURITY_GUARDS } from "./guards";

// Simulación de latencia
const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class AIClient {
  private static instance: AIClient;
  public enabled: boolean = false; // Feature Flag

  private constructor() {}

  public static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  public enable() {
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }

  public async processRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.enabled) {
      // Retorna una respuesta "Draft Mode" simulada si está deshabilitado
      // Para efectos del piloto, siempre devolvemos algo, pero marcado como simulado.
      await simulateDelay(1500);
      return {
        taskId: request.taskId,
        status: "success",
        content: `[MODO_BORRADOR] Respuesta simulada para rol ${
          request.role
        }.\nPrompt: "${request.prompt.substring(
          0,
          50
        )}..."\n\n(La IA Generativa está en pausa administrativa. Active el Feature Flag para conectar.)`,
        metadata: { tokens: 0, latency: 0, riskScore: 0 },
      };
    }

    // 1. Guardrails
    for (const guard of SECURITY_GUARDS) {
      if (!guard.check(request.prompt, request.context)) {
        return {
          taskId: request.taskId,
          status: "filtered",
          content: guard.errorMessage,
        };
      }
    }

    // 2. Simulación de llamada a LLM Real (Aquí iría fetch a OpenAI/Anthropic)
    await simulateDelay(2000);

    return {
      taskId: request.taskId,
      status: "success",
      content: `[IA_GENERATIVA] Análisis completado para ${request.role}.\n\nBasado en el contexto proporcionado, se sugiere:\n1. Revisar los indicadores de riesgo.\n2. Agendar sesión de seguimiento.\n3. Documentar en bitácora oficial.`,
      metadata: { tokens: 150, latency: 2000, riskScore: 0.1 },
    };
  }
}
