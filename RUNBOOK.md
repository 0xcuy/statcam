# StatCam — Agent Runbook (INTERNAL — jangan dipublikasikan)

Dokumen ini briefing untuk agen yang melanjutkan pekerjaan StatCam. BUKAN dokumen publik: jangan salin ke folder `out/`, jangan tautkan dari UI.

## Apa itu StatCam
- Entry SIERA Labs untuk **Meta Global AI Developer Hackathon** ($1M prize pool, virtual, worldwide).
- Tagline: "Point a camera at any game, get pro-level sports stats."
- Cara kerja: user upload video pertandingan amatir → SAM 3.1 men-tracking pemain/bola → Muse Spark menganalisis & menyusun statistik level pro → dashboard. Tanpa signup, tanpa login; landing = aplikasinya; ada tombol "try sample file".
- Track: **Indie**. Theme: **Push the Frontier**.
- Yang dinilai juri: model Meta harus TAK TERGANTIKAN (bukan API tempelan), terbaca dalam 90 detik, berfungsi end-to-end beneran, AI-nya memang dibutuhkan.

## Status (21 Okt 2026)
- Registrasi: **APPROVED** — email Cerebral Valley ke sieralabs@gmail.com, 20 Okt 2026 15:40 WIB. Ini final; jangan perdebatkan lagi.
- Frontend LIVE: https://statcam.sieralabs.com (container `siera-statcam`, nginx, static export).
- Backend: **ONLINE sejak 21 Okt 2026 — DUA URL hidup**: (1) `https://api.statcam.sieralabs.com` URL utama — user tambah record A DNS-only (167.99.67.93) di Cloudflare 21 Okt, cert LE sudah dipegang Traefik sejak 14 Okt; (2) fallback `https://statcam.sieralabs.com/api` via file dynamic Traefik terpisah. Frontend memakai relative `/api` (same-origin) — keduanya tetap jalan.
  - Fix (±2 menit, HANYA bisa user, dari HP): Coolify → Applications → `siera-statcam-api` → **Domains** → pastikan `https://api.statcam.sieralabs.com` terdaftar (tambahkan bila hilang) → **Redeploy** (bukan Restart). Setelah itu verifikasi publik: GET /api/health harus 200.
- Keys: META_API_KEY + E2B_API_KEY dimasukkan USER sendiri di /admin/keys (ADMIN_TOKEN) — langsung dari HP ke disk VPS. **JANGAN PERNAH minta keys/token/private key lewat chat.**

## Timeline (resmi, dari halaman event)
- 26 Okt 09:00 ET: kickoff livestream; hacking dimulai.
- 27 Okt – 4 Nov: workshop Meta + partner, office hours di Discord.
- **4 Nov 21:00 ET (= 5 Nov 09:00 WIB): submisi tutup.**
- 4–8 Nov: judging. 9 Nov: finals + pengumuman pemenang.

## Arah build (keputusan 20–21 Okt 2026 — ini "kita melangkah ke mana")
- Konsep TIDAK diganti. Yang dinaikkan kelasnya: **peran Spark**.
- Sekarang Spark kerja di belakang layar (codegen statistik). Itu aman tapi tidak terlihat frontier. Meta memberi Spark series, Muse Image, SAM 3.1, Muse Code + kredit partner (Baseten $100, Modal $100, Fireworks $25 — peserta terpilih) karena mereka mencari SHOWCASE: proyek yang membuktikan model Meta bisa hal yang model lain tidak bisa.
- Target build 26 Okt – 4 Nov: Spark menjadi **analis yang terlihat berpikir** — bacaan taktis (kenapa sebuah play berhasil/gagal), koreksi diri di agent timeline saat data baru masuk, saran ke depan (forward-looking), bukan sekadar ringkasan masa lalu.
- **Ingest v2 (keputusan user 21 Okt):** selain upload file, user bisa tempel LINK video (YouTube / URL video langsung) → backend unduh → pilih segmen menit yang dianalisis (video panjang WAJIB dipotong per segmen; jangan proses full match) → masuk pipeline yang sama. Alasan: nol friksi; juri/user bisa tempel link pertandingan amatir mana pun. Demo judging tetap cached track — link ingest untuk user beneran & kesan pertama.
- **Kandidat upgrade ambisi (dibahas 21 Okt, urutan setelah Spark-analis + ingest v2):**
  0. **ELEMEN GILA — Analis Live di Pinggir Lapangan:** BUKAN cuma analisis pasca-pertandingan. Kamera HP mengarah ke lapangan saat pertandingan berjalan; SAM 3.1 tracking kontinu; Spark membisikkan saran taktis real-time ke pelatih ("sisi kananmu jebol tiga kali — geser gelandangmu sekarang"). Ini pembeda kelas "kedengeran mustahil". Berat secara teknis — versi build-window yang JUJUR: feed pertandingan (rekaman diputar sebagai live) + bisikan taktis berkala yang benar-benar dihitung dari tracking. Jangan klaim real-time murni bila implementasinya berkala.
  1. **Tanya Analisnya** — chat dengan Spark di atas data tracking pertandingan itu ("kenapa babak kedua kami runtuh?"); sinyal SI terkuat: berpikir, bukan melaporkan.
  2. **Cari Momen + Highlight Otomatis** — pencarian momen pakai bahasa alami (SAM 3.1 + Spark) → klip terpotong otomatis + kartu laporan visual Muse Image siap bagikan; mesin adopsi/viral liga komunitas.
  3. **Rencana Latihan dari Satu Video** — Spark menyusun drill minggu depan dari kelemahan yang ditemukan; tema Build for Your World; alasan pelatih balik tiap minggu.
