// Check the published files against this build, including their response types.
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const dist = new URL("../dist/", import.meta.url);

function setting(name, fallback, minimum) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum)
    throw new Error(`${name} must be an integer of at least ${minimum}.`);
  return value;
}

async function request(url, contentType) {
  const target = new URL(url);
  target.searchParams.set("deployment-check", `${Date.now()}-${Math.random()}`);
  const response = await fetch(target, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (response.status !== 200)
    throw new Error(`${url} returned HTTP ${response.status}.`);
  const actualType = response.headers.get("content-type") ?? "missing";
  if (!contentType.test(actualType))
    throw new Error(`${url} returned unexpected Content-Type: ${actualType}.`);
  return { url: response.url, bytes: Buffer.from(await response.arrayBuffer()) };
}

function assets(html) {
  const result = [];
  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const attribute = (name) =>
      new RegExp(`\\b${name}=["']([^"']+)["']`, "i").exec(tag)?.[1];
    if (match[1].toLowerCase() === "script" && attribute("type") === "module")
      result.push({ reference: attribute("src"), type: /^(?:text|application)\/javascript(?:;|$)/i, extension: ".js" });
    if (match[1].toLowerCase() === "link" && attribute("rel") === "stylesheet")
      result.push({ reference: attribute("href"), type: /^text\/css(?:;|$)/i, extension: ".css" });
  }
  if (!result.some((asset) => asset.extension === ".js") ||
      !result.some((asset) => asset.extension === ".css"))
    throw new Error("The local build must contain a compiled JavaScript module and stylesheet.");
  return result.map((asset) => {
    const url = new URL(asset.reference ?? "", "https://build.invalid/");
    if (!asset.reference || url.origin !== "https://build.invalid" ||
        !url.pathname.endsWith(asset.extension))
      throw new Error(`Expected a local compiled asset, received ${asset.reference}.`);
    return { ...asset, local: new URL(`.${url.pathname}`, dist) };
  });
}

try {
  if (process.argv.length !== 3)
    throw new Error("Usage: node scripts/verify-deployment.mjs <deployed-url>");
  const deployed = new URL(process.argv[2]);
  if (!["http:", "https:"].includes(deployed.protocol))
    throw new Error("The deployed URL must use HTTP or HTTPS.");
  const attempts = setting("DEPLOY_VERIFY_ATTEMPTS", 6, 1);
  const delayMs = setting("DEPLOY_VERIFY_DELAY_MS", 10000, 0);
  const expected = await readFile(new URL("index.html", dist));
  const expectedAssets = assets(expected.toString("utf8"));
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const live = await request(deployed, /^text\/html(?:;|$)/i);
      const html = live.bytes.toString("utf8");
      if (html.includes("%BASE_URL%") || /\bsrc=["'][^"']*(?:\/src\/|\.tsx?(?:[?#]|["']))/i.test(html))
        throw new Error("The live page serves unbuilt source. Set GitHub Pages Source to GitHub Actions.");
      if (!live.bytes.equals(expected))
        throw new Error("The live HTML does not match dist/index.html from this build.");
      await Promise.all(expectedAssets.map(async (asset) => {
        const url = new URL(asset.reference, live.url);
        const [published, local] = await Promise.all([
          request(url, asset.type), readFile(asset.local),
        ]);
        if (!published.bytes.equals(local))
          throw new Error(`${url} does not match the compiled local asset.`);
      }));
      console.log(`Deployment verified: ${deployed} (HTML and ${expectedAssets.length} compiled assets match).`);
      break;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.warn(`Deployment check ${attempt}/${attempts}: ${error.message} Retrying in ${delayMs}ms.`);
      await delay(delayMs);
    }
  }
} catch (error) {
  console.error(`Deployment verification failed: ${error.message}`);
  process.exitCode = 1;
}
