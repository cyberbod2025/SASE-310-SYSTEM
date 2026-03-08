import { AIRequest, AIResponse } from "./types";
import { SECURITY_GUARDS } from "./guards";
import { routeAI } from "./aiRouter";

export class AIClient {
  private static instance: AIClient;
  public enabled: boolean = true; // Enabled by default now that we have a key

  private constructor() {
    // Inicialización administrada en aiRouter.ts
  }

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
      return {
        taskId: request.taskId,
        status: "error",
        content: "El núcleo de IA no está configurado o está deshabilitado.",
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

    try {
      const startTime = Date.now();

      // Construcción del contexto para el prompt
      const contextPrompt = `Contexto del Sistema Escolar (SASE):\nRol: ${request.role}\n${JSON.stringify(request.context)}\n\nUsuario solicita: ${request.prompt}`;

      // Llamada al router centralizado en lugar de generación directa
      const response = await routeAI(contextPrompt, request.model);
      const latency = Date.now() - startTime;

      return {
        taskId: request.taskId,
        status: "success",
        content: response.text,
        metadata: {
          tokens: response.tokens || 0,
          latency,
          riskScore: 0.05,
        },
      };
    } catch (error: any) {
      console.error("Error en IA-SASE:", error);
      return {
        taskId: request.taskId,
        status: "error",
        content: `Error operativo en el Núcleo IA: ${error.message || "Desconocido"}`,
        metadata: { tokens: 0, latency: 0, riskScore: 1 },
      };
    }
  }
}
