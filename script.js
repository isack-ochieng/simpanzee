(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const deck = $("#deck");
  let allSlides = $$(".slide");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const hudDots = $("#dots");
  const counter = $("#counter");
  const progressBar = $("#progressBar");
  const swipeCue = $("#swipeCue");
  const beginBtn = $("#beginBtn");

  const stars = $("#stars");
  const floatingHearts = $("#floatingHearts");
  const confetti = $("#confetti");
  const markMessage = $("#markMessage");

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");

  const questionCard = $("#questionCard");
  const questionLabel = $("#questionLabel");
  const questionTitle = $("#questionTitle");
  const questionSub = $("#questionSub");
  const choiceArea = $("#choiceArea");
  const yesBtn = $("#yesBtn");
  const noBtn = $("#noBtn");
  const hint = $("#hint");

  let current = 0;
  let questionIndex = 0;
  let noAttempts = 0;
  let markShown = false;

  const questions = [
    {
      label: "Question 1",
      title: "Did this little<br><span>morning note help?</span>",
      sub: "Choose wisely. The developer has already over-engineered the answer. 😂",
      hint: "You can say no. Probably."
    },
    {
      label: "Question 2",
      title: "Do you still<br><span>love me?</span>",
      sub: "That is the only other question I have for you.",
      hint: "Just smile and press yes. 😌"
    }
  ];

  const noLines = [
    "Acha izo 😂",
    "Are you sure? 👀",
    "Ghaii 💔, really",
    "Really sure?",
    "Reeeeally sure?",
    "Reeeeally reeeaaally sure?",
    "I reject your answer. 😭",
    "That sure? Because I can keep asking. 😭",
    "The answer is still waiting for you. ✦"
  ];
  const noLabels = [
    "No", "Still no?", "Really?", "Reeeeally?",
    "Be serious 😂", "Try again", "Last chance", "Nope…"
  ];

  /* ── AMBIANCE ──────────────────────────────── */
  if (stars) {
    for (let i = 0; i < 36; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.setProperty("--duration", (2.5 + Math.random() * 3).toFixed(2) + "s");
      s.style.setProperty("--delay", (-Math.random() * 3).toFixed(2) + "s");
      stars.appendChild(s);
    }
  }
  if (floatingHearts) {
    ["♡", "✦", "·", "✧"].forEach((sym, i) => {
      const h = document.createElement("span");
      h.textContent = sym;
      h.style.left = [12, 35, 68, 88][i] + "%";
      h.style.top = [20, 65, 30, 75][i] + "%";
      h.style.fontSize = [14, 10, 12, 11][i] + "px";
      h.style.setProperty("--duration", (4 + i * 0.5) + "s");
      floatingHearts.appendChild(h);
    });
  }

  /* ── HUD DOTS & NAVIGATION ─────────────────── */
  function buildHudDots() {
    if (!hudDots) return;
    hudDots.innerHTML = "";
    allSlides.filter(s => s.style.display !== "none").forEach((_, i) => {
      const d = document.createElement("span");
      d.addEventListener("click", () => scrollToSlide(i));
      hudDots.appendChild(d);
    });
  }

  function scrollToSlide(index) {
    const visibleSlides = allSlides.filter(s => s.style.display !== "none");
    if (index < 0 || index >= visibleSlides.length) return;
    visibleSlides[index].scrollIntoView({ behavior: "smooth", inline: "start" });
  }

  /* ── OBSERVER FOR SLIDE TRACKING ────────────── */
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const visibleSlides = allSlides.filter(s => s.style.display !== "none");
        const idx = visibleSlides.indexOf(entry.target);
        if (idx !== -1) {
          current = idx;
          updateUI(visibleSlides);
          lazyLoadIframes(entry.target);
        }
      }
    });
  }, { root: deck, threshold: 0.6 });

  allSlides.forEach(s => slideObserver.observe(s));

  function updateUI(visibleSlides) {
    visibleSlides.forEach((s, i) => s.classList.toggle("is-active", i === current));

    const dots = $$("span", hudDots);
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));

    if (counter) {
      counter.textContent = String(current + 1).padStart(2, "0") + " / " + String(visibleSlides.length).padStart(2, "0");
    }
    if (progressBar) {
      const pct = visibleSlides.length > 1 ? (current / (visibleSlides.length - 1)) * 100 : 100;
      progressBar.style.width = pct + "%";
    }
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === visibleSlides.length - 1;

    if (current > 0 && swipeCue) swipeCue.classList.add("is-hidden");
  }

  function lazyLoadIframes(slideEl) {
    const iframes = $$("iframe[data-src]", slideEl);
    iframes.forEach(iframe => {
      if (!iframe.src) {
        iframe.src = iframe.dataset.src;
      }
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollToSlide(current - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToSlide(current + 1));
  if (beginBtn) beginBtn.addEventListener("click", () => scrollToSlide(1));

  /* ── CAROUSELS (MUSIC & MEMORIES) ──────────── */
  function setupCarousel(trackSelector, dotsSelector) {
    const track = $(trackSelector);
    if (!track) return;
    const cards = $$(".carousel-card", track);
    const wrap = dotsSelector ? $(dotsSelector) : null;

    if (wrap && wrap.children.length === 0) {
      cards.forEach((_, i) => {
        const d = document.createElement("span");
        if (i === 0) d.classList.add("is-active");
        wrap.appendChild(d);
      });
    }

    const sync = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      cards.forEach((card, i) => {
        const c = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(center - c);
        if (d < dist) { dist = d; best = i; }
      });
      cards.forEach((c, i) => c.classList.toggle("is-active", i === best));
      if (wrap) {
        $$("span", wrap).forEach((d, i) => d.classList.toggle("is-active", i === best));
      }
    };

    track.addEventListener("scroll", sync, { passive: true });
  }

  setupCarousel("#musicTrack", "#musicDots");
  setupCarousel("#memoryTrack", "#memoryDots");

  /* ── LIGHTBOX ─────────────────────────────── */
  $$(".photo-frame[data-lightbox]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = btn.dataset.lightbox;
      lightbox.classList.remove("hidden");
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.add("hidden");
      lightboxImage.src = "";
    }
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ── SNAPPY NO BUTTON EVASION ───────────────── */
  function moveNoButton() {
    if (!choiceArea || !noBtn) return;
    const area = choiceArea.getBoundingClientRect();
    const btn = noBtn.getBoundingClientRect();

    const maxX = (area.width - btn.width) / 2 - 8;
    const maxY = (area.height - btn.height) / 2 - 8;

    const x = (Math.random() - 0.5) * 2 * maxX;
    const y = (Math.random() - 0.5) * 2 * maxY;

    noBtn.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function handleNoInteraction(e) {
    if (e) e.preventDefault();
    noAttempts++;
    if (hint) hint.textContent = noLines[Math.min(noAttempts - 1, noLines.length - 1)];
    if (noBtn) noBtn.textContent = noLabels[Math.min(noAttempts, noLabels.length - 1)];
    moveNoButton();
  }

  if (noBtn) {
    noBtn.addEventListener("touchstart", handleNoInteraction, { passive: false });
    noBtn.addEventListener("mouseenter", handleNoInteraction);
    noBtn.addEventListener("click", handleNoInteraction);
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      if (questionIndex === 0) {
        questionIndex = 1;
        noAttempts = 0;
        if (noBtn) noBtn.style.transform = "";
        updateQuestion();
        celebrate();
      } else {
        celebrate();
        unlockReveal();
      }
    });
  }

  function updateQuestion() {
    const q = questions[questionIndex];
    if (questionLabel) questionLabel.textContent = q.label;
    if (questionTitle) questionTitle.innerHTML = q.title;
    if (questionSub) questionSub.textContent = q.sub;
    if (hint) hint.textContent = q.hint;
    if (noBtn) noBtn.textContent = noLabels[0];
  }

  /* ── UNLOCK REVEAL ─────────────────────────── */
  function unlockReveal() {
    const revealSlide = $(".slide[data-slide='reveal']");     if (!revealSlide) return;     revealSlide.classList.add("is-revealed");     revealSlide.style.display = "flex";     allSlides = $$(".slide");
    slideObserver.observe(revealSlide);
    buildHudDots();
    scrollToSlide(allSlides.length - 1);
    setTimeout(showMarkMessage, 1500);
  }

  function showMarkMessage() {
    if (markShown || !markMessage) return;
    markShown = true;
    markMessage.classList.remove("hidden");
    setTimeout(() => {
      markMessage.style.transition = "opacity 0.8s ease";
      markMessage.style.opacity = "0";
      setTimeout(() => markMessage.classList.add("hidden"), 850);
    }, 4000);
  }

  /* ── CONFETTI ─────────────────────────────── */
  function celebrate() {
    if (!confetti) return;
    const colors = ["#ff8daf", "#ffd6e3", "#fff7fb", "#d8b4fe"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.setProperty("--drift", (Math.random() - 0.5) * 200 + "px");
      piece.style.setProperty("--rotation", (Math.random() * 720 - 360) + "deg");
      piece.style.setProperty("--fall-duration", (2.2 + Math.random() * 2) + "s");
      piece.style.background = colors[i % colors.length];
      confetti.appendChild(piece);
      setTimeout(() => piece.remove(), 4500);
    }
  }

  /* ── INIT ─────────────────────────────────── */
  buildHudDots();
})();
