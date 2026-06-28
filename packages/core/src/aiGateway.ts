import { GoogleGenAI } from "@google/genai";
import type { AIExecutionRequest, AIExecutionResponse, SkillExecutionOptions } from "./types";

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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `${request.prompt.system}\n\n${request.prompt.user}`,
      config: request.outputFormat === "json" ? { responseMimeType: "application/json" } : undefined,
    });

    return {
      provider: request.provider,
      model: "gemini-2.5-pro",
      text: response.text ?? "",
    };
  }
}
