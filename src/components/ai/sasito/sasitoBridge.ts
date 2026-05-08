import { AppModule } from "../../../types";
import { buildSasitoContext } from "./sasitoContextProvider";
import { detectSasitoIntent } from "./sasitoIntentEngine";
import { resolveSasitoAction } from "./sasitoActionCatalog";
import type { SasitoActionDefinition, SasitoIntentResult } from "./types";

type SasitoBridgeEnv = {
  VITE_ENABLE_SASITO_L3?: string | boolean;
};

type SasitoBridgeInput = Parameters<typeof buildSasitoContext>[0] & {
  text: string;
  env?: SasitoBridgeEnv;
};

type SasitoBridgeState = "calm" | "attention" | "alert";

export interface SasitoBridgeResponse {
  handled: boolean;
  safeMode: true;
  didExecuteAction: false;
  text: string;
  state: SasitoBridgeState;
  actionLabel: string;
  intent: SasitoIntentResult;
  action: SasitoActionDefinition;
  debug: {
    intent: SasitoIntentResult["intent"];
    confidence: number;
    executionType: SasitoActionDefinition["executionType"];
    actionId: string;
    moduleTarget?: AppModule;
  };
}

export function isSasitoL3Enabled(env?: SasitoBridgeEnv): boolean {
  const value = env?.VITE_ENABLE_SASITO_L3 ?? import.meta.env.VITE_ENABLE_SASITO_L3;
  return value === true || value === "true";
}

const getAllowedActionText = (action: SasitoActionDefinition): string => {
  switch (action.executionType) {
    case "open_modal":
      return `Puedo ayudarte a ${action.label}. En esta fase segura no abrire modales automaticamente.`;
    case "navigate":
      return `Puedo ayudarte a ${action.label}. En esta fase segura no navegare automaticamente.`;
    case "show_card":
      return `Puedo ayudarte a ${action.label}. En esta fase segura solo te doy la guia textual.`;
    case "suggest_only":
      if (action.intent === "explain_next_step") {
        return action.safetyMessage;
      }
      return `Sugerencia segura: ${action.label}.`;
    case "deny":
      return action.safetyMessage;
    default:
      return "Tengo una sugerencia segura, pero no ejecutare acciones automaticamente.";
  }
};

const getResponseState = (action: SasitoActionDefinition): SasitoBridgeState => {
  if (action.executionType === "deny") return "alert";
  if (action.executionType === "suggest_only" || action.requiresConfirmation) return "attention";
  return "calm";
};

export function createSasitoBridgeResponse(input: SasitoBridgeInput): SasitoBridgeResponse {
  const context = buildSasitoContext(input);
  const intent = detectSasitoIntent({ text: input.text, context });
  const action = resolveSasitoAction(intent, context);
  const handled = intent.intent !== "unknown";

  return {
    handled,
    safeMode: true,
    didExecuteAction: false,
    text: getAllowedActionText(action),
    state: getResponseState(action),
    actionLabel: "ENTENDIDO",
    intent,
    action,
    debug: {
      intent: intent.intent,
      confidence: intent.confidence,
      executionType: action.executionType,
      actionId: action.id,
      moduleTarget: action.moduleTarget,
    },
  };
}

export function trySasitoL3Bridge(input: SasitoBridgeInput): SasitoBridgeResponse | null {
  if (!isSasitoL3Enabled(input.env)) return null;

  return createSasitoBridgeResponse(input);
}
