import { GoogleGenAI } from "@google/genai";
import type { CasePayload, OutlineItemPayload, SkillExecutionOptions } from "./types";

function buildDefaultArchitecture(caseData: CasePayload): OutlineItemPayload[] {
  const now = new Date().toLocaleDateString("pt-BR");
  return [
    {
      id: "cap-1",
      title: "1. SÍNTESE DA DEMANDA",
      sectionType: "resumo",
      order: 1,
      content: `A presente contestacao responde aos pedidos formulados por ${caseData.plaintiff} em face de ${caseData.defendant}, no processo ${caseData.number}.`,
    },
    {
      id: "cap-2",
      title: "2. PRELIMINARES E QUESTOES PROCESSUAIS",
      sectionType: "preliminares",
      order: 2,
      content: "Analise das preliminares aplicaveis conforme os documentos e as regras processuais pertinentes.",
    },
    {
      id: "cap-3",
      title: "3. MERITO - FUNDAMENTACAO DA DEFESA",
      sectionType: "merito",
      order: 3,
      content: "Desenvolvimento dos argumentos de merito com base nas fontes validadas do caso.",
    },
    {
      id: "cap-4",
      title: "4. PEDIDOS FINAIS",
      sectionType: "requerimentos",
      order: 4,
      content: `Diante do exposto, requer-se a improcedencia dos pedidos autorais. Local e data: ${now}.`,
    },
  ];
}

export async function generateArchitecture(caseData: CasePayload, options: SkillExecutionOptions): Promise<OutlineItemPayload[]> {
  if (options.mode === "real" && process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Gere um JSON array com capitulos para uma contestacao juridica. Caso: ${JSON.stringify(caseData)}.`,
      config: { responseMimeType: "application/json" },
    });

    try {
      const parsed = JSON.parse(response.text ?? "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, index: number) => ({
          id: String(item.id ?? `cap-${index + 1}`),
          title: String(item.title ?? `Capitulo ${index + 1}`),
          sectionType: String(item.sectionType ?? "merito"),
          order: Number(item.order ?? index + 1),
          content: String(item.content ?? ""),
        }));
      }
    } catch {
      // fallback
    }
  }

  return buildDefaultArchitecture(caseData);
}

export async function draftChapter(
  caseData: CasePayload,
  chapter: OutlineItemPayload,
  options: SkillExecutionOptions,
): Promise<string> {
  if (options.mode === "real" && process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Redija o capitulo juridico com estilo formal brasileiro para a contestacao. Caso: ${JSON.stringify(
        caseData,
      )}. Capitulo: ${JSON.stringify(chapter)}.`,
    });
    if (response.text && response.text.trim().length > 20) {
      return response.text.trim();
    }
  }

  return `${chapter.title}\n\nConsiderando os elementos do caso ${caseData.number}, apresenta-se fundamentacao defensiva estruturada para o capitulo "${chapter.title}". Este texto integra o MVP e deve ser validado por revisao humana.`;
}
