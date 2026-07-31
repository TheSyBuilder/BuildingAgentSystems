import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const buildPath = resolve(projectRoot, "dist");
const clientPath = resolve(buildPath, "client");
const sourcePath = resolve(projectRoot, "src", "sites-worker.ts");
const outputPath = resolve(buildPath, "server", "index.js");

await rm(clientPath, { recursive: true, force: true });
await mkdir(clientPath, { recursive: true });

for (const entry of await readdir(buildPath, { withFileTypes: true })) {
  if (["client", "server", ".openai"].includes(entry.name)) {
    continue;
  }

  await cp(resolve(buildPath, entry.name), resolve(clientPath, entry.name), {
    recursive: entry.isDirectory(),
  });
}

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
console.log(`Sites assets: ${clientPath}`);
