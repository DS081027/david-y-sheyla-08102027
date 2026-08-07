// ============================================================
//  David & Sheyla — Invitación de boda
//  Lógica: reveal on scroll, cuenta atrás, carrusel, música
// ============================================================

// ---------- 1) Reveal on scroll ----------
(function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
})();

// ---------- 2) Cuenta atrás ----------
// EDITA AQUÍ la fecha y hora de la boda (formato ISO):
const WEDDING_DATE = new Date("2027-10-08T17:00:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, WEDDING_DATE - now);

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const pad = (n) => String(n).padStart(2, "0");

  document.getElementById("cd-days").textContent = pad(days);
  document.getElementById("cd-hours").textContent = pad(hours);
  document.getElementById("cd-minutes").textContent = pad(minutes);
  document.getElementById("cd-seconds").textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- 3) Carrusel de fotos ----------
function scrollCarousel(direction) {
  const track = document.getElementById("carousel");
  if (!track) return;
  const amount = track.clientWidth * 0.8 * direction;
  track.scrollBy({ left: amount, behavior: "smooth" });
}
window.scrollCarousel = scrollCarousel;

// ---------- 4) Música de fondo ----------
// Los navegadores bloquean el autoplay con sonido, así que la canción
// arranca en cuanto el usuario interactúa por primera vez con la página.
(function initMusic() {
  const audio = document.getElementById("bg-audio");
  const btn = document.getElementById("music-btn");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const hint = document.getElementById("music-hint");
  if (!audio || !btn) return;

  let playAttempt = null;
  let autoTried = false;

  function setPlayingUI(isPlaying) {
    btn.classList.toggle("playing", isPlaying);
    iconPlay.style.display = isPlaying ? "none" : "block";
    iconPause.style.display = isPlaying ? "block" : "none";
    btn.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
    if (isPlaying && hint) hint.classList.add("is-hidden");
  }

  function requestPlay() {
    if (playAttempt) return playAttempt;
    playAttempt = audio
      .play()
      .then(() => setPlayingUI(true))
      .catch(() => {
        // Bloqueado por la política de autoplay del navegador; el usuario
        // podrá iniciar la música pulsando el botón.
        setPlayingUI(false);
      })
      .finally(() => {
        playAttempt = null;
      });
    return playAttempt;
  }

  function requestPause() {
    audio.pause();
    setPlayingUI(false);
  }

  function tryAutoStart() {
    // No marcamos autoTried aquí: un touchstart/pointerdown que termina
    // siendo un scroll no cuenta como gesto válido para el navegador y
    // audio.play() fallará. Si eso pasa, hay que poder reintentar con el
    // siguiente toque real (tap, click) en vez de rendirnos para siempre.
    if (autoTried) return;
    requestPlay().then(() => {
      if (!audio.paused) {
        autoTried = true;
        removeAutoStartListeners();
      }
    });
  }

  function removeAutoStartListeners() {
    window.removeEventListener("touchend", tryAutoStart);
    window.removeEventListener("click", tryAutoStart);
    window.removeEventListener("keyup", tryAutoStart);
  }

  window.addEventListener("touchend", tryAutoStart, { passive: true });
  window.addEventListener("click", tryAutoStart);
  window.addEventListener("keyup", tryAutoStart);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeAutoStartListeners();
    if (hint) hint.classList.add("is-hidden");
    if (audio.paused) {
      requestPlay();
    } else {
      requestPause();
    }
  });
})();

// ---------- 5) Sobre de apertura ----------
(function initEnvelope() {
  const gate = document.getElementById("envelope-gate");
  if (!gate) return;

  document.documentElement.classList.add("gate-lock");

  gate.addEventListener("click", () => {
    if (gate.classList.contains("opened")) return;
    gate.classList.add("opened");

    const heroVideo = document.getElementById("hero-video");
    if (heroVideo) {
      setTimeout(() => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
      }, 500);
    }

    setTimeout(() => {
      gate.classList.add("closed");
      document.documentElement.classList.remove("gate-lock");
    }, 1100);
  });
})();