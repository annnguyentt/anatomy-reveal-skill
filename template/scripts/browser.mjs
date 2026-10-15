import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const env = process.env;
const CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/usr/bin/microsoft-edge",
  ],
  win32: [
    `${env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    `${env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    `${env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ],
};
export function chromePath() {
  const path =
    env.CHROME_PATH ||
    (CANDIDATES[process.platform] ?? []).find((p) => p && !p.startsWith("undefined") && existsSync(p));
  if (!path) throw new Error("No Chrome, Chromium or Edge found. Set CHROME_PATH to the browser executable.");
  return path;
}
export function launch() {
  const args = ["--enable-gpu", "--force-color-profile=srgb"];
  if (process.platform === "darwin") args.push("--use-angle=metal");
  if (process.platform === "linux") args.push("--no-sandbox");
  return puppeteer.launch({ executablePath: chromePath(), headless: true, args });
}
