import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const sourcePath = resolve(projectRoot, "src", "sites-worker.ts");
const outputPath = resolve(projectRoot, "dist", "server", "index.js");

const source = await readFile(sourcePath, "utf8");
const { outputText, diagnostics } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: sourcePath,
  reportDiagnostics: true,
});

if (diagnostics?.some(({ category }) => category === ts.DiagnosticCategory.Error)) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => projectRoot,
      getNewLine: () => "\n",
    }),
  );
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, outputText);

console.log(`Sites worker: ${outputPath}`);
