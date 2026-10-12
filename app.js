(() => {
  "use strict";

  const MESSAGE_PARAGRAPHS = [
    "يارب تكون بأعلى المناصب وكل يوم تكون مبسوط احببكك!",
    "في يوم ميلادك، أتمنى لك من قلبي أعوامًا مليانة بالفرح والنجاح وراحة البال، وأتمنى إن الحياة تعطيك من جمال قلبك أضعاف ما تعطيها، وإنك ما تعرف للحزن طريق إلا ويكون بعده فرح أكبر. أتمنى تظل ضحكتك ما تفارقك، وتظل أحلامك تكبر معك وتتحقق وحدة وراء الثانية.",
    "وأبيك تعرف إنك مو مجرد شخص أحبه، أنت شخص أتمنى له الخير حتى في أبسط تفاصيل حياته، وأفرح لفرحته وكأنها فرحتي، وأتمنى له من الأيام أجملها ومن الأقدار ألطفها. وجودك يعني لي الكثير، ومهما قلت لك من الكلام الحلو بيبقى بقلبي شعور أكبر من كل الحروف.",
    "كل عام وأنت حبيبي، وكل عام وأنت أقرب لقلبي، وكل عام وأنت بخير وسعادة وطمأنينة. يا رب تكون سنتك الجديدة بداية لكل شيء جميل.",
    "عيد ميلاد سعيد يا أجمل من كبرت به أيامي.",
  ];

  const EXTRA_NOTES = [
    "أنت مو بس حبيبي… أنت مكاني الآمن اللي أرجع له دايم 🤍",
    "ضحكتك تغيّر يومي كامل، حتى لو كان يوم ثقيل.",
    "كل سنة تمر وأنت جنبي، أحس إن الحياة تزين أكثر.",
  ];

  const COMPLIMENTS = [
    "عيونك تحكي حنان ما ينوصف ✨",
    "وجودك يخلّي أي مكان يصير دافي",
    "أنت نادر… وقلبي عارف قيمتك",
    "حتى صمتك مريح، مو بس كلامك",
    "أنت أجمل مفاجأة صارت بحياتي",
    "قلبك طيب زيادة عن اللزوم، وهذا أجمل شيء فيك",
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- DOM ---------- */
  const intro = document.getElementById("intro");
  const app = document.getElementById("app");
  const btnStart = document.getElementById("btn-start");
  const btnMusicIntro = document.getElementById("btn-music-intro");
  const soundToggle = document.getElementById("sound-toggle");
  const btnAccept = document.getElementById("btn-accept");
  const btnDecline = document.getElementById("btn-decline");
  const declineTease = document.getElementById("decline-tease");
  const sectionScrapbook = document.getElementById("section-scrapbook");
  const sectionCake = document.getElementById("section-cake");
  const sectionMessage = document.getElementById("section-message");
  const cakeStage = document.getElementById("cake-stage");
  const btnWish = document.getElementById("btn-wish");
  const wishHint = document.getElementById("wish-hint");
  const btnBlow = document.getElementById("btn-blow");
  const micStatus = document.getElementById("mic-status");
  const btnRelight = document.getElementById("btn-relight");
  const wishDone = document.getElementById("wish-done");
  const msgTitle = document.getElementById("msg-title");
  const msgBody = document.getElementById("msg-body");
  const msgPlaceholder = document.getElementById("msg-placeholder");
  const btnShowFull = document.getElementById("btn-show-full");
  const btnExtraNote = document.getElementById("btn-extra-note");
  const extraNote = document.getElementById("extra-note");
  const heartsOrbit = document.getElementById("hearts-orbit");
  const burstLayer = document.getElementById("burst-layer");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const confettiCtx = confettiCanvas.getContext("2d");

  const modalEnvelope = document.getElementById("modal-envelope");
  const envelope = document.getElementById("envelope");
  const modalGift = document.getElementById("modal-gift");
  const giftBox = document.getElementById("gift-box");
  const giftReveal = document.getElementById("gift-reveal");
  const btnOpenGift = document.getElementById("btn-open-gift");
  const modalCompliments = document.getElementById("modal-compliments");
  const complimentText = document.getElementById("compliment-text");
  const btnNextCompliment = document.getElementById("btn-next-compliment");

  /* ---------- State ---------- */
  let audioCtx = null;
  let muted = false;
  let musicOn = false;
  let musicNodes = null;
  let candlesLit = true;
  let micStream = null;
  let micAnalyser = null;
  let micRaf = null;
  let typewriterTimer = null;
  let complimentIndex = 0;
  let extraIndex = 0;
  let confettiBits = [];
  let confettiRaf = null;
  let experienceStarted = false;

  /* ---------- Audio (Web Audio API) ---------- */
  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function tone({ freq = 440, dur = 0.15, type = "sine", gain = 0.08, slideTo = null }) {
    if (muted) return;
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), ctx.currentTime + dur);
    }
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  function playClick() {
    tone({ freq: 880, dur: 0.07, type: "triangle", gain: 0.05 });
    tone({ freq: 1320, dur: 0.05, type: "sine", gain: 0.03 });
  }

  function playEnvelope() {
    tone({ freq: 320, dur: 0.2, type: "triangle", gain: 0.06, slideTo: 520 });
    setTimeout(() => tone({ freq: 660, dur: 0.18, type: "sine", gain: 0.05 }), 120);
  }

  function playGift() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => tone({ freq: f, dur: 0.16, type: "triangle", gain: 0.055 }), i * 90);
    });
  }

  function playBlowOut() {
    if (muted) return;
    const ctx = ensureAudio();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    const g = ctx.createGain();
    g.gain.value = 0.12;
    noise.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.5);
    setTimeout(() => tone({ freq: 740, dur: 0.25, type: "sine", gain: 0.06, slideTo: 420 }), 200);
  }

  function playCelebrate() {
    [523, 659, 784, 988, 1174].forEach((f, i) => {
      setTimeout(() => tone({ freq: f, dur: 0.22, type: "triangle", gain: 0.05 }), i * 70);
    });
  }

  function startMusic() {
    if (muted || musicNodes) return;
    const ctx = ensureAudio();
    const master = ctx.createGain();
    master.gain.value = 0.028;
    master.connect(ctx.destination);

    const notes = [392, 494, 587, 659, 587, 494];
    let step = 0;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.connect(g);
    g.connect(master);
    g.gain.value = 0.0001;
    osc.start();

    const tick = () => {
      if (!musicNodes) return;
      const f = notes[step % notes.length];
      osc.frequency.setTargetAtTime(f, ctx.currentTime, 0.01);
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      step += 1;
      musicNodes.timer = setTimeout(tick, 700);
    };

    musicNodes = { osc, g, master, timer: null };
    tick();
    musicOn = true;
    updateMusicLabels();
  }

  function stopMusic() {
    if (!musicNodes) {
      musicOn = false;
      updateMusicLabels();
      return;
    }
    clearTimeout(musicNodes.timer);
    try {
      musicNodes.osc.stop();
    } catch (_) {}
    musicNodes = null;
    musicOn = false;
    updateMusicLabels();
  }

  function updateMusicLabels() {
    document.querySelectorAll("[data-music-label]").forEach((el) => {
      el.textContent = musicOn ? "إيقاف الموسيقى 🎵" : "تشغيل الموسيقى 🎵";
    });
  }

  function setMuted(next) {
    muted = next;
    soundToggle.classList.toggle("is-muted", muted);
    soundToggle.setAttribute("aria-label", muted ? "تشغيل الصوت" : "كتم الصوت");
    if (muted) stopMusic();
  }

  /* ---------- Confetti ---------- */
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth * devicePixelRatio;
    confettiCanvas.height = window.innerHeight * devicePixelRatio;
    confettiCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function spawnConfetti(count = 90) {
    if (reducedMotion) return;
    resizeCanvas();
    const colors = ["#f9aac0", "#b0dbed", "#f8d491", "#c2a6fb", "#ffe566", "#ef9393"];
    for (let i = 0; i < count; i++) {
      confettiBits.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 80,
        w: 6 + Math.random() * 7,
        h: 8 + Math.random() * 10,
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 3.5,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4,
        color: colors[i % colors.length],
        shape: Math.random() > 0.55 ? "rect" : "star",
      });
    }
    if (!confettiRaf) confettiLoop();
  }

  function confettiLoop() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiBits = confettiBits.filter((p) => p.y < window.innerHeight + 40);
    for (const p of confettiBits) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.rot += p.vr;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      if (p.shape === "star") {
        confettiCtx.beginPath();
        confettiCtx.moveTo(0, -p.h / 2);
        confettiCtx.lineTo(p.w / 4, -p.h / 8);
        confettiCtx.lineTo(p.w / 2, 0);
        confettiCtx.lineTo(p.w / 4, p.h / 8);
        confettiCtx.lineTo(0, p.h / 2);
        confettiCtx.closePath();
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      confettiCtx.restore();
    }
    if (confettiBits.length) {
      confettiRaf = requestAnimationFrame(confettiLoop);
    } else {
      confettiRaf = null;
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function burstHearts(x, y, count = 18) {
    if (reducedMotion) return;
    const bits = ["🩷", "✨", "⭐", "💗", "🌟"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "burst-bit";
      el.textContent = bits[i % bits.length];
      const angle = (Math.PI * 2 * i) / count;
      const dist = 60 + Math.random() * 120;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`);
      el.style.setProperty("--rot", `${-40 + Math.random() * 80}deg`);
      burstLayer.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
  }

  /* ---------- Intro / flow ---------- */
  function startExperience() {
    if (experienceStarted) return;
    experienceStarted = true;
    playClick();
    ensureAudio();
    intro.classList.add("is-leaving");
    setTimeout(() => {
      intro.hidden = true;
      app.hidden = false;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }, reducedMotion ? 0 : 500);
  }

  function unlockAfterAccept() {
    playCelebrate();
    sectionCake.hidden = false;
    sectionScrapbook.hidden = false;
    sectionMessage.hidden = false;
    seedOrbitHearts();
    setTimeout(() => {
      sectionCake.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }, 200);
  }

  /* ---------- Decline runaway ---------- */
  function runawayDecline(e) {
    playClick();
    declineTease.hidden = false;
    const parent = btnDecline.parentElement;
    const bounds = parent.getBoundingClientRect();
    const btn = btnDecline.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - btn.width);
    const maxY = 48;
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY;
    btnDecline.style.transform = `translate(${x}px, ${y}px)`;
    if (e && e.preventDefault) e.preventDefault();
  }

  /* ---------- Candles ---------- */
  function setCandlesLit(lit) {
    candlesLit = lit;
    cakeStage.classList.toggle("is-out", !lit);
    if (lit) {
      btnWish.hidden = false;
      wishHint.hidden = true;
      btnBlow.hidden = true;
      btnRelight.hidden = true;
      wishDone.hidden = true;
      micStatus.hidden = true;
    } else {
      btnWish.hidden = true;
      wishHint.hidden = true;
      btnBlow.hidden = true;
      btnRelight.hidden = false;
      wishDone.hidden = false;
      stopMicListen();
    }
  }

  function extinguishCandles() {
    if (!candlesLit) return;
    playBlowOut();
    setCandlesLit(false);
    spawnConfetti(110);
    playCelebrate();
    setTimeout(() => {
      sectionMessage.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      startMessageReveal();
    }, 900);
  }

  async function startMicListen() {
    micStatus.hidden = false;
    micStatus.textContent = " downstream لك تفتح الميكروفون… أو استخدم الزر";
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = ensureAudio();
      const source = ctx.createMediaStreamSource(micStream);
      micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 512;
      source.connect(micAnalyser);
      micStatus.textContent = "انفخ باتجاه الميكروفون… 🎂";
      listenForBlow();
    } catch (_) {
      micStatus.textContent = "الميكروفون غير متاح — اضغط «انفخ الشمعة»";
    }
  }

  function listenForBlow() {
    if (!micAnalyser) return;
    const data = new Uint8Array(micAnalyser.fftSize);
    const loop = () => {
      if (!candlesLit || !micAnalyser) return;
      micAnalyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      if (rms > 0.12) {
        extinguishCandles();
        return;
      }
      micRaf = requestAnimationFrame(loop);
    };
    micRaf = requestAnimationFrame(loop);
  }

  function stopMicListen() {
    if (micRaf) cancelAnimationFrame(micRaf);
    micRaf = null;
    micAnalyser = null;
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  /* ---------- Message typewriter ---------- */
  function startMessageReveal() {
    msgTitle.classList.add("is-in");
    if (msgPlaceholder) msgPlaceholder.hidden = true;
    if (typewriterTimer) clearTimeout(typewriterTimer);
    msgBody.textContent = "";
    if (reducedMotion) {
      msgBody.textContent = MESSAGE_PARAGRAPHS.join("\n\n");
      return;
    }
    const full = MESSAGE_PARAGRAPHS.join("\n\n");
    let i = 0;
    const step = () => {
      i += 1;
      msgBody.textContent = full.slice(0, i);
      if (i < full.length) {
        typewriterTimer = setTimeout(step, full[i - 1] === "\n" ? 40 : 18);
      }
    };
    typewriterTimer = setTimeout(step, 400);
  }

  function showFullMessage() {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    if (msgPlaceholder) msgPlaceholder.hidden = true;
    msgBody.textContent = MESSAGE_PARAGRAPHS.join("\n\n");
    msgTitle.classList.add("is-in");
  }

  function seedOrbitHearts() {
    heartsOrbit.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const h = document.createElement("span");
      h.className = "orbit-heart";
      h.textContent = i % 2 ? "♡" : "💗";
      h.style.left = `${8 + (i * 12) % 84}%`;
      h.style.top = `${10 + (i * 17) % 75}%`;
      h.style.animationDelay = `${i * 0.4}s`;
      heartsOrbit.appendChild(h);
    }
  }

  /* ---------- Modals ---------- */
  function openModal(modal) {
    modal.hidden = false;
    playClick();
  }

  function closeModal(modal) {
    modal.hidden = true;
  }

  function resetGift() {
    giftBox.classList.remove("is-open");
    giftReveal.hidden = true;
    btnOpenGift.hidden = false;
  }

  /* ---------- Restart ---------- */
  function restartExperience() {
    playClick();
    stopMicListen();
    setCandlesLit(true);
    wishHint.hidden = true;
    btnBlow.hidden = true;
    resetGift();
    envelope.classList.remove("is-open");
    extraNote.hidden = true;
    if (typewriterTimer) clearTimeout(typewriterTimer);
    msgBody.textContent = "";
    msgTitle.classList.remove("is-in");
    if (msgPlaceholder) msgPlaceholder.hidden = false;
    sectionScrapbook.hidden = true;
    sectionCake.hidden = true;
    sectionMessage.hidden = true;
    btnDecline.style.transform = "";
    declineTease.hidden = true;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  /* ---------- Events ---------- */
  btnStart.addEventListener("click", startExperience);

  btnMusicIntro.addEventListener("click", () => {
    ensureAudio();
    if (musicOn) stopMusic();
    else startMusic();
    playClick();
  });

  soundToggle.addEventListener("click", () => {
    ensureAudio();
    setMuted(!muted);
    if (!muted) playClick();
  });

  btnAccept.addEventListener("click", () => {
    playClick();
    unlockAfterAccept();
  });

  btnDecline.addEventListener("mouseenter", runawayDecline);
  btnDecline.addEventListener("click", runawayDecline);
  btnDecline.addEventListener("touchstart", runawayDecline, { passive: false });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const action = btn.getAttribute("data-action");
      playClick();
      if (action === "envelope") {
        envelope.classList.remove("is-open");
        openModal(modalEnvelope);
        setTimeout(() => {
          envelope.classList.add("is-open");
          playEnvelope();
        }, 180);
      } else if (action === "gift") {
        resetGift();
        openModal(modalGift);
      } else if (action === "burst") {
        const rect = btn.getBoundingClientRect();
        burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
        playCelebrate();
      } else if (action === "compliments") {
        complimentIndex = 0;
        complimentText.textContent = COMPLIMENTS[0];
        openModal(modalCompliments);
      } else if (action === "scroll-message") {
        sectionMessage.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        if (!msgBody.textContent) startMessageReveal();
      } else if (action === "restart") {
        restartExperience();
      }
    });
  });

  btnWish.addEventListener("click", () => {
    playClick();
    wishHint.hidden = false;
    btnBlow.hidden = false;
    startMicListen();
  });

  btnBlow.addEventListener("click", () => {
    playClick();
    extinguishCandles();
  });

  btnRelight.addEventListener("click", () => {
    playClick();
    setCandlesLit(true);
    tone({ freq: 520, dur: 0.2, type: "sine", gain: 0.05, slideTo: 780 });
  });

  btnShowFull.addEventListener("click", () => {
    playClick();
    showFullMessage();
  });

  btnExtraNote.addEventListener("click", () => {
    playClick();
    extraNote.hidden = false;
    extraNote.textContent = EXTRA_NOTES[extraIndex % EXTRA_NOTES.length];
    extraIndex += 1;
  });

  btnOpenGift.addEventListener("click", () => {
    playGift();
    giftBox.classList.add("is-open");
    giftReveal.hidden = false;
    btnOpenGift.hidden = true;
    spawnConfetti(50);
  });

  btnNextCompliment.addEventListener("click", () => {
    playClick();
    complimentIndex = (complimentIndex + 1) % COMPLIMENTS.length;
    complimentText.style.animation = "none";
    // force reflow
    void complimentText.offsetWidth;
    complimentText.style.animation = "";
    complimentText.textContent = COMPLIMENTS[complimentIndex];
  });

  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => {
      const modal = el.closest(".modal");
      if (modal) closeModal(modal);
    });
  });

  envelope.addEventListener("click", () => {
    if (!envelope.classList.contains("is-open")) {
      envelope.classList.add("is-open");
      playEnvelope();
    }
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Intersection: start message typing when scrolled into view (if candles already out)
  const msgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !candlesLit && !msgBody.textContent) {
          startMessageReveal();
        }
      });
    },
    { threshold: 0.35 }
  );
  msgObserver.observe(sectionMessage);

  // Optional QA helper: /?autostart=1 skips intro for visual checks
  if (new URLSearchParams(location.search).has("autostart")) {
    experienceStarted = true;
    intro.hidden = true;
    app.hidden = false;
    sectionCake.hidden = false;
    sectionScrapbook.hidden = false;
    sectionMessage.hidden = false;
    seedOrbitHearts();
  }
})();
