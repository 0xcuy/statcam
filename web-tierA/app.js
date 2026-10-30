/* StatCam — Tier A frontend application (vanilla JS, no framework). */
(function () {
  "use strict";
  window.__errs = [];
  window.addEventListener("error", function (e) { window.__errs.push("ERR: " + e.message + " @" + (e.lineno || "?")); });
  window.addEventListener("unhandledrejection", function (e) { window.__errs.push("REJ: " + ((e.reason && e.reason.message) || e.reason)); });

  var S = {
    mode: null,        // 'sample' | 'job'
    job: null,         // live job object from API
    result: null,      // result object (live or baked)
    phase: "idle",     // idle | running | done | error
    poll: null,
    chat: { log: [], busy: false },
    moments: null,
    live: null,
    sample: null,      // sample replay state
  };

  var $ = function (id) { return document.getElementById(id); };
  function SD() { return SAMPLE_DATA[S.sampleSport || "soccer"] || SD().soccer; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtS(s) {
    s = Math.max(0, Math.round(s || 0));
    var m = Math.floor(s / 60);
    return (m ? m + "m " : "") + (s % 60) + "s";
  }

  /* ================= health / mode chip ================= */
  fetch("/api/health", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (h) {
      var chip = $("mode-chip");
      if (h && h.live_ready) {
        chip.textContent = "LIVE · SAM 3.1 + SPARK";
        chip.classList.add("live");
      } else {
        chip.textContent = "DEMO MODE · NO API KEYS";
      }
    })
    .catch(function () { $("mode-chip").textContent = "DEMO MODE · API OFFLINE"; });


  /* ================= hero: real footage + real SAM 3.1 overlay ================= */
  (function heroOverlay() {
    var T = window.DEMO_TRACKS;
    var vid = $("herovid"), cv = $("pitch");
    if (!T || !T.objects || !T.objects.length || !vid || !cv) { heroSim(); return; }
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var sx = W / T.meta.video_w, sy = H / T.meta.video_h;
    var scale = T.meta.video_w / T.meta.visible_width_m;  // meters -> source pixels
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var started = false;
    var unmute = function () {
      vid.muted = false;
      document.removeEventListener("pointerdown", unmute, true);
      document.removeEventListener("keydown", unmute, true);
    };
    document.addEventListener("pointerdown", unmute, true);
    document.addEventListener("keydown", unmute, true);
    window.__events = [];
    ["canplay", "loadeddata", "playing", "error", "stalled"].forEach(function (ev) {
      vid.addEventListener(ev, function () { window.__events.push(ev + " rs=" + vid.readyState); });
    });
    function takeOver() {
      window.__events.push("takeOver rs=" + vid.readyState + " started=" + started);
      if (started || !window.__heroSimActive) return;
      if (vid.readyState < 2) return;
      started = true;
      window.__heroSimActive = false;
      window.__heroDrawOnce = draw;
      vid.style.display = "block";
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
      (function loop() { draw(); requestAnimationFrame(loop); })();
    }
    vid.addEventListener("canplay", takeOver);
    vid.addEventListener("loadeddata", takeOver);
    vid.addEventListener("playing", takeOver);
    vid.addEventListener("error", function () { vid.style.display = "none"; });

    function findAt(frames, f, maxGap) {
      maxGap = 30;  // hold boxes through camera cuts / blur for up to 1 s
      // interpolate between the detections bracketing the frame — smooth
      // boxes even when SAM only samples a player intermittently
      var prev = null, next = null;
      for (var i = 0; i < frames.length; i++) {
        var fr = frames[i];
        if (fr[0] <= f && (!prev || fr[0] > prev[0])) prev = fr;
        if (fr[0] > f && (!next || fr[0] < next[0])) next = fr;
      }
      if (!prev) return (next && next[0] - f <= maxGap) ? next : null;
      if (f - prev[0] > maxGap) return null;
      if (!next || next[0] - prev[0] > 60) return prev;
      var a = (f - prev[0]) / (next[0] - prev[0]);
      return [f,
        prev[1] + (next[1] - prev[1]) * a,
        prev[2] + (next[2] - prev[2]) * a,
        prev[3] + (next[3] - prev[3]) * a,
        prev[4] + (next[4] - prev[4]) * a];
    }
    function findOlder(frames, f, minAge) {
      var best = null;
      for (var i = 0; i < frames.length; i++) {
        var fr = frames[i];
        if (fr[0] <= f - minAge && (!best || fr[0] > best[0])) best = fr;
      }
      return best;
    }
    function arrow(x1, y1, x2, y2, col) {
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.hypot(dx, dy);
      if (len < 6) return;
      var ux = dx / len, uy = dy / len;
      var hx = x2 + ux * 30, hy = y2 + uy * 30;
      ctx.strokeStyle = "rgba(" + col + ",.9)";
      ctx.fillStyle = "rgba(" + col + ",.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x2 - ux * 12, y2 - uy * 12); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - ux * 9 - uy * 5, hy - uy * 9 + ux * 5);
      ctx.lineTo(hx - ux * 9 + uy * 5, hy - uy * 9 - ux * 5);
      ctx.closePath(); ctx.fill();
    }
    var diffCv = document.createElement("canvas");
    diffCv.width = 32; diffCv.height = 18;
    var dctx = diffCv.getContext("2d", { willReadFrequently: true });
    var prevPix = null, prevDiff = 0;
    function isCameraCut() {
      // clear boxes only on a hard-cut SPIKE (huge diff right after a calm
      // frame). Sustained high diff = camera zoom/pan — SAM tracked through
      // it, so the boxes stay.
      try {
        dctx.drawImage(vid, 0, 0, 32, 18);
        var px = dctx.getImageData(0, 0, 32, 18).data;
        if (prevPix) {
          var diff = 0;
          for (var i = 0; i < px.length; i += 4) {
            diff += Math.abs(px[i] - prevPix[i]) + Math.abs(px[i+1] - prevPix[i+1]) + Math.abs(px[i+2] - prevPix[i+2]);
          }
          diff /= px.length / 4;
          var wasCalm = prevDiff < 15;
          prevDiff = diff;
          prevPix = px;
          return diff > 40 && wasCalm;
        }
        prevPix = px;
      } catch (e) {}
      return false;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cut = isCameraCut();
      if (cut) return;                     // never float boxes over a new scene
      var f = Math.floor((vid.currentTime || 0) * 30);
      T.objects.forEach(function (o) {
        if (o.label === "ball") return;   // the ball gets its own featured treatment below
        var now = findAt(o.frames, f, 10);
        if (!now) return;
        var cx = now[1] * scale * sx, cy = now[2] * scale * sy;
        var w = Math.max(12, now[3] * scale * sx), h = Math.max(16, now[4] * scale * sy);
        var col = "34,211,238";
        ctx.strokeStyle = "rgba(" + col + ",.95)";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - w / 2, cy - h / 2 - 2, w, h);
        ctx.fillStyle = "rgba(" + col + ",.95)";
        ctx.fillRect(cx - w / 2, cy - h / 2 - 7, w, 4);
        ctx.font = "700 10px ui-monospace, monospace";
        ctx.fillText(o.id, cx - w / 2 + 2, cy - h / 2 - 10);
        var old = findOlder(o.frames, now[0], 15);
        if (old) {
          var ox = old[1] * scale * sx, oy = old[2] * scale * sy;
          var sp = Math.hypot(cx - ox, cy - oy) / ((now[0] - old[0]) / 30) * 3.6;
          if (sp > 6) arrow(ox, oy, cx, cy, "34,211,238");
          if (sp > 25) {
            ctx.font = "800 10px ui-monospace, monospace";
            ctx.fillStyle = "rgba(251,191,36,.95)";
            ctx.fillText("SPRINT", cx + w / 2 + 4, cy);
          }
        }
      });
      drawBallFeature(f);
    }
    function drawBallFeature(f) {
      var bo = null;
      T.objects.forEach(function (o) { if (o.label === "ball") bo = o; });
      if (!bo) return;
      var pts = [];
      bo.frames.forEach(function (fr) { if (fr[0] <= f && fr[0] >= f - 90) pts.push(fr); });
      if (!pts.length) return;
      var X = function (fr) { return fr[1] * scale * sx; };
      var Y = function (fr) { return fr[2] * scale * sy; };
      // fading trajectory trail
      for (var i = 1; i < pts.length; i++) {
        var a = i / pts.length;
        ctx.strokeStyle = "rgba(34,211,238," + (0.12 + 0.6 * a).toFixed(2) + ")";
        ctx.lineWidth = 2 + 3.5 * a;
        ctx.beginPath();
        ctx.moveTo(X(pts[i - 1]), Y(pts[i - 1]));
        ctx.lineTo(X(pts[i]), Y(pts[i]));
        ctx.stroke();
      }
      var cur = pts[pts.length - 1];
      var bx = X(cur), by = Y(cur);
      // velocity arrow
      if (pts.length >= 4) {
        var oldp = pts[Math.max(0, pts.length - 8)];
        var sp = Math.hypot(bx - X(oldp), by - Y(oldp));
        if (sp > 8) arrow(X(oldp), Y(oldp), bx, by, "34,211,238");
      }
      // glowing ball marker
      ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,211,238,.25)"; ctx.fill();
      ctx.beginPath(); ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(34,211,238,.95)"; ctx.stroke();
    }

    if (reduce) {
      vid.pause();
      vid.style.display = "none";
      heroSim();
      vid.addEventListener("loadeddata", function () { vid.currentTime = 2; draw(); }, { once: true });
      return;
    }
    vid.style.display = "none";     // sim runs until the real footage is buffered
    try { heroSim(); } catch (err) { window.__errs.push("heroSim: " + err.message); }
    try { takeOver(); } catch (err) { window.__errs.push("takeOver: " + err.message); }
    var fsBtn = $("hero-fs");
    if (fsBtn) fsBtn.addEventListener("click", function () {
      var stage = vid.parentElement;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen();
    });
  })();

  /* ================= tabs ================= */
  var TABS = ["link", "upload", "sample"];
  function showTab(name) {
    TABS.forEach(function (t) {
      $("tabbtn-" + t).classList.toggle("active", t === name);
      $("tabbtn-" + t).setAttribute("aria-selected", t === name ? "true" : "false");
      $("pane-" + t).classList.toggle("active", t === name);
    });
  }
  TABS.forEach(function (t) {
    $("tabbtn-" + t).addEventListener("click", function () { showTab(t); });
  });

  /* ================= hero: sim fallback ================= */
  function heroSim() {
    var cv = $("pitch");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function Player(team, x, y) { this.tx = team; this.x = x; this.y = y; this.hx = x; this.hy = y;
      this.vx = 0; this.vy = 0; this.trail = []; this.burst = 0; }
    var players = [];
    var roles = [
      [0.10, 0.5], [0.25, 0.2], [0.25, 0.8], [0.42, 0.38], [0.42, 0.62],
    ];
    roles.forEach(function (r) {
      players.push(new Player(0, W * r[0], H * r[1]));
      players.push(new Player(1, W * (1 - r[0]), H * (1 - r[1])));
    });
    var ball = { x: W / 2, y: H / 2, vx: 1.2, vy: 0.6, trail: [],
      mode: "dribble", left: 90, target: [W / 2, H / 2] };
    var THIRD = W / 3;
    function thirdOf(x) { return x < THIRD ? 0 : (x < 2 * THIRD ? 1 : 2); }
    var COLORS = ["#22D3EE", "#F87171"];
    var SCAN = 0;

    function step() {
      players.forEach(function (p) {
        p.burst = Math.max(0, p.burst - 1);
        if (Math.random() < 0.008) p.burst = 40 + Math.random() * 50;
        var spd = p.burst > 0 ? 1.9 : 0.55;
        p.vx += (Math.random() - 0.5) * 0.5; p.vy += (Math.random() - 0.5) * 0.5;
        var dx = p.hx - p.x, dy = p.hy - p.y;
        p.vx += dx * 0.0016; p.vy += dy * 0.0016;
        var v = Math.hypot(p.vx, p.vy) || 1;
        if (v > spd) { p.vx = p.vx / v * spd; p.vy = p.vy / v * spd; }
        p.x = Math.max(14, Math.min(W - 14, p.x + p.vx));
        p.y = Math.max(14, Math.min(H - 14, p.y + p.vy));
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 22) p.trail.shift();
      });
      if (ball.left <= 0) {
        if (ball.mode === "dribble") {
          var others = [0, 1, 2].filter(function (i) { return i !== thirdOf(ball.x); });
          var ti = others[Math.floor(Math.random() * others.length)];
          ball.target = [THIRD * (ti * 2 + 1) + (Math.random() - 0.5) * 70,
                         H * 0.25 + Math.random() * H * 0.5];
          ball.mode = "pass"; ball.left = 50 + Math.random() * 60;
        } else { ball.mode = "dribble"; ball.left = 60 + Math.random() * 80; }
      } else ball.left--;
      if (ball.mode === "dribble") {
        var near = null, nd = 1e9;
        players.forEach(function (p) {
          var d = Math.hypot(p.x - ball.x, p.y - ball.y);
          if (d < nd) { nd = d; near = p; }
        });
        if (near) {
          ball.vx += (near.x - ball.x) * 0.008 + (Math.random() - 0.5) * 0.4;
          ball.vy += (near.y - ball.y) * 0.008 + (Math.random() - 0.5) * 0.4;
        }
        var cap1 = 2.3, bv1 = Math.hypot(ball.vx, ball.vy) || 1;
        if (bv1 > cap1) { ball.vx = ball.vx / bv1 * cap1; ball.vy = ball.vy / bv1 * cap1; }
      } else {
        ball.vx += (ball.target[0] - ball.x) * 0.03 + (Math.random() - 0.5) * 0.3;
        ball.vy += (ball.target[1] - ball.y) * 0.03 + (Math.random() - 0.5) * 0.3;
        var cap2 = 3.6, bv2 = Math.hypot(ball.vx, ball.vy) || 1;
        if (bv2 > cap2) { ball.vx = ball.vx / bv2 * cap2; ball.vy = ball.vy / bv2 * cap2; }
        if (Math.hypot(ball.target[0] - ball.x, ball.target[1] - ball.y) < 26) ball.left = 0;
      }
      ball.x = Math.max(10, Math.min(W - 10, ball.x + ball.vx));
      ball.y = Math.max(10, Math.min(H - 10, ball.y + ball.vy));
      ball.trail.push([ball.x, ball.y]);
      if (ball.trail.length > 14) ball.trail.shift();
    }

    function drawPitch() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0A2E14";
      ctx.fillRect(0, 0, W, H);
      var stripes = 8;
      for (var i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.05)";
        ctx.fillRect(i * W / stripes, 0, W / stripes, H);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(10, 10, W - 20, H - 20);
      ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 2.4, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill();
      ctx.strokeRect(10, H / 2 - 62, 62, 124);
      ctx.strokeRect(W - 72, H / 2 - 62, 62, 124);
    }

    function draw() {
      drawPitch();
      SCAN = (SCAN + 1.6) % (W + 120);
      var g = ctx.createLinearGradient(SCAN - 100, 0, SCAN + 20, 0);
      g.addColorStop(0, "rgba(34,211,238,0)");
      g.addColorStop(1, "rgba(34,211,238,0.14)");
      ctx.fillStyle = g;
      ctx.fillRect(SCAN - 100, 0, 120, H);

      players.forEach(function (p) {
        var c = COLORS[p.tx];
        ctx.strokeStyle = c + "55"; ctx.lineWidth = 1.6;
        ctx.beginPath();
        p.trail.forEach(function (pt, i) { i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); });
        ctx.stroke();
        ctx.strokeStyle = c; ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 7, p.y - 9, 14, 18);
        ctx.fillStyle = c;
        ctx.fillRect(p.x - 7, p.y - 13, 14, 4);
        if (p.burst > 0) {
          ctx.fillStyle = "rgba(251,191,36,.9)";
          ctx.font = "700 8px ui-monospace, monospace";
          ctx.fillText("SPRINT", p.x + 10, p.y - 8);
        }
      });
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ball.trail.forEach(function (pt, i) { i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); });
      ctx.stroke();
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
    }

    if (reduce) { for (var i = 0; i < 240; i++) step(); draw(); return; }
    var frames = 0, last = performance.now();
    (function loop(now) {
      if (!window.__heroSimActive) return;   // overlay takes over when the real footage is ready
      window.__simFrames = (window.__simFrames || 0) + 1;
      try { step(); draw(); } catch (e) { window.__errs.push("sim: " + e.message); }
      frames++;
      if (now - last > 2000) {
        $("track-fps").textContent = Math.round(frames * 1000 / (now - last)) + " FPS";
        frames = 0; last = now;
      }
      requestAnimationFrame(loop);
    })(performance.now());
  }
  window.__heroSimActive = true;

  /* ================= timeline rendering ================= */
  function timelineHtml(log, limit) {
    if (!log || !log.length) return "";
    var rows = log.slice(-(limit || 8)).map(function (e) {
      return '<div class="st-' + esc(e.stage) + '"><b>' + esc(e.stage) + "</b><span>" + esc(e.text) + "</span></div>";
    }).join("");
    return '<div class="timeline">' + rows + "</div>";
  }

  /* ================= submit: link ================= */
  $("go-link").addEventListener("click", submitLink);
  $("url").addEventListener("keydown", function (e) { if (e.key === "Enter") submitLink(); });
  function submitLink() {
    var url = $("url").value.trim();
    if (!url) { renderError("Paste a video link first."); return; }
    var fd = new FormData();
    fd.append("source_url", url);
    fd.append("sport", $("sport-link").value);
    var s0 = parseFloat($("s0").value) || 0;
    var s1 = parseFloat($("s1").value) || 0;
    if (s0 || s1) { fd.append("seg_start", String(s0)); fd.append("seg_end", String(s1)); }
    startJob(fd, "link · " + url);
  }

  /* ================= submit: upload ================= */
  var dz = $("dropzone"), fileIn = $("file"), chosenFile = null;
  dz.addEventListener("click", function () { fileIn.click(); });
  dz.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileIn.click(); } });
  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("drag"); });
  });
  dz.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  });
  fileIn.addEventListener("change", function () { if (fileIn.files[0]) pickFile(fileIn.files[0]); });
  function pickFile(f) {
    chosenFile = f;
    $("dz-filename").textContent = "▸ " + f.name + " (" + (f.size / 1048576).toFixed(1) + " MB)";
    $("go-upload").disabled = false;
  }
  $("go-upload").addEventListener("click", function () {
    if (!chosenFile) return;
    var fd = new FormData();
    fd.append("video", chosenFile, chosenFile.name);
    fd.append("sport", $("sport-upload").value);
    startJobXHR(fd, chosenFile.name);
  });

  function startJob(fd, label) {
    S.phase = "running"; S.mode = "job";
    S.job = { progress: 2, message: "Submitting " + label + "…", agent_log: [] };
    renderStatus();
    fetch("/api/jobs", { method: "POST", body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.detail
          ? (typeof res.j.detail === "string" ? res.j.detail : JSON.stringify(res.j.detail))
          : "submit failed");
        S.job = { id: res.j.job_id, progress: 3, message: "Queued", agent_log: [] };
        poll();
      })
      .catch(function (e) { renderError(e.message); });
  }

  function startJobXHR(fd, label) {
    S.phase = "running"; S.mode = "job";
    S.job = { progress: 1, message: "Uploading " + label + "…", agent_log: [] };
    renderStatus();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/jobs");
    xhr.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        S.job.progress = Math.max(1, Math.round(e.loaded / e.total * 30));
        S.job.message = "Uploading " + label + " — " + Math.round(e.loaded / e.total * 100) + "%";
        renderStatus();
      }
    });
    xhr.addEventListener("load", function () {
      try {
        var j = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) throw new Error(typeof j.detail === "string" ? j.detail : "upload rejected");
        S.job = { id: j.job_id, progress: 31, message: "Uploaded — queued", agent_log: [] };
        renderStatus();
        poll();
      } catch (e) { renderError(e.message); }
    });
    xhr.addEventListener("error", function () { renderError("upload failed — network error"); });
    xhr.send(fd);
  }

  function poll() {
    if (S.poll) clearInterval(S.poll);
    S.poll = setInterval(function () {
      if (!S.job || !S.job.id) return;
      fetch("/api/jobs/" + S.job.id, { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          S.job = j;
          if (j.status === "done") {
            S.phase = "done"; S.result = j.result || {};
            clearInterval(S.poll);
            renderStatus(); renderResults();
          } else if (j.status === "failed") {
            S.phase = "error"; clearInterval(S.poll);
            renderError(j.message || "job failed");
          } else renderStatus();
        })
        .catch(function () {});
    }, 1500);
  }

  function renderError(msg) {
    S.phase = "error";
    $("status").innerHTML = '<div class="err-box">✕ ' + esc(msg) + "</div>";
  }

  function renderStatus() {
    var st = $("status");
    if (S.phase === "running" && S.job) {
      st.innerHTML = '<div class="bar"><div class="bar-fill" style="width:' +
        (S.job.progress || 2) + '%"></div></div><div class="msg">' + esc(S.job.message || "Working…") + "</div>" +
        timelineHtml(S.job.agent_log);
      var tl = st.querySelector(".timeline");
      if (tl) tl.scrollTop = tl.scrollHeight;
    } else if (S.phase === "done" && S.job) {
      st.innerHTML = timelineHtml(S.job.agent_log, 10);
      var t2 = st.querySelector(".timeline");
      if (t2) t2.scrollTop = t2.scrollHeight;
    }
  }

  /* ================= results ================= */
  function modeBadge(result, source) {
    if (source === "sample") return '<span class="badge sample">DEMO ' +
      (S.sampleSport || "soccer").toUpperCase() + ' · REAL FOOTAGE · VERIFIED RUN</span>';
    if (result.mode === "live") return '<span class="badge live">LIVE · SAM 3.1 + SPARK</span>';
    return '<span class="badge demo">DEMO · SYNTHETIC TRACKING (NO API KEYS)</span>';
  }

  function renderResults() { renderResultsFrom(S.result, S.mode); }

  function renderResultsFrom(result, source) {
    S.result = result; S.mode = source;
    S.chat = { log: [], busy: false };
    S.moments = null;
    $("results").hidden = false;

    var seg = "";
    if (result.video && result.video.segment) {
      seg = " · segment " + fmtS(result.video.segment.start_s) + "–" + fmtS(result.video.segment.end_s) +
        " of " + fmtS(result.video.segment.raw_duration_s);
    }
    $("res-summary").innerHTML = esc(result.summaryText || "Stats ready") +
      (result.confidence ? '<span class="tag">' + esc(result.confidence) + " tracking</span>" : "");
    $("res-meta").innerHTML = esc(result.label || "") +
      (result.duration ? " · analyzed " + esc(result.duration) : "") + seg +
      " · " + modeBadge(result, source) +
      (source === "job" && S.job && S.job.id
        ? ' · <a class="st-c" style="color:var(--cyan);font-size:12px" target="_blank" rel="noopener" href="/api/jobs/' +
          esc(S.job.id) + '/code">open analysis code ↗</a>' : "");

    $("res-kpis").innerHTML = (result.kpis || []).map(function (k) {
      return '<div class="kpi"><b>' + esc(k.value) + "<small>" + esc(k.unit || "") + "</small></b><span>" +
        esc(k.label) + "</span><i>" + esc(k.sub || "") + "</i></div>";
    }).join("");

    var vals = Object.keys(result.players || {}).map(function (k) { return result.players[k]; });
    var maxD = 1;
    vals.forEach(function (p) {
      var d = parseFloat(p.distance) || 0; if (d > maxD) maxD = d;
    });
    $("res-players").innerHTML = vals.slice(0, 8).map(function (p) {
      var d = parseFloat(p.distance) || 0;
      var pct = Math.max(6, Math.round(d / maxD * 100));
      return '<div class="pl-row"><span class="pl-id">' + esc(p.id) + '</span>' +
        '<div class="pl-bar-wrap"><div class="pl-name"><span>' + esc((p.name || "").replace(/^'?\w+ ?· ?/, "").replace(/^P\d+ ?· ?/, "") || "Tracked") +
        '</span><span>' + esc(p.sprints || 0) + " sprint" + (parseInt(p.sprints, 10) === 1 ? "" : "s") + "</span></div>" +
        '<div class="pl-bar"><div class="pl-fill" style="width:' + pct + '%"></div></div></div>' +
        '<div class="pl-nums"><b>' + esc(p.distance) + "</b><span>" + esc(p.topSpeed) + "</span></div></div>";
    }).join("");

    var an = result.analysis || {};
    $("res-tactical").innerHTML = (an.tactical || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("res-forward").textContent = an.forward ? "➜ " + an.forward : "";
    $("res-note").textContent = an.note || "";

    $("codebtn").hidden = !(source === "job" && S.job && S.job.id);
    if (source === "job" && S.job && S.job.id) $("codebtn").href = "/api/jobs/" + S.job.id + "/code";
    $("momres").innerHTML = ""; $("planres").innerHTML = ""; $("liveres").innerHTML = "";
    $("chatlog").innerHTML = ""; S.chat.log = [];
    renderChatSuggest();

    if (window.__sampleTimer) { clearInterval(window.__sampleTimer); window.__sampleTimer = null; }
    if (S.live && S.live.int) { clearInterval(S.live.int); S.live = null; }

    buildLive();  // video opens and plays with the results — never hidden behind a click
    $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ================= moments ================= */
  $("mombtn").addEventListener("click", function () {
    var q = $("momq").value.trim();
    if (S.mode === "sample") return sampleMoments(q);
    if (!S.job || !S.job.id) return;
    var res = $("momres");
    res.innerHTML = '<div class="msg">Searching tracking data…</div>';
    fetch("/api/jobs/" + S.job.id + "/moments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.detail) { res.innerHTML = '<div class="err-box">✕ ' + esc(typeof j.detail === "string" ? j.detail : "search failed") + "</div>"; return; }
      S.moments = j.moments;
      res.innerHTML = j.moments.map(momentHtml).join("");
    }).catch(function (e) { res.innerHTML = '<div class="err-box">✕ ' + esc(e.message) + "</div>"; });
  });
  $("momq").addEventListener("keydown", function (e) { if (e.key === "Enter") $("mombtn").click(); });

  function momentHtml(m, i) {
    return '<div class="mom" data-i="' + i + '"><span class="st-t">' + fmtS(m.start_s) + " – " + fmtS(m.end_s) +
      '</span><span class="st-l">' + esc(m.label) + '</span><div class="st-d">' + esc(m.description) + "</div>" +
      '<button class="st-w" data-mom="' + i + '">▶ Watch clip</button>' +
      '<a class="st-c" target="_blank" rel="noopener" href="' + cardHref(m) + '">Share card ↗</a></div>';
  }
  function cardHref(m) {
    if (S.mode === "sample") return SD().cardFile;
    return "/api/jobs/" + S.job.id + "/card?start=" + m.start_s + "&end=" + m.end_s;
  }
  function clipHref(m) {
    if (S.mode === "sample") return SD().video + "#t=" + m.start_s + "," + m.end_s;
    return "/api/jobs/" + S.job.id + "/clip?start=" + m.start_s + "&end=" + m.end_s;
  }

  $("momres").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-mom]") : null;
    if (!b) return;
    var i = parseInt(b.getAttribute("data-mom"), 10);
    var m = (S.moments || [])[i];
    if (!m) return;
    var box = b.closest(".mom");
    var old = box.querySelector("video");
    if (old) { old.remove(); b.textContent = "▶ Watch clip"; return; }
    var v = document.createElement("video");
    v.controls = true; v.src = clipHref(m); v.preload = "metadata";
    box.appendChild(v);
    b.textContent = "✕ Hide clip";
  });

  function sampleMoments(q) {
    var res = $("momres");
    var ms = SD().moments;
    S.moments = ms;
    res.innerHTML = '<div class="msg">Searching tracking data…</div>';
    setTimeout(function () {
      res.innerHTML = ms.map(momentHtml).join("") +
        '<div class="an-note">Moment search replays the verified sample run. Analyze your own video for live search.</div>';
    }, 550);
  }

  /* ================= training plan ================= */
  $("planbtn").addEventListener("click", function () {
    var res = $("planres");
    if (res.innerHTML) { res.innerHTML = ""; return; }
    if (S.mode === "sample") {
      var p = SD().plan;
      res.innerHTML = planHtml(p) +
        '<div class="plan-note">Plan replays the verified sample run. Analyze your own video for a plan built from your match.</div>';
      return;
    }
    if (!S.job || !S.job.id) return;
    res.innerHTML = '<div class="msg">Building plan from this match\u2019s weaknesses…</div>';
    fetch("/api/jobs/" + S.job.id + "/plan").then(function (r) { return r.json(); }).then(function (p) {
      if (p.detail) { res.innerHTML = '<div class="err-box">✕ ' + esc(typeof p.detail === "string" ? p.detail : "plan failed") + "</div>"; return; }
      res.innerHTML = planHtml(p);
    }).catch(function (e) { res.innerHTML = '<div class="err-box">✕ ' + esc(e.message) + "</div>"; });
  });

  function planHtml(p) {
    return '<div class="plan-box"><div class="panel-title" style="color:#7DA2FF">Weekly training plan</div>' +
      '<div class="st-f">' + (p.focus || []).map(esc).join(" · ") + "</div>" +
      (p.sessions || []).map(function (s) {
        return '<div class="plan-sess">' + esc(s.day) + " — " + esc(s.title) + "</div>" +
          (s.drills || []).map(function (d) {
            return '<div class="plan-drill">• <i>' + esc(d.name) + "</i> (" + esc(d.duration_min) + " min) — " + esc(d.why) + "</div>";
          }).join("");
      }).join("") +
      (p.note ? '<div class="plan-note">' + esc(p.note) + "</div>" : "") + "</div>";
  }

  /* ================= live replay ================= */
  function buildLive() {
    var res = $("liveres");
    var videoSrc, sample = S.mode === "sample";
    if (sample) videoSrc = SD().video;
    else if (S.job && S.job.id) videoSrc = "/api/jobs/" + S.job.id + "/video";
    else return;
    res.innerHTML = '<div class="live-box"><div class="live-head">' +
      '<span class="badge ' + (sample ? "sample" : "live") + '">LIVE REPLAY</span>' +
      '<span class="dim" style="font-size:11px">tactical whispers computed from tracking as the match replays</span></div>' +
      '<video id="livevid" controls preload="metadata" src="' + videoSrc + '"></video>' +
      '<div class="tick" id="livetick">waiting for playback…</div></div>';
    var vid = $("livevid"), tick = $("livetick");
    var attemptPlay = function () {
      var p = vid.play();
      if (p && p.catch) p.catch(function () {
        vid.muted = true;
        var p2 = vid.play();
        if (p2 && p2.catch) p2.catch(function () {});
      });
    };
    attemptPlay();
    vid.addEventListener("canplay", function () { attemptPlay(); }, { once: true });
    var whisperAt = function (t) {
      if (sample) {
        var best = null;
        (SD().whispers || []).forEach(function (w) {
          if (w.t <= t + 2 && (!best || w.t > best.t)) best = w;
        });
        tick.textContent = "💬 " + (best ? best.text : "match starting…");
        return;
      }
      fetch("/api/jobs/" + S.job.id + "/whisper?t=" + t.toFixed(1))
        .then(function (r) { return r.json(); })
        .then(function (w) { tick.textContent = "💬 " + (w.text || ""); })
        .catch(function () {});
    };
    if (S.live && S.live.int) clearInterval(S.live.int);
    S.live = { int: null };
    vid.addEventListener("play", function () {
      if (S.live.int) clearInterval(S.live.int);
      S.live.int = setInterval(function () { whisperAt(vid.currentTime || 0); }, sample ? 1500 : 4000);
      whisperAt(vid.currentTime || 0);
    });
    vid.addEventListener("pause", function () {
      if (S.live.int) { clearInterval(S.live.int); S.live.int = null; }
    });
  }

  $("livebtn").addEventListener("click", function () {
    var res = $("liveres");
    if (res.innerHTML) {
      res.innerHTML = "";
      if (S.live && S.live.int) { clearInterval(S.live.int); S.live = null; }
      return;
    }
    buildLive();
  });

  /* ================= chat ================= */
  $("chat-send").addEventListener("click", chatSend);
  $("chat-in").addEventListener("keydown", function (e) { if (e.key === "Enter") chatSend(); });

  function renderChatSuggest() {
    var box = $("chat-suggest");
    var qs = S.mode === "sample" ? SD().chat.map(function (c) { return c.q; }).slice(0, 4) : [
      "Why did we look weak in the second half?",
      "Who worked the hardest?",
      "What should we train this week?",
      "Who was the fastest player?",
    ];
    box.innerHTML = qs.map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + "</button>"; }).join("");
  }
  $("chat-suggest").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-q]") : null;
    if (!b) return;
    $("chat-in").value = b.getAttribute("data-q");
    chatSend();
  });

  function chatSend() {
    var input = $("chat-in");
    var msg = input.value.trim();
    if (!msg || S.chat.busy) return;
    if (S.mode === "sample") return sampleChat(msg);
    if (!S.job || !S.job.id) return;
    S.chat.busy = true;
    S.chat.log.push({ who: "you", text: msg });
    input.value = "";
    renderChat("…thinking");
    fetch("/api/jobs/" + S.job.id + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      S.chat.busy = false;
      S.chat.log.push({ who: "analyst", text: j.reply || "no answer", mode: j.mode });
      renderChat();
    }).catch(function (e) {
      S.chat.busy = false;
      S.chat.log.push({ who: "analyst", text: "chat failed: " + e.message, mode: "error" });
      renderChat();
    });
  }

  function sampleChat(msg) {
    S.chat.busy = true;
    S.chat.log.push({ who: "you", text: msg });
    $("chat-in").value = "";
    renderChat("…thinking");
    setTimeout(function () {
      S.chat.busy = false;
      var words = msg.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 3; });
      var best = null, bs = 0;
      SD().chat.forEach(function (c) {
        var s = 0;
        c.q.toLowerCase().split(/\W+/).forEach(function (w) { if (words.indexOf(w) !== -1) s++; });
        if (s > bs) { bs = s; best = c; }
      });
      S.chat.log.push(best
        ? { who: "analyst", text: best.a, mode: best.mode }
        : { who: "analyst", mode: "replay", text: "This replay ships with a fixed Q&A set — try one of the suggested questions below, or analyze your own video to ask anything." });
      renderChat();
    }, 700);
  }

  function renderChat(thinking) {
    var log = $("chatlog");
    log.innerHTML = S.chat.log.map(function (m) {
      return '<div class="' + (m.who === "you" ? "q" : "a") + '">' + esc(m.text) +
        (m.mode ? "<small>[" + esc(m.mode) + "]</small>" : "") + "</div>";
    }).join("") + (thinking ? '<div class="a">' + esc(thinking) + "</div>" : "");
    log.scrollTop = log.scrollHeight;
  }

  /* ================= export CSV ================= */
  $("csvbtn").addEventListener("click", function () {
    var r = S.result;
    if (!r || !r.players) return;
    var rows = [["player", "name", "distance", "top_speed", "sprints"]];
    Object.keys(r.players).forEach(function (k) {
      var p = r.players[k];
      rows.push([p.id, p.name, p.distance, p.topSpeed, p.sprints]);
    });
    var csv = rows.map(function (row) {
      return row.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "statcam_stats.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ================= sample replay ================= */
  function playSample(sport) {
    if (sport) S.sampleSport = sport;
    showTab("sample");
    S.phase = "running"; S.mode = "sample";
    var D = SD();
    S.job = { progress: 2, message: "Replaying verified run…", agent_log: [] };
    var i = 0;
    $("status").innerHTML = '<div class="bar"><div class="bar-fill" style="width:4%"></div></div><div class="msg">Replaying verified run…</div><div class="timeline" id="samt1"></div>';
    if (window.__sampleTimer) clearInterval(window.__sampleTimer);
    window.__sampleTimer = setInterval(function () {
      S.job.agent_log = D.job.agent_log.slice(0, ++i);
      var pct = Math.min(96, 4 + i * 22);
      $("status").innerHTML = '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div><div class="msg">' +
        esc(i < D.job.agent_log.length ? D.job.agent_log[i - 1].text : "Composing dashboard…") + "</div>" +
        timelineHtml(S.job.agent_log, 10);
      var tl = document.querySelector("#status .timeline");
      if (tl) tl.scrollTop = tl.scrollHeight;
      if (i >= D.job.agent_log.length) {
        clearInterval(window.__sampleTimer);
        window.__sampleTimer = null;
        S.phase = "done";
        S.job = D.job;
        setTimeout(function () {
          $("status").innerHTML = timelineHtml(D.job.agent_log, 10);
          renderResultsFrom(D.result, "sample");
        }, 450);
      }
    }, 720);
  }
  [["go-sample-soccer", "soccer"],
   ["go-sample-basketball", "basketball"],
   ["go-sample-running", "running"]].forEach(function (pair) {
    var b = $(pair[0]);
    if (!b) return;
    if (!SAMPLE_DATA[pair[1]]) b.disabled = true;
    b.addEventListener("click", function () { playSample(pair[1]); });
  });
  $("hero-sample").addEventListener("click", function () {
    document.getElementById("analyze").scrollIntoView({ behavior: "smooth" });
    playSample(S.sampleSport || "soccer");
  });
})();
