document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const page = $("#page");
  const beginBtn = $("#beginBtn");
  const morning = $("#morning");
  const reveal = $("#reveal");

  const questionCard = $("#questionCard");
  const questionLabel = $("#questionLabel");
  const questionTitle = $("#questionTitle");
  const questionSub = $("#questionSub");
  const choiceArea = $("#choiceArea");
  const yesBtn = $("#yesBtn");
  const noBtn = $("#noBtn");
  const hint = $("#hint");

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");

  const stars = $("#stars");
  const floatingHearts = $("#floatingHearts");
  const confetti = $("#confetti");
  const markMessage = $("#markMessage");

  let questionIndex = 0;
  let noAttempts = 0;
  let markShown = false;

  const questions = [
    {
      label: "Question one · proceed carefully",
      title: "Should I do<br><span>this again tomorrow?</span>",
      sub: "Choose wisely. The developer has already over-engineered the answer. 😂",
      hint: "You can say no. Probably."
    },
    {
      label: "Question two · now be honest",
      title: "Are you happy<br><span>you opened this?</span>",
      sub: "That is the only other question I have for you.",
      hint: "Just smile and press yes. 😌"
    }
  ];

  const noLines = [
    "Nice try. 😂",
    "Are you sure? 👀",
    "Really sure?",
    "Reeeeally sure?",
    "Reeeeally reeeeaaally sure?",
    "That sure? Because I can keep asking. 😭",
    "Okay, now you are just testing the developer.",
    "The answer is still waiting for you. ✦"
  ];

  const noLabels = [
    "No",
    "Still no?",
    "Really?",
    "Reeeeally?",
    "Be serious 😂",
    "Try again",
    "Last chance",
    "Nope…"
  ];

  if (!beginBtn || !morning || !page) return;

  if (window.location.hash === "#morning") {
    morning.classList.remove("hidden");
  }

  beginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    morning.classList.remove("hidden");
    morning.classList.add("fade-in");
    history.replaceState(null, "", "#morning");
    requestAnimationFrame(() => {
      morning.scrollTop = 0;
      morning.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (stars) {
    for (let i = 0; i < 42; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty("--duration", (2.5 + Math.random() * 4).toFixed(2) + "s");
      star.style.setProperty("--delay", (-Math.random() * 4).toFixed(2) + "s");
      stars.appendChild(star);
    }
  }

  if (floatingHearts) {
    ["♡", "✦", "·", "✧"].forEach((symbol, index) => {
      const heart = document.createElement("span");
      heart.textContent = symbol;
      heart.style.left = [10, 30, 70, 88][index] + "%";
      heart.style.top = [18, 68, 28, 74][index] + "%";
      heart.style.fontSize = [15, 10, 14, 11][index] + "px";
      heart.style.setProperty("--duration", (3.8 + index * .65) + "s");
      heart.style.setProperty("--delay", (-index * .7) + "s");
      floatingHearts.appendChild(heart);
    });
  }

  function updateQuestion() {
    const q = questions[questionIndex];
    questionLabel.textContent = q.label;
    questionTitle.innerHTML = q.title;
    questionSub.textContent = q.sub;
    hint.textContent = q.hint;
    noBtn.textContent = noLabels[Math.min(noAttempts, noLabels.length - 1)];
  }

  function moveNoButton() {
    if (!choiceArea || !noBtn) return;

    const area = choiceArea.getBoundingClientRect();
    const button = noBtn.getBoundingClientRect();

    const maxX = Math.max(8, area.width - button.width - 12);
    const maxY = Math.max(8, area.height - button.height - 12);
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - maxY / 2;

    noBtn.style.position = "absolute";
    noBtn.style.transform = `translate(${x}px,${y}px)`;
  }

  function rejectNo() {
    noAttempts += 1;
    hint.textContent = noLines[Math.min(noAttempts - 1, noLines.length - 1)];
    noBtn.textContent = noLabels[Math.min(noAttempts, noLabels.length - 1)];

    if (noAttempts % 2 === 0) {
      noBtn.animate(
        [
          { transform: "translate(0,0) rotate(0deg)" },
          { transform: "translate(0,0) rotate(-7deg) scale(.97)" },
          { transform: "translate(0,0) rotate(7deg) scale(1.03)" },
          { transform: "translate(0,0) rotate(0deg)" }
        ],
        { duration: 360, easing: "ease-out" }
      );
    }

    moveNoButton();
  }

  if (noBtn) {
    ["pointerenter", "focus"].forEach((eventName) => {
      noBtn.addEventListener(eventName, rejectNo);
    });

    noBtn.addEventListener("touchstart", (event) => {
      event.preventDefault();
      rejectNo();
    }, { passive: false });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      rejectNo();
    });
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      if (questionIndex === 0) {
        questionIndex = 1;
        noAttempts = 0;
        updateQuestion();
        celebrate();

        questionCard.animate(
          [
            { transform: "scale(.98)", opacity: .78 },
            { transform: "scale(1)", opacity: 1 }
          ],
          { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      } else {
        celebrate();
        revealEnding();
      }
    });
  }

  function setupCarousel(trackSelector, dotsSelector) {
    const track = $(trackSelector);
    if (!track) return;

    const cards = $$(trackSelector + " .carousel-card");
    const dots = $$(dotsSelector + " span");

    const sync = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let distance = Infinity;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const delta = Math.abs(center - cardCenter);
        if (delta < distance) {
          distance = delta;
          best = index;
        }
      });

      cards.forEach((card, index) => card.classList.toggle("active", index === best));
      dots.forEach((dot, index) => dot.classList.toggle("active", index === best));
    };

    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  setupCarousel("#musicTrack", "#musicDots");
  setupCarousel("#memoryTrack", "#memoryDots");

  $$(".photo-frame[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.querySelector("img")?.alt || "Memory";
      lightbox.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      lightboxClose?.focus();
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add("hidden");
    lightboxImage.src = "";
    document.body.style.overflow = "";
  }

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  function revealEnding() {
    reveal?.classList.remove("hidden");
    reveal?.classList.add("fade-in");

    setTimeout(() => {
      reveal?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    setTimeout(showMarkMessage, 1500);
  }

  function showMarkMessage() {
    if (markShown || !markMessage) return;
    markShown = true;
    markMessage.classList.remove("hidden");

    setTimeout(() => {
      markMessage.style.transition = "opacity .85s ease";
      markMessage.style.opacity = "0";
      setTimeout(() => {
        markMessage.classList.add("hidden");
        markMessage.style.opacity = "";
        markMessage.style.transition = "";
      }, 900);
    }, 4000);
  }

  function celebrate() {
    if (!confetti) return;

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.setProperty("--drift", `${(Math.random() - .5) * 220}px`);
      piece.style.setProperty("--rotation", `${Math.random() * 900 - 450}deg`);
      piece.style.setProperty("--fall-duration", `${2.4 + Math.random() * 2.6}s`);
      piece.style.background = ["#ff8daf","#ffd6e3","#fff7fb","#d8b4fe"][i % 4];
      piece.style.animationDelay = `${Math.random() * .25}s`;
      confetti.appendChild(piece);
      setTimeout(() => piece.remove(), 6000);
    }
  }
});