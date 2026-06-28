import { expect, test } from '@playwright/test';

test.describe('Online First Legal Production', () => {
  test('executes the 7-step wizard and exports DOCX', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const openNewProcess = page.getByRole('button', { name: /Novo Processo|Cadastrar Novo Processo/i });
    if ((await openNewProcess.count()) > 0) {
      await openNewProcess.first().click();
    }

    const prefillButton = page.getByRole('button', { name: /Preencher Dados de Exemplo/i });
    if ((await prefillButton.count()) > 0 && (await prefillButton.first().isVisible())) {
      await prefillButton.first().click();
      await page.getByRole('button', { name: /Criar Caso|Sincronizar Fontes/i }).first().click();
    }

    const goSources = page.getByRole('button', { name: /1\. Fontes do Caso/i });
    if ((await goSources.count()) > 0) {
      await goSources.first().click();
    }

    const processSourcesButton = page.getByRole('button', { name: /Processar Fontes de IA/i });
    if ((await processSourcesButton.count()) > 0 && (await processSourcesButton.first().isVisible())) {
      await processSourcesButton.first().click();
    }

    const proceedProcessingButton = page.getByRole('button', { name: /Prosseguir para Processamento/i });
    if ((await proceedProcessingButton.count()) > 0) {
      await expect(proceedProcessingButton.first()).toBeVisible({ timeout: 120_000 });
      await proceedProcessingButton.first().click();
    } else {
      await page.getByRole('button', { name: /2\. Diagnóstico/i }).first().click();
    }

    const generateDiagnosticButton = page.getByRole('button', {
      name: /Gerar Diagnóstico por IA|Iniciar Diagnóstico de Inicial/i
    });
    if ((await generateDiagnosticButton.count()) > 0) {
      await generateDiagnosticButton.first().click();
    }

    const mapThesesButton = page.getByRole('button', { name: /Mapear Teses com IA/i });
    if ((await mapThesesButton.count()) > 0) {
      await expect(mapThesesButton.first()).toBeVisible({ timeout: 60_000 });
      await mapThesesButton.first().click();
    }

    const defineOutlineButton = page.getByRole('button', { name: /Definir Roteiro/i });
    if ((await defineOutlineButton.count()) > 0) {
      await expect(defineOutlineButton.first()).toBeVisible({ timeout: 60_000 });
      await defineOutlineButton.first().click();
    } else {
      await page.getByRole('button', { name: /4\. Roteiro \/ Arquitetura/i }).first().click();
    }

    const generateOutlineButton = page.getByRole('button', {
      name: /Gerar Roteiro Estruturado|Construir Capítulos Defensivos/i
    });
    if ((await generateOutlineButton.count()) > 0) {
      await generateOutlineButton.first().click();
    }

    const startDraftingButton = page.getByRole('button', { name: /Iniciar Redação/i });
    if ((await startDraftingButton.count()) > 0) {
      await expect(startDraftingButton.first()).toBeVisible({ timeout: 60_000 });
      await startDraftingButton.first().click();
    } else {
      await page.getByRole('button', { name: /5\. Redação da Peça/i }).first().click();
    }

    const draftMissingChaptersButton = page.getByRole('button', { name: /Redigir Capítulos Faltantes/i });
    if ((await draftMissingChaptersButton.count()) > 0 && (await draftMissingChaptersButton.first().isVisible())) {
      await draftMissingChaptersButton.first().click();
    }

    const proceedReviewButton = page.getByRole('button', {
      name: /Prosseguir para Revisão|Prosseguir para Exportação/i
    });
    if ((await proceedReviewButton.count()) > 0) {
      await expect(proceedReviewButton.first()).toBeEnabled({ timeout: 180_000 });
      await proceedReviewButton.first().click();
    } else {
      await page.getByRole('button', { name: /6\. Revisão & Exportar/i }).first().click();
    }

    const goExportButton = page.getByRole('button', { name: /Prosseguir para Exportação/i });
    if ((await goExportButton.count()) > 0 && (await goExportButton.first().isVisible())) {
      await goExportButton.first().click();
    }

    const docxButton = page.getByRole('button', { name: /Baixar Arquivo Word \(DOCX\)/i });
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 120_000 }),
      docxButton.click()
    ]);

    expect((await download.suggestedFilename()).toLowerCase()).toContain('.docx');
  });
});
