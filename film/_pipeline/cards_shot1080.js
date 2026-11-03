#!/usr/bin/node
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9238;
function getJson(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => {
      let b = ""; r.on("data", (c) => (b += c));
      r.on("end", () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const { res, rej } = this.pending.get(m.id);
        this.pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } }); }
  send(method, params = {}) { const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params })); }); }
}
(async () => {
  const chrome = execFile("/usr/bin/google-chrome", ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + __dirname + "/chrome-cards", "--window-size=1920,1080", "--hide-scrollbars", "--no-first-run", "about:blank"]);
  let wsUrl = null;
  for (let i = 0; i < 40 && !wsUrl; i++) { await sleep(250);
    try { const l = await getJson("/json/list"); const p = l.find((t) => t.type === "page"); if (p) wsUrl = p.webSocketDebuggerUrl; } catch {} }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: "file://" + __dirname + "/cards1080.html" });
  await sleep(2200);
  const n = (await cdp.send("Runtime.evaluate", { expression: "document.querySelectorAll('.card').length", returnByValue: true })).result.value;
  for (let i = 1; i <= n; i++) {
    await cdp.send("Runtime.evaluate", { expression: `document.getElementById('c${i}').scrollIntoView({block:'center'})` });
    await sleep(350);
    const s = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(__dirname + `/card1080-${i}.png`, Buffer.from(s.data, "base64"));
    console.log("card" + i, "saved");
  }
  chrome.kill(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
