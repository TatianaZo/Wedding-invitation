(function () {
  const WEDDING_DATE = new Date(2029, 8, 9, 9, 9, 0);
  const MUSIC_VOLUME = 0.22;
  const STORAGE_THEME = "wedding-theme";
  const STORAGE_AUDIO = "wedding-audio-muted";

  /* ── Countdown ── */
  function calcCountdown(from, to) {
    if (from >= to) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
    let hours = to.getHours() - from.getHours();
    let minutes = to.getMinutes() - from.getMinutes();
    let seconds = to.getSeconds() - from.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes -= 1;
    }
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
      days -= 1;
    }
    if (days < 0) {
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    return { years, months, days, hours, minutes, seconds };
  }

  function updateCountdown() {
    const now = new Date();
    const diff = calcCountdown(now, WEDDING_DATE);

    const ids = ["cd-years", "cd-months", "cd-days", "cd-hours", "cd-minutes", "cd-seconds"];
    const vals = [diff.years, diff.months, diff.days, diff.hours, diff.minutes, diff.seconds];
    ids.forEach(function (id, i) {
      const el = document.getElementById(id);
      if (el) el.textContent = String(vals[i]);
    });

    if (now >= WEDDING_DATE) {
      const title = document.querySelector("#countdown .section__title");
      if (title) title.textContent = "Этот день настал!";
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ── Splash ── */
  const splash = document.getElementById("splash");
  const splashOpen = document.getElementById("splash-open");
  const mainSite = document.getElementById("main-site");
  const siteControls = document.getElementById("site-controls");
  const bgMusic = document.getElementById("bg-music");
  const audioToggle = document.getElementById("audio-toggle");

  function openSite() {
    if (splash) {
      splash.classList.add("is-hidden");
      splash.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("splash-active");
    if (mainSite) {
      mainSite.hidden = false;
    }
    if (siteControls) {
      siteControls.hidden = false;
    }
    startMusicIfAllowed();
    setTimeout(function () {
      if (splash) splash.remove();
    }, 1300);
  }

  if (splashOpen) {
    splashOpen.addEventListener("click", openSite);
  }

  /* ── Background music ── */
  if (bgMusic) {
    bgMusic.volume = MUSIC_VOLUME;
  }

  function isAudioMuted() {
    return localStorage.getItem(STORAGE_AUDIO) === "1";
  }

  function updateAudioButton() {
    if (!audioToggle || !bgMusic) return;
    const muted = bgMusic.muted;
    audioToggle.setAttribute("aria-pressed", muted ? "false" : "true");
    audioToggle.setAttribute("aria-label", muted ? "Включить музыку" : "Выключить музыку");
    audioToggle.title = muted ? "Включить музыку" : "Выключить музыку";
    const icon = audioToggle.querySelector(".site-controls__icon");
    if (icon) {
      icon.classList.toggle("site-controls__icon--audio-on", !muted);
      icon.classList.toggle("site-controls__icon--audio-off", muted);
    }
  }

  function startMusicIfAllowed() {
    if (!bgMusic || isAudioMuted()) {
      if (bgMusic) bgMusic.muted = true;
      updateAudioButton();
      return;
    }
    bgMusic.muted = false;
    const playPromise = bgMusic.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        bgMusic.muted = true;
        updateAudioButton();
      });
    }
    updateAudioButton();
  }

  if (bgMusic) {
    bgMusic.muted = isAudioMuted();
    updateAudioButton();
  }

  if (audioToggle && bgMusic) {
    audioToggle.addEventListener("click", function () {
      bgMusic.muted = !bgMusic.muted;
      localStorage.setItem(STORAGE_AUDIO, bgMusic.muted ? "1" : "0");
      if (!bgMusic.muted) {
        bgMusic.play().catch(function () {});
      }
      updateAudioButton();
    });
  }

  /* ── Theme toggle ── */
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
  }

  const savedTheme = localStorage.getItem(STORAGE_THEME);
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ── Transport card expand ── */
  const transportVisual = document.getElementById("transport-visual");
  const transportHint = document.querySelector(".transport__hint");

  function toggleTransportCard() {
    if (!transportVisual) return;
    const expanded = transportVisual.classList.toggle("is-expanded");
    transportVisual.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  if (transportVisual) {
    transportVisual.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleTransportCard();
    });

    if (transportHint) {
      transportHint.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleTransportCard();
      });
    }

    const transportWrap = document.querySelector(".transport__visual-wrap");

    document.addEventListener("click", function (e) {
      if (
        transportVisual.classList.contains("is-expanded") &&
        transportWrap &&
        !transportWrap.contains(e.target)
      ) {
        transportVisual.classList.remove("is-expanded");
        transportVisual.setAttribute("aria-expanded", "false");
      }
    });

    transportVisual.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTransportCard();
      }
      if (e.key === "Escape") {
        transportVisual.classList.remove("is-expanded");
        transportVisual.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── Lightbox ── */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxThumbPrev = document.getElementById("lightbox-thumb-prev");
  const lightboxThumbNext = document.getElementById("lightbox-thumb-next");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxSidePrev = document.getElementById("lightbox-side-prev");
  const lightboxSideNext = document.getElementById("lightbox-side-next");

  const galleryItems = [];

  function collectGallery() {
    document.querySelectorAll(".lightbox-trigger").forEach(function (el) {
      const img = el.querySelector("img");
      if (!img) return;
      galleryItems.push({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        caption: el.getAttribute("data-caption") || img.getAttribute("alt") || "",
      });
    });
  }

  collectGallery();

  let lightboxIndex = 0;

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function showLightbox(index) {
    if (!lightbox || !galleryItems.length) return;
    lightboxIndex = mod(index, galleryItems.length);
    const item = galleryItems[lightboxIndex];
    const prevItem = galleryItems[mod(lightboxIndex - 1, galleryItems.length)];
    const nextItem = galleryItems[mod(lightboxIndex + 1, galleryItems.length)];

    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption;

    lightboxThumbPrev.src = prevItem.src;
    lightboxThumbPrev.alt = prevItem.alt;
    lightboxThumbNext.src = nextItem.src;
    lightboxThumbNext.alt = nextItem.alt;

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    if (!document.body.classList.contains("splash-active")) {
      document.body.style.overflow = "";
    }
  }

  function stepLightbox(delta) {
    showLightbox(lightboxIndex + delta);
  }

  document.querySelectorAll(".lightbox-trigger").forEach(function (el, i) {
    function open() {
      showLightbox(i);
    }
    el.addEventListener("click", open);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", function () {
    stepLightbox(-1);
  });
  if (lightboxNext) lightboxNext.addEventListener("click", function () {
    stepLightbox(1);
  });
  if (lightboxSidePrev) {
    lightboxSidePrev.addEventListener("click", function () {
      stepLightbox(-1);
    });
  }
  if (lightboxSideNext) {
    lightboxSideNext.addEventListener("click", function () {
      stepLightbox(1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  /* ── RSVP form ── */
  const form = document.getElementById("rsvp-form");
  const messageEl = document.getElementById("form-message");

  if (form && messageEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      messageEl.hidden = true;
      messageEl.className = "form__message";

      const name = form.name.value.trim();
      const mainCourse = form.querySelector('input[name="main_course"]:checked');
      const drinks = form.drinks.value.trim();
      const notes = form.notes.value.trim();

      if (!name) {
        showMessage("Пожалуйста, укажите имя и отчество.", "error");
        form.name.focus();
        return;
      }

      if (!mainCourse) {
        showMessage("Пожалуйста, выберите горячее блюдо.", "error");
        return;
      }

      const courseLabels = {
        beef: "Говядина с овощами",
        fish: "Филе лосося",
        vegetarian: "Овощное рагу (вегетарианское)",
      };

      const response = {
        name: name,
        mainCourse: courseLabels[mainCourse.value] || mainCourse.value,
        drinks: drinks || "—",
        notes: notes || "—",
        submittedAt: new Date().toISOString(),
      };

      const responses = JSON.parse(localStorage.getItem("wedding-rsvp") || "[]");
      responses.push(response);
      localStorage.setItem("wedding-rsvp", JSON.stringify(responses));

      showMessage(
        "Спасибо! Ваш ответ сохранён. Мы с нетерпением ждём встречи с вами!",
        "success"
      );
      form.reset();
    });
  }

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = "form__message form__message--" + type;
    messageEl.hidden = false;
  }
})();
