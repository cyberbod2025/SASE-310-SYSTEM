import { AIRequest, AIResponse } from "./types";
import { SECURITY_GUARDS } from "./guards";
import { routeAI } from "./aiRouter";

export class AIClient {
  private static instance: AIClient;
  public enabled = true;

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
      return {
        taskId: request.taskId,
        status: "error",
        content: "El núcleo de IA está deshabilitado.",
        metadata: { tokens: 0, latency: 0 },
      };
    }

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
      const response = await routeAI(request.prompt, request.model, {
        contextType: "asistente_institucional",
        purpose: "Atender una consulta institucional asistida y no decisoria",
      });
      const latency = Date.now() - startTime;

      return {
        taskId: request.taskId,
        status: "success",
        content: response.text,
        metadata: {
          tokens: response.tokens || 0,
          latency,
        },
      };
    } catch {
      if (import.meta.env.DEV) {
        console.warn("Error en IA-SASE");
      }
      return {
        taskId: request.taskId,
        status: "error",
        content: "No se pudo obtener un borrador institucional.",
        metadata: { tokens: 0, latency: 0 },
      };
    }
  }
}
