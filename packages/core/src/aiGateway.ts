import { GoogleGenAI } from "@google/genai";
import type { AIExecutionRequest, AIExecutionResponse, SkillExecutionOptions } from "./types";

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /429|resource_exhausted|quota exceeded/i.test(message);
}

function uniqueModels(preferredModel: string): string[] {
  const candidates = [preferredModel, "gemini-2.5-flash"];
  const seen = new Set<string>();
  return candidates.filter((model) => {
    if (!model || seen.has(model)) {
      return false;
    }
    seen.add(model);
    return true;
  });
}

function buildMockResponse(request: AIExecutionRequest): string {
  if (request.outputFormat === "json" && request.task === "architecture") {
    return JSON.stringify(
      [
        {
          id: "cap-1",
          title: "1. SÍNTESE DA DEMANDA",
          sectionType: "resumo",
          order: 1,
          content: "Síntese dos fatos e dos pedidos formulados pela parte autora.",
        },
      ],
      null,
      2,
    );
  }

  return "Resposta gerada em modo controlado para manter o fluxo testavel sem dependencias externas.";
}

export class AIGateway {
  async execute(request: AIExecutionRequest, options: SkillExecutionOptions): Promise<AIExecutionResponse> {
    if (options.mode !== "real" || !process.env.GEMINI_API_KEY || request.provider !== "gemini") {
      return {
        provider: request.provider,
        model: "mock-gateway",
        text: buildMockResponse(request),
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-pro";
    const models = uniqueModels(configuredModel);

    let lastError: unknown;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${request.prompt.system}\n\n${request.prompt.user}`,
          config: request.outputFormat === "json" ? { responseMimeType: "application/json" } : undefined,
        });

        return {
          provider: request.provider,
          model,
          text: response.text ?? "",
        };
      } catch (error) {
        lastError = error;
        if (!isQuotaError(error)) {
          break;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Falha desconhecida no gateway Gemini"));

  }
}
