export interface NotebookLmExportJob {
  notebookName: string;
  destinationDir: string;
}

export async function runExperimentalNotebookLmExport(_job: NotebookLmExportJob): Promise<void> {
  throw new Error(
    "Modulo experimental: implementar somente quando houver aprovacao explicita de seguranca e termos de uso.",
  );
}
