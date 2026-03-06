import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIRequest, AIResponse } from "./types";
import { SECURITY_GUARDS } from "./guards";

export class AIClient {
  private static instance: AIClient;
  public enabled: boolean = true; // Enabled by default now that we have a key
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
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
    if (!this.genAI || !this.enabled) {
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
      const model = this.genAI.getGenerativeModel({
        model:
          request.model === "gpt-4o"
            ? "gemini-pro-latest"
            : "gemini-flash-latest",
      });

      // Construcción del contexto para el prompt
      const contextPrompt = `Contexto del Sistema Escolar (SASE):\nRol: ${request.role}\n${JSON.stringify(request.context)}\n\nUsuario solicita: ${request.prompt}`;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();
      const latency = Date.now() - startTime;

      return {
        taskId: request.taskId,
        status: "success",
        content: text,
        metadata: {
          tokens: response.usageMetadata?.totalTokenCount || 0,
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
