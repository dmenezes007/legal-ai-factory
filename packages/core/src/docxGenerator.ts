import path from "node:path";
import { promises as fs } from "node:fs";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import type { CasePayload, OutlineItemPayload } from "./types";

function toParagraphs(text: string): Paragraph[] {
  const chunks = text.split(/\n{2,}/g).map((c) => c.trim()).filter(Boolean);
  return chunks.map(
    (chunk) =>
      new Paragraph({
        children: [new TextRun({ text: chunk, size: 24, font: "Times New Roman" })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 200 },
        indent: { firstLine: 720 },
      }),
  );
}

export async function generateLegalDocx(params: {
  caseData: CasePayload;
  outline: OutlineItemPayload[];
  outputDir: string;
  simulatedData: boolean;
}): Promise<{ filePath: string; fileName: string }> {
  await fs.mkdir(params.outputDir, { recursive: true });

  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: `AO JUÍZO DA ${params.caseData.court.toUpperCase()}`, bold: true, size: 24, font: "Times New Roman" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
    }),
  );

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: `PROCESSO Nº ${params.caseData.number}`, bold: true, size: 24, font: "Times New Roman" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
    }),
  );

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "CONTESTAÇÃO", bold: true, size: 28, font: "Times New Roman" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  );

  if (params.simulatedData) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "AVISO: Documento gerado com base parcial ou total em dados simulados para demonstração do MVP.", bold: true, size: 22, font: "Times New Roman" })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),
    );
  }

  for (const chapter of [...params.outline].sort((a, b) => a.order - b.order)) {
    sections.push(
      new Paragraph({
        text: chapter.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
      }),
    );

    sections.push(...toParagraphs(chapter.content || "(Capitulo sem conteudo.)"));
  }

  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { font: "Times New Roman", size: 24, bold: true },
        },
        heading2: {
          run: { font: "Times New Roman", size: 24, bold: true },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.JUSTIFIED },
        },
        document: {
          run: { font: "Times New Roman", size: 24 },
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.18),
              bottom: convertInchesToTwip(1.18),
              left: convertInchesToTwip(1.18),
              right: convertInchesToTwip(1.18),
            },
          },
        },
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const safeCaseId = params.caseData.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `contestacao_${safeCaseId}.docx`;
  const filePath = path.join(params.outputDir, fileName);
  await fs.writeFile(filePath, buffer);

  return { filePath, fileName };
}
