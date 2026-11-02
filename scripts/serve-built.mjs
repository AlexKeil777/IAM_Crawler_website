// Serve the exact production files at both URL depths, with real 404s.
// This deliberately avoids Vite's source transforms and SPA fallback.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, isAbsolute, extname } from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const projectPath = "/IAM_Crawler_website";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".csv": "text/csv; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === projectPath) {
      response.writeHead(308, { Location: `${projectPath}/` }).end();
      return;
    }
    if (pathname.startsWith(`${projectPath}/`))
      pathname = pathname.slice(projectPath.length);
    const path = resolve(
      root,
      `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
    );
    const withinRoot = relative(root, path);
    if (
      withinRoot.startsWith("..") ||
      isAbsolute(withinRoot) ||
      !(await stat(path)).isFile()
    ) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1", () =>
  console.log("Built website: http://127.0.0.1:4173/IAM_Crawler_website/"),
);
