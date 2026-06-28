import path from "node:path";
import { ingestKnowledgeSources } from "../../../packages/core/src";

async function run(): Promise<void> {
  const root = process.cwd();
  const result = await ingestKnowledgeSources({
    sourceDir: path.join(root, "knowledge", "sources", "original"),
    processedDir: path.join(root, "knowledge", "sources", "processed"),
    metadataDir: path.join(root, "knowledge", "sources", "metadata"),
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
