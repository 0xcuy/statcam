#!/usr/bin/node
// take_tour.js — ONE 1080p scripted tour covering every segment the film needs:
// hero, fullscreen tracking, soccer demo (staged think + results), KPI bars,
// basketball demo (real SAM re-bake), moments, chat, plan. Real pixels only.
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9236;

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
  const chrome = execFile("/usr/bin/google-chrome", [
    "--headless=new", "--remote-debugging-port=" + PORT,
    "--user-data-dir=" + __dirname + "/chrome-tour",
    "--window-size=1920,1080", "--hide-scrollbars", "--no-first-run",
    "--autoplay-policy=no-user-gesture-required", "--mute-audio",
    "about:blank",
  ]);
  let wsUrl = null;
  for (let i = 0; i < 40 && !wsUrl; i++) { await sleep(250);
    try { const l = await getJson("/json/list"); const p = l.find((t) => t.type === "page"); if (p) wsUrl = p.webSocketDebuggerUrl; } catch {} }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const FPS = 30, t0 = Date.now();
  let last = -1, count = 0; const index = [];
  cdp.send("Page.screencastFrameAck", { sessionId: 0 }).catch(() => {});
  (await cdp.send("Runtime.evaluate", { expression: "1" })).result.value;
  // ack handler comes with frames — attach via polling loop instead:
  const frames = [];
  cdp.ws.addEventListener("message", async (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === "Page.screencastFrame") {
      try { await cdp.send("Page.screencastFrameAck", { sessionId: m.params.sessionId }); } catch {}
      const slot = Math.floor((Date.now() - t0) / 1000 * FPS);
      if (slot <= last) return;
      last = slot;
      const name = `f${String(count).padStart(5, "0")}.jpg`;
      fs.writeFileSync(`${__dirname}/frames/${name}`, Buffer.from(m.params.data, "base64"));
      index.push({ file: name, t: +(slot / FPS).toFixed(3) });
      count++;
    }
  });
  const evalJs = async (expr) => (await cdp.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
  const shot = (ms) => sleep(ms);
  const tap = async (expr) => {
    const r = await evalJs(expr);
    if (r && r.x !== undefined) {
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: Math.round(r.x), y: Math.round(r.y), button: "left", clickCount: 1 });
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: Math.round(r.x), y: Math.round(r.y), button: "left", clickCount: 1 });
    }
    return r;
  };
  const findBtn = (needle) => `(() => { const b=[...document.querySelectorAll('button')].find(b=>b.textContent.toLowerCase().includes(${JSON.stringify(needle)})); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; })()`;

  await cdp.send("Page.navigate", { url: "https://statcam.sieralabs.com/" });
  await sleep(5500);

  // hero (5.5 s)
  await evalJs("window.scrollTo(0,0)"); await shot(5500);

  // fullscreen tracking (14 s) — real tap on the ⛶ button
  await tap("(() => { const b=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').toLowerCase().includes('fullscreen') || b.textContent.trim()==='\\u26F6'); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; })()");
  await shot(14000);
  await evalJs("document.exitFullscreen && document.exitFullscreen()");
  await shot(800);

  // sample tab -> Demo soccer (results land ~14 s in) (16 s)
  await evalJs("document.getElementById('analyze').scrollIntoView({block:'center'})"); await shot(900);
  await evalJs("document.querySelectorAll('[role=tab]')[2].click()"); await shot(700);
  await tap(findBtn("demo soccer"));
  await shot(16000);

  // KPI bars + analyst (6 s)
  await evalJs("document.getElementById('results').scrollIntoView({block:'start'})");
  await evalJs("window.scrollBy(0,430)"); await shot(6000);

  // back to tabs -> Demo basketball (16 s)
  await evalJs("document.getElementById('analyze').scrollIntoView({block:'center'})"); await shot(900);
  await tap(findBtn("demo basketball"));
  await shot(16000);

  // moments (6.5 s)
  await evalJs("document.getElementById('momres').scrollIntoView({block:'center'})");
  await tap(findBtn("search moments"));
  await shot(2500);
  await evalJs("document.getElementById('momres').scrollIntoView({block:'center'})"); await shot(4000);

  // chat (8.5 s)
  await evalJs("document.getElementById('chat').scrollIntoView({block:'center'})"); await shot(1500);
  await evalJs("document.querySelector('#chat-suggest button')?.click()"); await shot(6500);
  await evalJs("document.getElementById('chat').scrollIntoView({block:'center'})"); await shot(500);

  // plan (7 s)
  await evalJs("document.getElementById('planres').scrollIntoView({block:'center'})");
  await tap(findBtn("training plan"));
  await shot(2500);
  await evalJs("document.getElementById('planres').scrollIntoView({block:'center'})"); await shot(4500);

  await cdp.send("Page.stopScreencast");
  fs.writeFileSync(`${__dirname}/frames/index.json`, JSON.stringify(index));
  console.log("frames:", count, "span_s:", ((Date.now() - t0) / 1000).toFixed(1));
  chrome.kill(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
