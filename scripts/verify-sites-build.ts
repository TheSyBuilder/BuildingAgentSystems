import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const workerPath = resolve(projectRoot, "dist", "server", "index.js");
const hostingPath = resolve(projectRoot, ".openai", "hosting.json");

await access(workerPath);
const hosting = JSON.parse(await readFile(hostingPath, "utf8")) as {
  project_id?: unknown;
};
if (typeof hosting.project_id !== "string") {
  throw new TypeError("hosting.json must contain a string project_id");
}
assert.ok(hosting.project_id.length > 0);

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("audit", `${process.pid}-${Date.now()}`);
const { default: worker } = (await import(workerUrl.href)) as {
  default: {
    fetch(
      request: Request,
      environment: {
        ASSETS: { fetch(request: Request): Promise<Response> };
      },
    ): Promise<Response>;
  };
};

for (const pathname of ["/", "/labs/agent-loop/"]) {
  const request = new Request(`https://building-agent-systems.test${pathname}`);
  let delegatedUrl = "";
  const response = await worker.fetch(request, {
    ASSETS: {
      fetch: async (assetRequest) => {
        delegatedUrl = assetRequest.url;
        return new Response(`asset:${pathname}`, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  });

  assert.equal(delegatedUrl, request.url);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), `asset:${pathname}`);
}

console.log(
  "Sites build contract: hosting metadata present; / and /labs/agent-loop/ delegate to ASSETS",
);
