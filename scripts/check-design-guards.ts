import {
  checkFile,
  type FileResult,
  findFiles,
  printErrors,
} from "./design-guards";

async function main() {
  const projectRoot = process.cwd();
  const files = await findFiles(projectRoot);

  const results: FileResult[] = [];
  for (const file of files) {
    const result = await checkFile(file);
    if (result) {
      results.push(result);
    }
  }

  const invalidFiles = results.filter((r) => !r.valid);

  if (invalidFiles.length > 0) {
    printErrors(invalidFiles, projectRoot);
    process.exit(1);
  }

  console.log(
    `✅ All ${results.length} file(s) have valid design guards with complete properties.`
  );
}

main().catch((err) => {
  if (!(err instanceof Error)) {
    throw err;
  }
  console.error("Error:", err);
  process.exit(1);
});
