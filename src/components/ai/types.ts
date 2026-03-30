export interface AIRequest {
  taskId: string;
  role: string;
  context: Record<string, any>;
  prompt: string;
  model?: "gpt-4o" | "gpt-3.5-turbo";
}

export interface AIResponse {
  taskId: string;
  status: "success" | "error" | "filtered";
  content: string;
  metadata?: {
    tokens?: number;
    latency?: number;
    riskScore?: number;
  };
}

export interface AIGuardRule {
  id: string;
  description: string;
  check: (prompt: string, context: any) => boolean;
  errorMessage: string;
}

export type AIPromptTemplate = (context: any) => string;
