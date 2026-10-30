/* StatCam Link Ingest widget (v6) — self-contained vanilla JS.
 * Paste-link analysis + live agent timeline + analyst reads + chat.
 * Injected below the dropzone; survives React re-renders via MutationObserver.
 * Event handlers live at document-capture level because the page stops event
 * descent (document-capture stopPropagation) — React's delegation does the same. */
(function () {
  "use strict";
  if (window.__stcli) return;
  var S = { phase: "idle", job: null, error: null, poll: null,
            chat: { log: [], busy: false } };

  var POLISH = ""
    + "html{scroll-behavior:smooth}"
    + "body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}"
    + "::selection{background:#0064E0;color:#fff}"
    + "::-webkit-scrollbar{width:10px;height:10px}"
    + "::-webkit-scrollbar-track{background:transparent}"
    + "::-webkit-scrollbar-thumb{background:rgba(100,110,125,.45);border-radius:999px;"
    + "border:2.5px solid transparent;background-clip:content-box}"
    + "::-webkit-scrollbar-thumb:hover{background:rgba(100,110,125,.7);border:2.5px solid transparent;background-clip:content-box}"
    + ":focus-visible{outline:2px solid #0064E0!important;outline-offset:2px;border-radius:4px}"
    + "button,a{transition-property:color,background-color,border-color,box-shadow,transform,filter,opacity;"
    + "transition-duration:.18s;transition-timing-function:cubic-bezier(.2,.7,.3,1)}"
    + "button:active{transform:scale(.98)}"
    + "h1[class]{letter-spacing:-.03em!important}"
    + "h2[class]{letter-spacing:-.02em!important}"
    + "body::after{content:'';position:fixed;inset:0 0 auto 0;height:320px;pointer-events:none;"
    + "background:radial-gradient(720px 320px at 50% -90px,rgba(0,100,224,.06),transparent 70%)}";

  var CSS = ""
    + ".stcli-card{margin:18px auto 0;max-width:1180px;background:#fff;border:1px solid #E4E6EB;"
    + "border-radius:22px;padding:20px 22px;box-shadow:0 12px 40px -20px rgba(0,0,0,.18);"
    + "font-family:-apple-system,system-ui,'Segoe UI',sans-serif;color:#050505}"
    + ".stcli-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}"
    + ".stcli-badge{font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;"
    + "padding:3px 8px;border-radius:999px;background:#EEF4FE;color:#0064E0;border:1px solid rgba(0,100,224,.25)}"
    + ".stcli-title{font-size:15px;font-weight:800;margin:0 8px 0 0}"
    + ".stcli-hint{font-size:12px;color:#65676B;margin:6px 0 12px;line-height:1.5}"
    + ".stcli-url{flex:1 1 320px;min-width:220px;box-sizing:border-box;border:1.5px solid #2E3646;"
    + "border-radius:12px;padding:11px 13px;font-size:14px;background:#090B10;color:#fff;outline:none}"
    + ".stcli-url:focus{border-color:#0064E0}"
    + ".stcli-num{width:76px;border:1.5px solid #E4E6EB;border-radius:10px;padding:8px 9px;"
    + "font-size:13px;outline:none;background:#F7F8FA;color:#050505}"
    + ".stcli-go{background:#0064E0;color:#fff;font-weight:800;border:0;border-radius:12px;"
    + "padding:11px 18px;font-size:14px;cursor:pointer;white-space:nowrap}"
    + ".stcli-go:disabled{opacity:.55;cursor:not-allowed}"
    + ".stcli-seg{font-size:12px;color:#65676B;display:flex;gap:6px;align-items:center;margin-top:10px;flex-wrap:wrap}"
    + ".stcli-bar{height:8px;background:#EEF0F4;border-radius:999px;overflow:hidden;margin:12px 0 8px}"
    + ".stcli-fill{height:100%;width:0%;background:#0064E0;border-radius:999px;transition:width .5s}"
    + ".stcli-msg{font-size:13px;color:#374151;font-weight:600}"
    + ".stcli-tl{margin:10px 0 0;padding:10px 14px;background:#F7F8FA;border:1px solid #EEF0F4;"
    + "border-radius:12px;max-height:180px;overflow-y:auto}"
    + ".stcli-tl div{font-size:11.5px;line-height:1.7;color:#374151;display:flex;gap:8px}"
    + ".stcli-tl b{min-width:64px;text-transform:uppercase;font-size:9.5px;letter-spacing:.08em;"
    + "color:#65676B;padding-top:2px}"
    + ".stcli-tl .st-correct b{color:#B45309}"
    + ".stcli-tl .st-plan b{color:#0064E0}"
    + ".stcli-tl .st-analyze b{color:#047857}"
    + ".stcli-err{background:#3B1D1D;color:#FF9B9B;border-radius:12px;padding:10px 14px;font-size:13px;margin-top:10px}"
    + ".stcli-done{margin-top:14px;border-top:1px dashed #E4E6EB;padding-top:14px}"
    + ".stcli-sum{font-size:19px;font-weight:800;margin:0 0 4px}"
    + ".stcli-mode{font-size:11.5px;color:#65676B;margin:0 0 12px}"
    + ".stcli-kpis{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}"
    + ".stcli-kpi{background:#F7F8FA;border:1px solid #E4E6EB;border-radius:14px;padding:10px 14px;min-width:110px}"
    + ".stcli-kpi b{font-size:17px;display:block}"
    + ".stcli-kpi span{font-size:10px;font-weight:800;letter-spacing:.08em;color:#65676B}"
    + ".stcli-kpi i{font-style:normal;font-size:11px;color:#0064E0;font-weight:700;display:block;margin-top:2px}"
    + ".stcli-pl{font-size:13px;display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0F1F4}"
    + ".stcli-pl:last-child{border-bottom:0}"
    + ".stcli-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.06em;padding:2px 7px;"
    + "border-radius:6px;margin-left:8px;vertical-align:middle}"
    + ".stcli-an{margin-top:14px;background:#F0FDF6;border:1px solid #BBF7D0;border-radius:14px;padding:14px 16px}"
    + ".stcli-an h4{margin:0 0 8px;font-size:12px;letter-spacing:.1em;color:#047857;text-transform:uppercase}"
    + ".stcli-an li{font-size:13px;line-height:1.65;color:#14532D;margin:0 0 6px}"
    + ".stcli-an .st-fw{font-size:12.5px;color:#065F46;font-weight:700;margin-top:8px}"
    + ".stcli-an .st-note{font-size:10.5px;color:#4B7A5E;margin-top:8px}"
    + ".stcli-chat{margin-top:14px;border-top:1px dashed #E4E6EB;padding-top:12px}"
    + ".stcli-chat .st-log{max-height:220px;overflow-y:auto;margin-bottom:10px}"
    + ".stcli-chat .st-q,.stcli-chat .st-a{font-size:13px;line-height:1.6;border-radius:12px;"
    + "padding:9px 13px;margin:6px 0;max-width:92%}"
    + ".stcli-chat .st-q{background:#EEF4FE;color:#0B3E8F;margin-left:auto;font-weight:600}"
    + ".stcli-chat .st-a{background:#F7F8FA;border:1px solid #E4E6EB;color:#1F2937}"
    + ".stcli-chat .st-a small{display:block;color:#65676B;font-size:10px;margin-top:4px;letter-spacing:.05em}"
    + ".stcli-chat .st-in{flex:1 1 280px;min-width:200px;border:1.5px solid #E4E6EB;border-radius:12px;"
    + "padding:10px 12px;font-size:13px;outline:none;background:#F7F8FA;color:#050505;box-sizing:border-box}"
    + ".stcli-chat .st-send{background:#050505;color:#fff;font-weight:800;border:0;border-radius:12px;"
    + "padding:10px 16px;font-size:13px;cursor:pointer}"
    + ".stcli-tools{margin-top:14px;border-top:1px dashed #E4E6EB;padding-top:12px}"
    + ".stcli-tbtn{background:#F7F8FA;border:1px solid #E4E6EB;color:#050505;font-weight:700;"
    + "border-radius:12px;padding:10px 14px;font-size:13px;cursor:pointer}"
    + ".stcli-tbtn:hover{border-color:#0064E0;color:#0064E0}"
    + ".stcli-mres{margin-top:12px}"
    + ".stcli-mom{border:1px solid #E4E6EB;border-radius:14px;padding:12px 14px;margin:8px 0;background:#F7F8FA}"
    + ".stcli-mom .st-l{font-weight:800;font-size:13.5px;color:#050505}"
    + ".stcli-mom .st-t{font-size:11px;font-weight:800;color:#0064E0;letter-spacing:.06em}"
    + ".stcli-mom .st-d{font-size:12px;color:#65676B;margin:4px 0 8px}"
    + ".stcli-mom video{width:100%;max-height:260px;border-radius:10px;background:#000;margin-top:8px}"
    + ".stcli-mom .st-w{background:#0064E0;color:#fff;border:0;border-radius:10px;padding:8px 14px;"
    + "font-size:12px;font-weight:800;cursor:pointer;margin-right:8px}"
    + ".stcli-mom .st-c{color:#0064E0;font-size:12px;font-weight:700;text-decoration:none}"
    + ".stcli-plan{margin-top:12px;background:#EEF4FE;border:1px solid #C7DAFB;border-radius:14px;padding:14px 16px}"
    + ".stcli-plan h4{margin:0 0 8px;font-size:12px;letter-spacing:.1em;color:#0B3E8F;text-transform:uppercase}"
    + ".stcli-plan .st-f{font-size:13px;font-weight:700;color:#0B3E8F;margin:0 0 10px}"
    + ".stcli-plan .st-s{font-size:13px;font-weight:800;margin:10px 0 4px}"
    + ".stcli-plan .st-dr{font-size:12.5px;color:#1F2937;line-height:1.6;margin-left:14px}"
    + ".stcli-plan .st-dr i{color:#0B3E8F;font-style:normal;font-weight:700}"
    + ".stcli-live{margin-top:12px;background:#090B10;border-radius:14px;padding:14px}"
    + ".stcli-live video{width:100%;max-height:300px;border-radius:10px;background:#000}"
    + ".stcli-live .st-tick{font-size:12.5px;color:#7DE2A0;font-family:ui-monospace,monospace;"
    + "margin-top:10px;line-height:1.6;min-height:34px}";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function modeTag(mode) {
    if (mode === "live") return '<span class="stcli-badge" style="background:#12331F;color:#7DE2A0;'
      + 'border-color:rgba(125,226,160,.4)">LIVE · SAM 3.1 + SPARK + E2B</span>';
    return '<span class="stcli-badge" style="background:#FFF7E6;color:#9A6700;border-color:rgba(154,103,0,.3)">'
      + 'DEMO · SYNTHETIC TRACKING (NO API KEYS)</span>';
  }

  function fmtS(s) {
    s = Math.round(s || 0);
    var m = Math.floor(s / 60);
    return (m ? m + "m " : "") + (s % 60) + "s";
  }

  function timelineHtml(log) {
    if (!log || !log.length) return "";
    var rows = log.slice(-8).map(function (e) {
      return '<div class="st-' + esc(e.stage) + '"><b>' + esc(e.stage) + "</b><span>" + esc(e.text) + "</span></div>";
    }).join("");
    return '<div class="stcli-tl">' + rows + "</div>";
  }

  function render() {
    var root = document.getElementById("stcli-root");
    if (!root) return;
    var h = '<style>' + CSS + '</style>'
      + '<div class="stcli-row">'
      + '<span class="stcli-badge">NEW</span><span class="stcli-title">Analyze a link</span>'
      + '<span class="stcli-hint" style="margin:0">Paste a YouTube or direct video link (.mp4/.webm) —'
      + ' we download it and analyze a segment, max 10 minutes.</span></div>'
      + '<div class="stcli-row" style="margin-top:10px">'
      + '<input id="stcli-url" class="stcli-url" placeholder="https://youtube.com/watch?v=… or https://…/match.mp4">'
      + '<select id="stcli-sport" class="stcli-num" style="width:120px">'
      + '<option value="soccer">Soccer</option><option value="basketball">Basketball</option>'
      + '<option value="running">Running</option></select>'
      + '<button id="stcli-go" class="stcli-go">Analyze link</button></div>'
      + '<div class="stcli-seg">Segment (optional): start <input id="stcli-s0" class="stcli-num" type="number" min="0" step="1" placeholder="0">'
      + ' end <input id="stcli-s1" class="stcli-num" type="number" min="0" step="1" placeholder="60"> seconds'
      + '<span style="opacity:.75">— empty = auto (long videos: first 10 min)</span></div>'
      + '<div id="stcli-status"></div>';
    root.innerHTML = h;

    var st = document.getElementById("stcli-status");
    if (S.phase === "running" && S.job) {
      st.innerHTML = '<div class="stcli-bar"><div class="stcli-fill" style="width:'
        + (S.job.progress || 2) + '%"></div></div><div class="stcli-msg">'
        + esc(S.job.message || "Working…") + "</div>"
        + timelineHtml(S.job.agent_log);
    } else if (S.phase === "error") {
      st.innerHTML = '<div class="stcli-err">❌ ' + esc(S.error || "unknown error") + "</div>";
    } else if (S.phase === "done" && S.result) {
      st.innerHTML = timelineHtml(S.job.agent_log) + resultHtml(S.result, S.job) + chatHtml();
      var logEl = document.getElementById("stcli-chatlog");
      if (logEl && S.chat.log.length) logEl.innerHTML = chatLogHtml();
    }
  }

  function resultHtml(result, job) {
    var kpis = (result.kpis || []).map(function (k) {
      return '<div class="stcli-kpi"><b>' + esc(k.value) + '<span style="font-size:12px;font-weight:700">'
        + esc(k.unit || "") + "</span></b><span>" + esc(k.label) + "</span><i>" + esc(k.sub || "") + "</i></div>";
    }).join("");
    var players = Object.keys(result.players || {}).slice(0, 5).map(function (pid) {
      var p = result.players[pid];
      return '<div class="stcli-pl"><span>' + esc(p.id) + " · " + esc(p.name) + "</span>"
        + "<span><b>" + esc(p.distance) + "</b> · " + esc(p.topSpeed) + "</span></div>";
    }).join("");
    var seg = (job && job.video && job.video.segment)
      ? " · segment " + fmtS(job.video.segment.start_s) + "–" + fmtS(job.video.segment.end_s)
        + " of " + fmtS(job.video.segment.raw_duration_s)
      : "";
    var an = result.analysis || {};
    var anHtml = "";
    if (an.tactical && an.tactical.length) {
      anHtml = '<div class="stcli-an"><h4>🧠 Spark analyst — reading this match</h4><ul style="margin:0;padding-left:18px">'
        + an.tactical.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("")
        + '</ul><div class="st-fw">➜ ' + esc(an.forward || "") + '</div>'
        + (an.note ? '<div class="st-note">' + esc(an.note) + "</div>" : "") + "</div>";
    }
    return '<div class="stcli-done"><p class="stcli-sum">' + esc(result.summaryText || "Stats ready")
      + '<span class="stcli-tag" style="background:#EEF4FE;color:#0064E0">' + esc(result.confidence || "")
      + '</span></p><p class="stcli-mode">' + esc(result.label || "") + " · " + esc(result.duration || "")
      + seg + " · " + modeTag(result.mode) + "</p>"
      + '<div class="stcli-kpis">' + kpis + "</div>" + players + anHtml + toolsHtml() + "</div>";
  }

  function toolsHtml() {
    return '<div class="stcli-tools">'
      + '<div class="stcli-row">'
      + '<input id="stcli-momq" class="stcli-chat st-in" style="flex:1 1 280px" '
      + 'placeholder="Find moments — e.g. fastest sprint bursts, most chaotic pressure…">'
      + '<button id="stcli-mombtn" class="stcli-tbtn">Search moments</button>'
      + '<button id="stcli-planbtn" class="stcli-tbtn">Training plan</button>'
      + '<button id="stcli-livebtn" class="stcli-tbtn">▶ Live replay</button></div>'
      + '<div id="stcli-momres" class="stcli-mres"></div>'
      + '<div id="stcli-planres"></div>'
      + '<div id="stcli-liveres"></div></div>';
  }

  function chatHtml() {
    return '<div class="stcli-chat"><div class="stcli-row" style="margin-bottom:6px">'
      + '<span class="stcli-badge" style="background:#F0FDF6;color:#047857;border-color:rgba(4,120,87,.3)">ASK</span>'
      + '<span class="stcli-title" style="font-size:13px">Ask the Analyst</span>'
      + '<span class="stcli-hint" style="margin:0;font-size:11.5px">answers computed from this match\'s tracking data</span></div>'
      + '<div id="stcli-chatlog" class="st-log"></div>'
      + '<div class="stcli-row"><input id="stcli-chat-in" class="st-in" placeholder="e.g. why did we look weak in the second half?">'
      + '<button id="stcli-chat-send" class="st-send">Ask</button></div></div>';
  }

  function chatLogHtml() {
    return S.chat.log.map(function (m) {
      return '<div class="' + (m.who === "you" ? "st-q" : "st-a") + '">' + esc(m.text)
        + (m.mode ? "<small>[" + esc(m.mode) + "]</small>" : "") + "</div>";
    }).join("");
  }

  function submit() {
    var url = document.getElementById("stcli-url").value.trim();
    if (!url) { S.phase = "error"; S.error = "paste a video link first"; render(); return; }
    var s0 = parseFloat(document.getElementById("stcli-s0").value) || 0;
    var s1 = parseFloat(document.getElementById("stcli-s1").value) || 0;
    var sport = document.getElementById("stcli-sport").value;
    var fd = new FormData();
    fd.append("source_url", url);
    fd.append("sport", sport);
    fd.append("seg_start", String(s0));
    fd.append("seg_end", String(s1));
    S.phase = "running"; S.job = { progress: 2, message: "Submitting…" };
    S.result = null; S.error = null; S.chat = { log: [], busy: false };
    render();
    fetch("/api/jobs", { method: "POST", body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.detail
          ? (typeof res.j.detail === "string" ? res.j.detail : JSON.stringify(res.j.detail))
          : "submit failed");
        S.job = { id: res.j.job_id, progress: 3, message: "Queued", agent_log: [] };
        poll();
      })
      .catch(function (e) { S.phase = "error"; S.error = e.message; render(); });
  }

  function poll() {
    if (S.poll) clearInterval(S.poll);
    S.poll = setInterval(function () {
      if (!S.job || !S.job.id) return;
      fetch("/api/jobs/" + S.job.id).then(function (r) { return r.json(); }).then(function (j) {
        S.job = j;
        if (j.status === "done") { S.phase = "done"; S.result = j.result || {}; clearInterval(S.poll); }
        else if (j.status === "failed") { S.phase = "error"; S.error = j.message || "job failed"; clearInterval(S.poll); }
        render();
      }).catch(function () {});
    }, 1500);
  }

  function chatSend() {
    var input = document.getElementById("stcli-chat-in");
    if (!input || !input.value.trim() || S.chat.busy || !S.job || !S.job.id) return;
    var msg = input.value.trim();
    S.chat.busy = true;
    S.chat.log.push({ who: "you", text: msg });
    input.value = "";
    var logEl = document.getElementById("stcli-chatlog");
    if (logEl) logEl.innerHTML = chatLogHtml() + '<div class="st-a">…thinking</div>';
    fetch("/api/jobs/" + S.job.id + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      S.chat.busy = false;
      S.chat.log.push({ who: "analyst", text: j.reply || "no answer", mode: j.mode });
      logEl = document.getElementById("stcli-chatlog");
      if (logEl) logEl.innerHTML = chatLogHtml();
      logEl && (logEl.scrollTop = logEl.scrollHeight);
    }).catch(function (e) {
      S.chat.busy = false;
      S.chat.log.push({ who: "analyst", text: "chat failed: " + e.message, mode: "error" });
      logEl = document.getElementById("stcli-chatlog");
      if (logEl) logEl.innerHTML = chatLogHtml();
    });
  }

  function momentsSearch() {
    var input = document.getElementById("stcli-momq");
    var res = document.getElementById("stcli-momres");
    if (!input || !S.job || !S.job.id) return;
    var q = input.value.trim();
    res.innerHTML = '<div class="stcli-msg">Searching tracking data…</div>';
    fetch("/api/jobs/" + S.job.id + "/moments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.detail) { res.innerHTML = '<div class="stcli-err">❌ ' + esc(typeof j.detail === "string" ? j.detail : "search failed") + "</div>"; return; }
      res.innerHTML = j.moments.map(function (m, i) {
        return '<div class="stcli-mom"><span class="st-t">' + fmtS(m.start_s) + " – " + fmtS(m.end_s)
          + '</span> <span class="st-l">' + esc(m.label) + "</span>"
          + '<div class="st-d">' + esc(m.description) + "</div>"
          + '<button class="st-w" data-mom="' + i + '">▶ Watch clip</button>'
          + '<a class="st-c" href="/api/jobs/' + S.job.id + '/card?start=' + m.start_s + "&end=" + m.end_s
          + '" target="_blank">Share card ↗</a></div>';
      }).join("");
      S.moments = j.moments;
    }).catch(function (e) {
      res.innerHTML = '<div class="stcli-err">❌ ' + esc(e.message) + "</div>";
    });
  }

  function watchMoment(i) {
    var m = (S.moments || [])[i];
    var res = document.getElementById("stcli-momres");
    if (!m || !res || !S.job) return;
    var box = res.querySelectorAll(".stcli-mom")[i];
    if (!box) return;
    var old = box.querySelector("video");
    if (old) { old.remove(); return; }
    var v = el("video");
    v.controls = true;
    v.src = "/api/jobs/" + S.job.id + "/clip?start=" + m.start_s + "&end=" + m.end_s;
    box.appendChild(v);
  }

  function loadPlan() {
    var res = document.getElementById("stcli-planres");
    if (!res || !S.job || !S.job.id) return;
    if (res.innerHTML) { res.innerHTML = ""; return; }
    res.innerHTML = '<div class="stcli-msg">Building plan from this match\u2019s weaknesses…</div>';
    fetch("/api/jobs/" + S.job.id + "/plan").then(function (r) { return r.json(); }).then(function (p) {
      if (p.detail) { res.innerHTML = '<div class="stcli-err">❌ ' + esc(typeof p.detail === "string" ? p.detail : "plan failed") + "</div>"; return; }
      res.innerHTML = '<div class="stcli-plan"><h4>📋 Weekly training plan</h4>'
        + '<div class="st-f">' + p.focus.map(esc).join(" · ") + "</div>"
        + p.sessions.map(function (s) {
          return '<div class="st-s">' + esc(s.day) + " — " + esc(s.title) + "</div>"
            + s.drills.map(function (d) {
              return '<div class="st-dr">• <i>' + esc(d.name) + "</i> (" + d.duration_min
                + " min) — " + esc(d.why) + "</div>";
            }).join("");
        }).join("")
        + '<div class="st-note" style="font-size:10.5px;color:#4B6A93;margin-top:8px">' + esc(p.note) + "</div></div>";
    }).catch(function (e) {
      res.innerHTML = '<div class="stcli-err">❌ ' + esc(e.message) + "</div>";
    });
  }

  function startLive() {
    var res = document.getElementById("stcli-liveres");
    if (!res || !S.job || !S.job.id) return;
    if (res.innerHTML) { res.innerHTML = ""; S.live = null; return; }
    res.innerHTML = '<div class="stcli-live"><div class="stcli-row" style="margin-bottom:8px">'
      + '<span class="stcli-badge" style="background:#12331F;color:#7DE2A0;border-color:rgba(125,226,160,.4)">LIVE REPLAY</span>'
      + '<span class="stcli-hint" style="margin:0;font-size:11px;color:#9CA3AF">tactical whispers computed from tracking as the match replays</span></div>'
      + '<video id="stcli-livevid" controls src="/api/jobs/' + S.job.id + '/video"></video>'
      + '<div class="st-tick" id="stcli-tick">waiting for playback…</div></div>';
    var vid = document.getElementById("stcli-livevid");
    S.live = { int: null };
    var tick = function () {
      var t = vid && vid.currentTime ? vid.currentTime : 0;
      fetch("/api/jobs/" + S.job.id + "/whisper?t=" + t.toFixed(1))
        .then(function (r) { return r.json(); })
        .then(function (w) {
          var el2 = document.getElementById("stcli-tick");
          if (el2) el2.textContent = "💬 " + w.text;
        }).catch(function () {});
    };
    vid.addEventListener("play", function () {
      if (S.live.int) clearInterval(S.live.int);
      S.live.int = setInterval(tick, 4000);
      tick();
    });
    vid.addEventListener("pause", function () {
      if (S.live.int) { clearInterval(S.live.int); S.live.int = null; }
    });
  }

  function inject() {
    if (document.getElementById("stcli-root")) return;
    // innermost div containing the dropzone text, then climb to the dashed
    // dropzone box; the widget lands right after it, inside the white card
    var dz = null, best = 1e9;
    var divs = document.querySelectorAll("div");
    for (var i = 0; i < divs.length; i++) {
      var t = divs[i].textContent || "";
      if (t.indexOf("Drop your match video here") !== -1 && t.length < best) {
        best = t.length; dz = divs[i];
      }
    }
    if (!dz) return;
    var card = dz;
    while (card && card !== document.body
      && String(card.className).indexOf("border-dashed") === -1) {
      card = card.parentElement;
    }
    if (!card || card === document.body || !card.parentNode) return;
    var root = el("div");
    root.id = "stcli-root";
    card.parentNode.insertBefore(root, card.nextSibling);
    render();
  }

  function whenHydrated(cb) {
    // React marks hydrated nodes with __reactFiber$* / __reactProps$* keys.
    // Injecting DOM BEFORE hydration completes makes React's recovery loop
    // queue every click forever (all React onClicks die) — so wait for it.
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var b = document.querySelector('button[aria-label="Toggle theme"]')
        || document.querySelector("h1");
      var done = false;
      if (b) {
        var keys = Object.keys(b);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].indexOf("__reactFiber") === 0
            || keys[i].indexOf("__reactContainer") === 0) { done = true; break; }
        }
      }
      if (done) { clearInterval(iv); cb(); }
      else if (tries > 200) clearInterval(iv); // never inject into a broken tree
    }, 150);
  }

  function boot() {
    // document-level listeners are safe pre-hydration (no DOM changes)
    document.addEventListener("click", function (ev) {
      var t = ev.target;
      while (t && t !== document) {
        if (t.id === "stcli-go") { submit(); return; }
        if (t.id === "stcli-chat-send") { chatSend(); return; }
        if (t.id === "stcli-mombtn") { momentsSearch(); return; }
        if (t.id === "stcli-planbtn") { loadPlan(); return; }
        if (t.id === "stcli-livebtn") { startLive(); return; }
        if (t.getAttribute && t.getAttribute("data-mom") != null) {
          watchMoment(parseInt(t.getAttribute("data-mom"), 10)); return;
        }
        t = t.parentNode;
      }
    }, true);
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" || !ev.target) return;
      if (ev.target.id === "stcli-url") submit();
      if (ev.target.id === "stcli-chat-in") chatSend();
      if (ev.target.id === "stcli-momq") momentsSearch();
    }, true);
    whenHydrated(function () {
      if (!document.getElementById("stcli-polish")) {
        var st = document.createElement("style");
        st.id = "stcli-polish";
        st.textContent = POLISH;
        document.head.appendChild(st);
      }
      inject();
      new MutationObserver(function () { inject(); })
        .observe(document.body, { childList: true, subtree: true });
    });
  }

  window.__stcli = true;
  window.__stcliS = S;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
