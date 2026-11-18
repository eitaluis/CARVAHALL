import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const baseURL = "http://127.0.0.1:4173";
const saveCanvas = async (page, path) => {
  const dataUrl = await page.locator("canvas.webgl").evaluate(canvas => canvas.toDataURL("image/png"));
  const encoded = dataUrl.split(",")[1];
  if (!encoded) throw new Error("O canvas não retornou uma imagem PNG.");
  await writeFile(path, Buffer.from(encoded, "base64"));
};
const server = spawn(
  "python3",
  ["-m", "http.server", "4173", "--bind", "127.0.0.1"],
  { stdio: "ignore" }
);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;

try {
  await mkdir("artifacts", { recursive: true });
  await sleep(900);

  browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader"
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1
  });

  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const response = await page.goto(baseURL + "?qa=1", {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });
  if (!response || !response.ok()) {
    throw new Error("A página local não respondeu corretamente.");
  }

  await page.waitForFunction(() => window.CARVAHALL_READY === true, {
    timeout: 60000
  });
  await page.waitForFunction(() => window.CARVAHALL_RENDERED_FRAMES >= 3, {
    timeout: 30000
  });

  const initial = await page.evaluate(() => ({
    ready: window.CARVAHALL_READY,
    loadedModules: window.CARVAHALL_LOADED_MODULES || [],
    frames: window.CARVAHALL_RENDERED_FRAMES || 0,
    stats: window.CARVAHALL_RENDER_STATS || null,
    runtimeErrors: window.CARVAHALL_RUNTIME_ERRORS || [],
    marketVisible: window.CARVAHALL_MARKET_VISIBLE,
    canvas: (() => {
      const element = document.querySelector("canvas.webgl");
      return element ? { width: element.width, height: element.height } : null;
    })()
  }));

  if (initial.loadedModules.length !== 9) {
    throw new Error("Nem todos os nove módulos foram carregados: " + initial.loadedModules.length);
  }
  if (!initial.canvas || initial.canvas.width < 100 || initial.canvas.height < 100) {
    throw new Error("Canvas WebGL ausente ou sem dimensões válidas.");
  }
  if (!initial.stats || initial.stats.drawCalls < 1 || initial.stats.triangles < 1) {
    throw new Error("O loop executou, mas não há geometria 3D reportada no frame.");
  }
  if (initial.runtimeErrors.length || pageErrors.length) {
    throw new Error("Erros de execução: " + JSON.stringify({
      runtimeErrors: initial.runtimeErrors,
      pageErrors
    }));
  }

  // Captura da cena-base, sem o cartão inicial.
  await page.locator("#start").evaluate(element => {
    element.style.display = "none";
  });
  await sleep(1200);
  await saveCanvas(page, "artifacts/carvahall-evening.png");

  // Ativa a feira e avança os pontos até a área do acampamento.
  await page.keyboard.press("t");
  await page.waitForFunction(() => window.CARVAHALL_MARKET_VISIBLE === true, {
    timeout: 5000
  });
  for (let i = 0; i < 4; i++) await page.keyboard.press("m");
  await sleep(1600);
  await saveCanvas(page, "artifacts/carvahall-winter-market.png");

  const finalState = await page.evaluate(() => ({
    marketVisible: window.CARVAHALL_MARKET_VISIBLE,
    frames: window.CARVAHALL_RENDERED_FRAMES,
    stats: window.CARVAHALL_RENDER_STATS
  }));

  if (pageErrors.length) {
    throw new Error("Erros de página: " + JSON.stringify(pageErrors));
  }

  console.log(JSON.stringify({
    result: "PASS",
    initial,
    finalState,
    consoleErrors
  }, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