- Money shot demo: **"nonton dia kerja"** — live timeline, plan-first, self-correction terlihat.
- Aturan demo (keputusan user): demo judging memakai **cached track yang sudah terverifikasi**; jalur API live TIDAK PERNAH disentuh juri.
- Aturan UI (keputusan user 15 Okt): setiap elemen UI wajib berfungsi end-to-end, bukan hiasan. Infra tetap di luar UI — bahasa manusia saja di permukaan; teknologi hanya di docs/GitHub.

## Arsitektur & lokasi
- Source lokal: `~/workspace/siera-labs/meta-hackathon/statcam/` (Next.js static export) + `statcam-api/` (FastAPI). Plan: `~/workspace/siera-labs/meta-hackathon/plan.md`.
- VPS: publik 167.99.67.93, Tailscale 100.80.58.67 (root). Project dir di VPS: `/opt/siera-statcam/` (Dockerfile + `out/`); API data volume: `/opt/siera-statcam-api/data`.
- Pipeline backend: ingest → frames → track (SAM 3.1) → codegen (Spark) → execute (E2B) → finalize. Mode jujur `needs_keys` bila keys belum ada — JANGAN fabrikasi hasil tracking.
- File ini tinggal di `/opt/siera-statcam/RUNBOOK.md` (di luar `out/`, tidak pernah ter-serve) + salinan di container `siera-statcam:/RUNBOOK-AGENT.md` (salinan container hilang saat redeploy; salinan host yang permanen).

---

## ADDENDUM 21 Okt 2026 — Fix backend ONLINE (oleh agent via SSH root)

**Root cause sebenarnya BUKAN rute Traefik hilang.** Origin router sudah jalan (docker labels `sapi-*` di container; uji bypass CF: `curl --resolve api.statcam.sieralabs.com:443:127.0.0.1 https://api.statcam.sieralabs.com/api/health` = 200). Yang rusak: **Cloudflare universal cert `*.sieralabs.com` hanya cover 1 level subdomain** — `api.statcam.sieralabs.com` (2 level) gagal TLS handshake di edge (SSL alert 40) SEBELUM menyentuh origin. Makanya restart/redeploy Coolify tidak akan pernah menolong.

**Fix yang dipasang (jalan tanpa sentuh Cloudflare):**
1. File dynamic Traefik terpisah: `/data/coolify/proxy/dynamic/statcam-api-path.yaml` — rute `Host(statcam.sieralabs.com) && PathPrefix(/api)` → `http://siera-statcam-api:8000`. Host statcam ter-coverage wildcard CF. File ini TIDAK ikut ke-regenerate Coolify (bukan coolify.yaml).
2. Frontend bundle di-patch: `page-4a5516d9119df9f4.js`, string base `"https://api.statcam.sieralabs.com"` → `""` (relative `/api`, same-origin, CORS aman). Ter-deploy ke: container jalan (docker cp), `out/` di host, dan image rebuild `siera-statcam:latest` (sha256:21d55038b881...). Source web lokal: salinan di mesin agent.
3. Verifikasi 21 Okt: /api/health 200 publik via CF, POST /api/jobs → 422 validasi normal (FastAPI hidup), halaman render penuh di browser, bundle bersih dari URL lama.

**Kondisi sekarang:** app end-to-end jalan di https://statcam.sieralabs.com (upload → pipeline → dashboard). Tombol "Try a sample" = flow demo client-side pre-verified (by design, sesuai aturan demo cached track) — tidak memanggil API, bukan bug.

**Opsional untuk kembalikan URL api.statcam.sieralabs.com (butuh user, 1 klik di Cloudflare):** set record DNS api.statcam ke **DNS only (grey cloud)** → Traefik certresolver letsencrypt akan issue cert origin otomatis. Alternatif: aktifkan ACM/Total TLS. Setelah itu boleh revert patch frontend (atau biarkan relative — tetap jalan).

**Tetap berlaku:** keys dimasukkan USER sendiri di /admin/keys (ADMIN_TOKEN). /api/health saat ini: meta_configured=false, e2b_configured=false — menunggu keys.

### UPDATE 21 Okt (lanjutan) — URL utama api.statcam.sieralabs.com HIDUP
User menambah record DNS di Cloudflare: A api.statcam -> 167.99.67.93, Proxy OFF (DNS only). Record spesifik menimpa wildcard `*` untuk hostname itu, jadi traffic langsung ke VPS (tidak lewat edge CF lagi). Verifikasi: DNS fresh via 1.1.1.1 = 167.99.67.93; GET /api/health = 200 (0.11s); cert LE CN=api.statcam.sieralabs.com (issuer Let's Encrypt YR1, notBefore 14 Okt — Traefik sudah memegangnya sejak router dibuat); POST /api/jobs = 422 validasi normal. Patch frontend relative /api TIDAK di-revert — jalur same-origin tetap jalan dan lebih tahan banting kalau suatu saat wildcard proxy dinyalakan lagi.

---

## ADDENDUM 21 Okt 2026 (2) — CHUNK 1 & 2 BUILD WINDOW: INGEST V2 SHIPPED

**Chunk 1 — Ingest v2 backend (TERVERIFIKASI e2e):**
- `POST /api/jobs` sekarang menerima `source_url` (+ `seg_start`/`seg_end` detik) ALIAS file upload. Validasi: file XOR url.
- Modul baru `app/ingest.py`: direct media URL di-stream via httpx (cap 200 MB); link halaman (YouTube dkk) via **yt-dlp** (terpasang di container + requirements.txt), format ≤720p, cap 200 MB.
- Aturan runbook ditegakkan: video >600s otomatis dianalisis segmen pertama 10 menit; segmen user di-honor & di-clamp; `-c copy` cut (anchor keyframe).
- Progress jujur per stage: "Downloading video… X/Y MB" → "Cutting segment Xs–Ys…" → pipeline lama.
- `/api/health` + field `link_ingest: true`, `yt_dlp: true`.
- Deploy API: docker cp app → container + pip install yt-dlp + restart; source persist di `/opt/siera-statcam-api/statcam-api/` (Dockerfile & requirements ikut update).
- BUKTI: job via link sample (20s, segmen 5–12s → analyzed 7.2s) DONE; **job via link YouTube beneran terunduh** (raw 213.1s → segmen 0–30s) DONE; regresi upload file DONE.

**Chunk 2 — UI "Analyze a link" (TERVERIFIKASI di browser):**
- KENDALA BESAR: source Next.js ada di mesin lain → tidak bisa rebuild app. Solusi: widget vanilla-JS self-contained (`web/link-ingest.js`) yang DI-CONCAT ke `page-4a5516d9119df9f4.js` (chunk yang selalu dimuat; script tag terpisah di index.html DIBUANG karena hydration Next App Router menghapusnya).
- PENTING soal cache: chunk di-patch tanpa ganti nama file → **CF edge cache HIT stelah patch = stale**. Solusi tiap deploy: bump query di index.html (`page-…js?v=N`, sekarang **v=5**) + origin kini kirim `Cache-Control: no-cache` (web Dockerfile & conf container berubah).
- GOTCHA lain: ada listener capture di document yang `stopPropagation()` semua klik (juga yang trusted!) — turunan event ke elemen dalam card mati; React selamat karena delegasinya juga di document. Widget memasang handler click/keydown di **document capture** sebagai jalur utama. Jangan pindahkan ke root-level saja.
- Posisi: sisip setelah dashed dropzone box (di dalam card putih); MutationObserver re-inject kalau React menghapus.
- Hasil card: ringkasan + KPI + top-5 pemain + label mode jujur ("DEMO · SYNTHETIC TRACKING (NO API KEYS)" / "LIVE · SAM 3.1 + SPARK + E2B") + info segmen.
- BUKTI browser: tempel link sample + segmen 3–9 → progress bar → result card tampil (job 5c58467be0e2, 100%).

**Masih terbuka (chunk berikutnya):** Spark analis terlihat-berpikir, Tanya Analisnya (chat), Cari Momen/Highlight, Rencana Latihan, analis live. Keys belum dipasang (tugas user di /admin/keys).

---

## ADDENDUM 21 Okt 2026 (3) — CHUNK 3 & 4: SPARK ANALYST + ASK THE ANALYST SHIPPED

**Chunk 3 — Agent timeline + tactical reads (TERVERIFIKASI):**
- Pipeline kini **plan-first**: setiap job membuka `agent_log` dengan rencana eksplisit (① download/ingest → ② frames → ③ track → ④ codegen → ⑤ execute → ⑥ dashboard), lalu setiap stage menambah event.
- **Self-correction NYATA** (bukan teater) — koreksi hanya muncul kalau kondisinya benar-benar terjadi: segmen melebihi durasi video (di-clamp), video >10 menit (rencana diubah ke segmen), source <20 fps, track <4 objek.
- `analyze_stats()` menghitung bacaan taktis dari angka tracking asli (engine workload, speed profile, work-rate spread, sprint volume) + saran forward-looking. Tersimpan di `result.analysis` + `_raw_stats` (untuk chat).
- Timeline tampil di widget saat running DAN tetap terlihat setelah done ("watch it think").

**Chunk 4 — Ask the Analyst (TERVERIFIKASI):**
- Endpoint `POST /api/jobs/{id}/chat` {message} → `{reply, mode}`.
- Mode "computed": rule-engine menjawab dari angka asli job (jarak/kecepatan/sprint/why/latihan/profil pemain by id). Mode naik otomatis ke **Spark** (META_API_KEY) atau LLM lain (LLM_API_KEY) begitu keys ada; gagal → fallback computed dengan catatan jujur.
- Bug yang ditemukan & diperbaiki saat verifikasi: stats adalah dict bukan list (`stats["players"]`); import `llm` harus dari `.providers`; pencocokan id pemain pakai word-boundary regex ("P1" tidak lagi menjawab pertanyaan tentang "P10").

**UI (semua widget): BAHASA INGGRIS SAJA — aturan user (sama seperti Avera).** Chat Indonesia boleh untuk agent-user, tapi teks yang tampil di situs harus English. Judul "Tanya Analisnya" sudah jadi "Ask the Analyst".

**Deploy state:** widget v8 (chunk `page-4a5516d9119df9f4.js?v=8`); verifikasi browser penuh: link → timeline live → result → analyst → chat answer, semua dari UI. Contoh jawaban chat: "Forward-looking: the gap between top and median is your biggest lever — drill collective pressing…"

**Sisa backlog:** Cari Momen + Highlight otomatis, Rencana Latihan (versi Spark penuh), analis live pinggir lapangan. Keys belum dipasang (tugas user).

---

## ADDENDUM 21 Okt 2026 (4) — CHUNK 5: CARi MOMEN + HIGHLIGHTS + TRAINING PLAN + LIVE REPLAY SHIPPED

**Backend (modul `app/insights.py`, semua computed dari tracks.json asli):**
- `POST /api/jobs/{id}/moments` {query} — pencarian momen bahasa natural via intent routing (speed/chaos/space/calm/highlight): jendela 5 detik diskor dari metrik NYATA (puncak kecepatan + siapa, jumlah sprint, kecepatan bola, sebaran blok), top-3 non-overlap. Bug diperbaiki saat verifikasi: filter non-overlap tadinya membuang jendela sebelum pilihan teratas.
- `GET /api/jobs/{id}/clip?start=&end=` — klip otomatis dipotong ffmpeg `-c copy` dari source.mp4 (cache ke clips/, maks 15s).
- `GET /api/jobs/{id}/video` — video segmen teranalisis utuh (sumber live replay).
- `GET /api/jobs/{id}/card?start=&end=` — kartu laporan SVG siap-bagikan (angka nyata, footer jujur).
- `GET /api/jobs/{id}/plan` — rencana latihan mingguan dari kelemahan nyata (work-rate gap, sprint volume, floor pemain) → 3 sesi dengan drill + alasan berbasis angka. Spark-ready: naik kelas saat keys ada.
- `GET /api/jobs/{id}/whisper?t=` — bisikan taktis live-replay pada detik t (zona bola, intensitas, sebaran blok + nasihat). Bug diperbaiki: variabel `m` tidak ter-assign di cabang default endpoint card.
- Semua diberi label "computed" + catatan upgrade Spark dengan keys. TIDAK ada yang difabrikasi.

**Widget v9 (chunk `?v=9`):** toolbar hasil: [Search moments] [Training plan] [▶ Live replay]. Momen → kartu dengan deskripsi metrik + tombol Watch clip (pemutar video inline dari endpoint clip) + Share card (SVG tab baru). Plan → render 3 sesi. Live replay → pemutar video gelap + ticker bisikan polling per 4s mengikuti currentTime (pause = tick berhenti).

**Verifikasi:** curl (moments 3 jendela, clip 200 mp4 808KB, card SVG 200, plan 3 sesi, whisper t=12) + browser penuh: cari momen → 2 kartu → Watch clip memutar video asli → plan render → live replay ticker "t+8s — ball in the attacking third…" sinkron waktu.

**Sisa backlog:** tinggal full-Spark versions (butuh keys) + polish demo. Kanvas build window 26 Okt–4 Nov sudah berisi semua kandidat runbook kecuali skala besar (analis live dengan feed kamera sungguhan).

---

## ADDENDUM 21 Okt 2026 (5) — FOOTER: "POWERED BY META AI" (keputusan branding)

**Keputusan user + agent: hapus jejak hackathon dari landing, jangan pakai logo pihak ketiga.**
- "Inference partners · Meta Global AI Developer Hackathon" DIHAPUS dari footer publik. Alasan: (1) memberi kesan "proyek hackathon" ke juri; (2) aturan UI runbook: infra/teknologi di docs, bukan permukaan. Konteks hackathon cukup lewat submission form.
- Link Baseten/Modal/Fireworks DIHAPUS dari landing — mereka penyedia KREDIT hackathon, bukan partner komersial StatCam; memakai logo/nama sebagai "partner" = klaim yang tidak benar (risiko trademark + terlihat amatir). Kredit mereka tetap disebut di docs/submission.
- DIGANTI strip tier-1: "POWERED BY META AI MODELS" + tiga item teks non-link: "SAM 3.1 · Vision tracking", "Muse Spark · Match intelligence", "E2B · Verified execution". Ini justru memenuhi kriteria juri "model Meta tak tergantikan".
- Baris bawah tetap: "StatCam BETA — by SIERA Labs · Powered by Muse Spark + SAM 3.1".
- Implementasi: patch string di page chunk + index.html SSR (identik, anti hydration-mismatch); anchor <a> partner diganti <span> di kedua tempat. Widget chunk sekarang **v=10**.
- CATATAN desain ulang lebih dalam (tier-1 penuh): butuh source Next.js (mesin lain); patch minified hanya untuk teks/kelas kecil.

---

## ADDENDUM 21 Okt 2026 (6) — TIER-1 POLISH LAYER (widget chunk v=11)

Lapisan polish global di-inject dari widget (`<style id="stcli-polish">` ke document.head, sekali di boot):
- `-webkit-font-smoothing: antialiased` + `text-rendering: optimizeLegibility` (ketajaman teks instan)
- `::selection` biru brand, scrollbar slim custom, `:focus-visible` ring brand, smooth scroll
- transisi mikro di semua button/a (cubic-bezier .18s) + press feedback `scale(.98)`
- heading tracking diperketat (h1 -.03em, h2 -.02em via !important karena kelas Tailwind menang atas selector elemen)
- glow ambient halus 6% biru di 320px atas via `body::after` (fixed, pointer-events none)

**PRINSIP: layer ini TIDAK override warna konten** — tema light/dark React aman keduanya (warna diatur React via kelas kondisional, bukan parent class). Verifikasi visual mode terang OK (screenshot). Toggle dark via automation tidak selalu memicu (klik otomatis kena actionability/stabilitas) — cek manual dari HP bila perlu.
Batasan jujur: overhaul visual besar (hero baru dsb) butuh source Next.js di mesin lain; patch minified hanya aman untuk teks/kelas kecil + CSS injection non-destruktif.

---

## ADDENDUM 21 Okt 2026 (7) — ROOT CAUSE "MODE MALAM MATI": TAG </script> TELAN — SUDAH DIPERBAIKI

**Gejala:** toggle dark mode (dan SEMUA klik React: sport buttons, nav, sample) tidak berfungsi.
**Diagnosis berlapis:** (1) klik React ditemukan diantrikan React 18 (stopPropagation dari react-dom fd9d1056 = mekanisme replay saat hydration belum selesai); (2) probe: tidak ada resource gagal, tidak ada crash eval chunk, semua chunk fresh via ?v=; (3) periksa sintaks SEMUA inline script index.html → **script flight terakhir SYNTAX ERROR "Invalid regular expression flags"**; (4) ekstrak + node --check: tag penutup `</script>` milik flight data **TELAN** — patch pertama (sisip `<script src="link-ingest.js">` sebelum `</body>`) memakai pola replace `</script></body></html>` yang mengonsumsi penutup flight, dan revert-nya tidak memulihkannya. Sejak patch pertama itu, hydration = mati total.
**FIX:** pulihkan `</script>` sebelum `</body></html>` di index.html (origin + container + image). Verifikasi: semua inline script parse OK, hydration selesai (marker `__reactFiber$` pada tombol), toggle LIGHT↔DARK jalan, sport button jalan, widget tetap ter-inject (kini hydration-gated).

**PELAJARAN KERAS UNTUK DEPLOY DEPAN:**
1. Edit index.html (SSR+flight) BERISIKO tinggi — tag script inline mudah telan. Setelah setiap edit index.html, WAJIB verifikasi: semua inline script `new Function(text)` parse OK (bisa via browser console).
2. Widget kini **hydration-gated** (v=12): injeksi DOM + polish style menunggu sinyal `__reactFiber$` — jangan injeksi DOM sebelum hydration selesai (memicu recovery loop + antrean klik).
3. Semua chunk kini dimuat dengan query `?v=N` di index.html (anti CF-stale); webpack runtime TIDAK memuat chunk via map (`d.u` kosong) — semua lewat script tag HTML.
4. Chunk `app/layout-*.js` TIDAK pernah direferensikan/dimuat (artefak build) — dulu mengandung sisa widget v2 karena revert gagal diam-diam; sudah dibersihkan. Pola strip marker concat: selalu pakai `\n;/* StatCam Link Ingest widget`, bukan pola lain.

---

## ADDENDUM 21 Okt 2026 (8) — AUDIT PENUH "NO MORE ERRORS" (hasil: bersih)

**Browser (dengan error capture + unhandledrejection + console.error hook):**
- 21 tombol + 3 link diuji: tema ×2, What is StatCam?, AI Pipeline, Toggle Menu, sport ×3 (checkmark pindah benar), Pause/Replay/Velocities, Export Data, Inspect CSV, audience buttons ×4, panel switcher (responsive-hidden = by design), Try a sample (elemen div demo ter-cache — by design, tanpa error)
- Alur widget penuh: link job → moments (2 kartu) → chat → plan → live replay → **NOL error**
- Temuan + fix: payload flight memuat URL chunk ?v=11 (sed global kemarin ikut mengganti URL DI DALAM JSON flight) → chunk dimuat dobel (v12 script tag + v11 flight). FIX: URL flight disamakan v=12; verifikasi performance resource = page chunk persis 1 load. PELAJARAN: saat bump ?v=, ganti SEMUA kemunculan (script src + flight), atau hindari sed global.

**API (19 kasus edge):** semua status benar (400 validasi, 404, 401 admin, 409, 200). Temuan + fix: `clip?start=-3` lolos (200) → kini 400 dengan validasi `0 <= start < end`. 5 Traceback lama di log = bug yang sudah diperbaiki hari ini; nol traceback baru.

**Status akhir: browser bersih, API bersih, log bersih.**

---

## ADDENDUM 21 Okt 2026 (9) — BACKEND DEEP DEBUG (hasil: 3 fix keamanan/robustness)

**Keamanan:**
- Path traversal job_id: AMAN (routing FastAPI menolak multi-segment).
- **SSRF via source_url: BOCOR -> DIPERBAIKI.** `source_url=http://169.254.169.254/...` atau `http://localhost:*` diterima dan diunduh server. Fix: `_assert_public_host()` di `app/ingest.py` — blokir localhost/.local/.internal + semua IP private/loopback/link-local/reserved; dicek pre-flight DAN per-redirect via httpx event hook; berlaku juga untuk jalur yt-dlp. Verifikasi: kedua URL internal kini failed dengan pesan jujur.
**Robustness:**
- **Download 403 dari banyak host (Google storage, w3schools) -> DIPERBAIKI:** httpx memakai UA `python-httpx` yang diblokir anti-bot; tambah User-Agent browser. Terverifikasi: video eksternal (w3schools mov_bbb.mp4) terunduh + segment + analyzed DONE.
- e2bexec: defensive `bytes.decode()` untuk `files.read` (kompatibilitas versi SDK).
**Konkurensi:** 3 job paralel -> semua selesai benar.
**Resource:** data 72 MB (24 job termasuk test), disk 297 GB free, RAM 13 GB free — sehat.

**Sisa catatan (non-blocking):** `_set` read-modify-write punya race kecil antara progress-download callback dan pipeline thread (bisa hilangkan 1 pesan progress, tidak fatal); whisper t > durasi menghasilkan zona "?" (kosmetik). Betulkan kalau sempat sebelum kickoff.

---

## ADDENDUM 21 Okt 2026 (10) — ITEM "KOSMETIK" DIPERBAIKI BERARTI

1. **Race `_set` -> thread-safe.** `jobs.py` kini punya `JOB_LOCK` + `update_job()` (read-modify-write terkunci) dan `append_log()` (append terkunci). `_set`/`_log` pipeline memakainya — progress download callback dan pipeline coroutine tidak lagi saling menimpa; `agent_log` dijamin utuh. Regresi: timeline job = plan → frames → track → codegen → analyze, urutan lengkap.
2. **Whisper di luar durasi -> klem + jujur.** t<0 → 0; t>durasi → klem ke durasi dengan prefix "[end of segment — Xs analyzed]". Verifikasi t=-5 / 5 / 999 semuanya memberi data nyata tanpa zona "?".
Regresi penuh setelah deploy: chat/plan/moments 200, nol traceback baru.

---

## ADDENDUM 21 Okt 2026 (11) — OPS: GIT + WATCHDOG + TEST SUITE (item c selesai)

**Git (VPS):**
- `/opt/siera-statcam-api/statcam-api` — repo API (baseline bb59629 + tests e34873e)
- `/opt/siera-statcam` — repo Web (out/ + widget + RUNBOOK.md, baseline ebb1497)
- Commit tiap kali ubah kode/deploys. Salinan mirror di mesin agent (Kebutuhan PC/siera-statcam).

**Watchdog:** `/opt/siera-statcam/watchdog.sh` via cron `*/5 * * * *` (root) → log `/var/log/siera-statcam-watchdog.log`. Cek internal (docker exec health) + publik (api.statcam + statcam /api/health). Internal gagal → auto `docker restart siera-statcam-api` + baris ALERT; routing gagal tanpa kontainer sehat → WARN; sehat → OK.

**Test suite:** `/opt/siera-statcam-api/tests/test_smoke.py` (stdlib only, jalankan di VPS: `python3 tests/test_smoke.py`) — **22/22 PASS**: health, validasi (400/404/401), traversal, pipeline penuh via link (timeline plan-first, segmen, analysis), chat/moments/clip/card/video/plan/whisper (incl. klem), SSRF guard. Jalankan sebelum & sesudah tiap deploy. (Satu kegagalan awal = bug di test sendiri: `s, _ = req(...)` men-shadow body — diperbaiki.)

---

## ADDENDUM 31 Okt 2026 — TIER A FRONTEND REBUILD (frontend source kini ADA di lokal)

**Konteks:** UI lama = React build tanpa source (semua fitur baru lewat widget concat + patch minified). User meminta UI "Tier A untuk menang". Keputusan: **rebuild total sebagai static site vanilla** (tanpa framework, tanpa build step) — semua fitur dipindah ke kode yang kita pegang penuh.

**Sumber baru (master copy):** `/home/cucu/Kebutuhan PC/siera-statcam/web-tierA/` — index.html, styles.css, app.js, sample-data.js, favicon.svg, 404.html, 50x.html, samples/. Deploy = rsync ke `/opt/siera-statcam/out/` + docker cp + rebuild image (pola sama).

**Struktur UI (bahasa Inggris, semua elemen berfungsi):**
- Nav sticky + mode chip dari `/api/health` (LIVE · SAM 3.1 + SPARK + E2B / DEMO MODE · NO API KEYS).
- Hero: headline + kanvas "tracking overlay" beranimasi (11 pemain + bola + SPRINT callout, counter FPS nyata; hormati prefers-reduced-motion).
- Kartu analisis 3 tab: **Paste a link** (url + sport + segmen) / **Upload video** (dropzone + XHR progress) / **Try the sample** (replay run terverifikasi).
- Timeline "watch it think": plan-first, self-correction di-highlight amber, tetap tampil setelah done.
- Dashboard hasil: KPI cards, Distance by player (bar + sprint count + top speed), Spark analyst panel (tactical + forward + note), tools row (Search moments / Training plan / Live replay / Export CSV / View analysis code → `/api/jobs/{id}/code`), moments cards (klip inline + share card), training plan, live replay (video + whisper ticker), Ask the Analyst (chat + suggested questions).
- How it works (3 langkah + audiens), Pipeline (6 tahap), FAQ (5 akordeon), footer "POWERED BY META AI MODELS" (tepat sesuai keputusan branding) + baris BETA.

**Sample = replay run terverifikasi (keputusan demo cached tetap berlaku):** `sample-data.js` di-bake dari job NYATA `84bca8fd9d96` (31 Okt, mode demo): agent_log, result, 3 momen, plan, 3 Q&A chat, 15 whisper (t=0..84), video `samples/sample-match-2026.mp4` (nama baru — hindari CF edge cache mp4 lama), kartu `sample-card.svg` (SVG asli endpoint card). Mode sample TIDAK memanggil API sama sekali — zero fail saat judging; chat/momen/plan/whisper berjalan dari data bake dengan label jujur "VERIFIED RUN · REPLAY".

**VIDEO SAMPLE DIGANTI:** `sample-match.mp4` lama = testsrc color bars. Baru: **simulated tracking view 90s** (640x360@30, 1.4MB) — lapangan gelap + tracking boxes cyan/merah + skor + label "SIMULATED TRACKING VIEW - DEMO". Generator: `tools/make_sample_video.py` (PIL → ffmpeg pipe). Gap memory "testsrc needs real match video" → teratasi untuk demo (video real tetap bonus).

**FIX BACKEND (mock.py, commit e0fd097):** synthetic tracker lama = random walk yang menempel di cap 9.5 m/s → KPI demo konyol (830 sprints, semua pemain ~34 km/h). Baru: model jog/sprint/rest + per-player vmax (26–33 km/h, P1 terkencang) + cooldown, bola dribble/pass; sprint dihitung per EPISODE (rising-edge) di MOCK_ANALYSIS_CODE. Hasil 90s: 0.2 km / 32.6 km/h / ~28 team sprints — kredibel. Smoke suite **22/22 PASS** setelah deploy.

**Gotcha deployment:** host port 8000 = Coolify (bukan statcam-api); health internal harus via `docker exec` (sama seperti watchdog). WORKDIR container API = `/srv` (bukan /app). Host port 80/443 = traefik; curl localhost tanpa Host → 404 (bukan error).

**Backup dua arah (31 Okt):** tests/ + watchdog.sh + .gitignore tersinkron ke lokal; git bundle `statcam-web.bundle` + `statcam-api.bundle` (semua history) di `backups/` lokal. GitHub push belum ada remote — butuh user (gh auth login / tambah remote + push), keys tidak pernah via chat.

**Verifikasi browser penuh (31 Okt, tab baru post-deploy):** hero + kanvas OK; sample replay (timeline animasi → dashboard → momen 3 kartu + klip inline → chat Q&A → plan → live replay + ticker sinkron); job link NYATA end-to-end (~4s: timeline → hasil kredibel → chat computed → momen → plan → replay); FAQ; Export CSV tanpa error; mobile 390px rapi. **NOL error konsol.** Old build tersimpan di `out-react-backup/` + git (rollback = git checkout + docker cp).

---

## ADDENDUM 31 Okt 2026 (2) — BOLA SAMPLE + E2B DIHAPUS DARI LANDING (keputusan user)

**Keputusan user: "E2B · Verified execution sama ini hapus saja dari landing".** E2B (penyedia eksekusi pihak ketiga, kredit hackathon) kini TIDAK DISEBUT di mana pun di halaman publik — konsisten dengan keputusan 21 Okt (Baseten/Modal/Fireworks keluar dari landing): strip "POWERED BY META AI MODELS" kini 2 item saja (SAM 3.1 · Vision tracking / Muse Spark · Match intelligence); tahap 5 pipeline jadi "Verified execution" (konsep dipertahankan, brand tidak); mode chip + badge LIVE jadi "LIVE · SAM 3.1 + SPARK". /admin/keys tetap menerima E2B_API_KEY (backend tak berubah).

**"Bolanya lama di over" (user) — bola dibuat pindah third secara decisif, 3 lapisan:**
1. Video sample → `sample-match-v3.mp4` (90s, nama baru untuk bust CF edge cache mp4; v2 & testsrc lama tetap ada untuk halaman stale). Generator `tools/make_sample_video.py`: state machine dribble (50-130 frame dekat pemain acak) → pass ke third BERBEDA (cap 5.4 px/frame, sampai radius 30px), bukan lagi mengejar pemain terdekat terus-terusan.
2. Kanvas hero di `app.js` — state machine yang sama (dribble cap 2.3, pass cap 3.6, target third berbeda).
3. Backend `mock.py` — bola: pass selalu ke third berbeda (goal 16-22 m/s), dribble lokal; hasil: distribusi zona bola tersebar (kiri 21 / tengah 49 / kanan 110 sampel per 90s) — whisper ticker tidak monoton "middle third" lagi.
- Rerun + rebake: sample-data.js kini dari job **20b56885d430** (KPI: 0.2 km / 32.5 km/h / 31 sprints; zona whisper: middle/attacking bergantian). sample-card.svg di-refresh dari endpoint card job itu.

**Bug ditemukan saat verifikasi & fix:** atribut `hidden` TIDAK berefek pada elemen ber-class (`.btn{display:inline-flex}` menang atas UA `[hidden]{display:none}`) — tombol "View analysis code" bocor tampil di mode sample. Fix: `[hidden]{display:none!important}` di styles.css. Verifikasi: sebelum play → results + codebtn none; setelah play sample → codebtn tetap none, 3 KPI tampil, 0 error.

Smoke suite: API hanya berubah di mock.py (bola) — regresi cepat OK (health 200 internal + publik).

---

## ADDENDUM 31 Okt 2026 (3) — AUDIT KEAMANAN PRA-KEYS + HARDENING (request user: "cek semua keamanan webnya dan key jangan ekpose ke publik")

**Hasil audit (semua bersih):**
- **Tidak ada nilai key di mana pun**: scan semua history git (API + web + lokal mirror) untuk pola mk-…/e2b_…/sk-…/ADMIN_TOKEN= → hanya nama variabel & dokumentasi. Tidak ada file .env liar di luar /data (VPS + lokal). ADMIN_TOKEN terpasang di container (SET, tidak dicetak nilainya — aturan keys-via-chat tetap).
- Jalur `/admin/keys`: GET menampilkan status (sudah terpasang ✅) tanpa nilai; POST 401 untuk token salah (terverifikasi publik); key ditulis ke `/data/.env` chmod 600; `/api/health` hanya boolean configured. Frontend baru tidak pernah menyentuh key (relative /api saja). Kunci TIDAK masuk git (data volume terpisah dari repo).
- SSRF guard, cap 200 MB, job id 12-hex tak terduga — semua dari audit 21 Okt tetap berlaku.

**Hardening baru (deploy + diverifikasi):**
1. **Rate limit per-IP** (thread-safe, in-memory): `POST /admin/keys` = 8/15 menit (anti brute-force ADMIN_TOKEN — vektor nyata: penyerang yang menebak token bisa MENIMPA key dengan miliknya dan mengalirkan tracks.json ke sandbox E2B penyerang); `POST /api/jobs` = 12/5 menit + cap global 72/5 menit (anti disk-fill). Loopback dikecualikan (smoke suite). IP klien: CF-Connecting-IP → entri terakhir XFF → client.host. **Terverifikasi publik: 12× 400 lalu 429; keys salah tetap 401.**
2. **Security headers**: web (nginx): CSP `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` + XCTO nosniff + XFO DENY + Referrer-Policy; API (middleware FastAPI): XCTO + XFO + Referrer-Policy. Terverifikasi publik di kedua domain; browser re-test: kanvas + sample + 0 error.
3. **Dockerfile web dirapikan**: buang printf rapuh (quote CSP pecahkan shell) → `COPY out/nginx-default.conf /etc/nginx/conf.d/default.conf` (conf ter-commit di out/).

**BUG SAYA SENDIRI saat deploy (tercatat sebagai peringatan):** versi pertama rate limiter memanggil `_rate_limited(request, …)` di `create_job` TANPA menambahkan parameter `request: Request` → NameError → semua POST /api/jobs 500 selama ±10 menit sampai fix ter-deploy. Pelajaran: endpoint FastAPI yang menyentuh `request` WAJIB mendeklarasikan parameternya; jalankan smoke suite SEBELUM docker restart, bukan sesudah, saat mengubah signature endpoint.
