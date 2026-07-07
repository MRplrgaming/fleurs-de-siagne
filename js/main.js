/* ============================================
   FLEURS DE SIAGNE — Animations 3D & interactions
   ============================================ */
(function () {
  "use strict";

  /* ---------- 1. LOADER (animation d'entrée) ---------- */
  var loader = document.getElementById("loader");
  var MIN_LOADER_TIME = 2200;
  var loadStart = Date.now();
  var loaderDone = false;

  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;

    var elapsed = Date.now() - loadStart;
    var wait = Math.max(0, MIN_LOADER_TIME - elapsed);
    setTimeout(function () {
      loader.classList.add("done");
      playHeroIntro();
    }, wait);
  }
  window.addEventListener("load", hideLoader);
  // Sécurité : si "load" tarde (CDN lent), on entre quand même
  setTimeout(hideLoader, 5000);

  /* ---------- 2. INTRO DU HERO (GSAP) ---------- */
  function playHeroIntro() {
    if (!window.gsap) return;
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(
      ".hero-title .line span",
      { yPercent: 110, rotateX: -60 },
      { yPercent: 0, rotateX: 0, duration: 1.3, stagger: 0.15 }
    )
      .fromTo(
        ".hero .reveal",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
        "-=0.7"
      )
      .fromTo(
        ".nav",
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.8"
      );
  }

  /* ---------- 3. DIAPORAMA DE FOND (fondu enchaîné + Ken Burns) ---------- */
  (function initHeroSlideshow() {
    var wrap = document.getElementById("hero-bg-slides");
    if (!wrap) return;
    var slides = Array.prototype.slice.call(wrap.querySelectorAll(".hero-bg-slide"));
    if (slides.length < 2) return;

    var SLIDE_DURATION = 5500;
    var current = 0;

    function goToNext() {
      var prevEl = slides[current];
      current = (current + 1) % slides.length;
      var nextEl = slides[current];

      nextEl.classList.remove("alt");
      if (current % 2 === 1) nextEl.classList.add("alt");

      nextEl.classList.add("active");
      // eslint-disable-next-line no-unused-expressions
      nextEl.offsetHeight;

      setTimeout(function () {
        prevEl.classList.remove("active", "alt");
      }, 2300);
    }

    setInterval(goToNext, SLIDE_DURATION);
  })();

  /* ---------- 4. RÉVÉLATIONS AU SCROLL (GSAP ScrollTrigger) ---------- */
  function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) {
      // fallback : tout afficher
      document
        .querySelectorAll(".reveal, .section-kicker, .section-title, .section-sub")
        .forEach(function (el) {
          el.style.opacity = 1;
        });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".section").forEach(function (section) {
      var items = section.querySelectorAll(
        ".section-kicker, .section-title, .section-sub"
      );
      if (items.length) {
        gsap.fromTo(
          items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 75%" },
          }
        );
      }
    });

    // Cartes bouquets : entrée 3D en cascade
    gsap.utils.toArray(".card").forEach(function (card, i) {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0, rotateY: -18, transformPerspective: 900 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          delay: (i % 3) * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        }
      );
    });

    // Avis clients
    gsap.utils.toArray(".review").forEach(function (r, i) {
      gsap.fromTo(
        r,
        { y: 60, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          delay: (i % 2) * 0.15,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: r, start: "top 88%" },
        }
      );
    });

    // Blocs à propos / contact / carte
    [".about-card", ".about-text", ".contact-grid > div", ".map-wrap", ".hours-card"].forEach(
      function (sel) {
        gsap.utils.toArray(sel).forEach(function (el) {
          gsap.fromTo(
            el,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 85%" },
            }
          );
        });
      }
    );
  }
  initScrollAnimations();

  /* ---------- 5. EFFET TILT 3D SUR LES CARTES ---------- */
  var supportsHover = window.matchMedia("(hover: hover)").matches;
  if (supportsHover) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      var inner = card.querySelector(".tilt-inner");
      if (!inner) return;
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        inner.style.transform =
          "rotateY(" + px * 10 + "deg) rotateX(" + -py * 10 + "deg) translateZ(8px)";
      });
      card.addEventListener("mouseleave", function () {
        inner.style.transform = "rotateY(0) rotateX(0) translateZ(0)";
      });
    });
  }

  /* ---------- 6. ANIMATION DE SORTIE (liens externes) ---------- */
  var exitOverlay = document.getElementById("exit-overlay");
  var exitPetalsBox = exitOverlay.querySelector(".exit-petals");

  function spawnExitPetals() {
    exitPetalsBox.innerHTML = "";
    for (var i = 0; i < 40; i++) {
      var s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 0.7 + "s";
      s.style.animationDuration = 1.1 + Math.random() * 0.9 + "s";
      var scale = 0.6 + Math.random() * 0.9;
      s.style.width = 22 * scale + "px";
      s.style.height = 34 * scale + "px";
      var hues = ["#c9a24b", "#e6cf94", "#b98f2e", "#d9b668"];
      s.style.background =
        "linear-gradient(180deg, " +
        hues[i % hues.length] +
        ", " +
        hues[(i + 1) % hues.length] +
        ")";
      exitPetalsBox.appendChild(s);
    }
  }

  document.querySelectorAll("a.external").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var url = link.href;
      spawnExitPetals();
      exitOverlay.classList.add("active");
      setTimeout(function () {
        window.open(url, "_blank", "noopener");
        setTimeout(function () {
          exitOverlay.classList.remove("active");
        }, 600);
      }, 1400);
    });
  });

  /* ---------- 7. NAVIGATION ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });

  var burger = document.getElementById("burger");
  var navLinks = document.querySelector(".nav-links");
  burger.addEventListener("click", function () {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });

  /* ---------- 8. BADGE OUVERT / FERMÉ EN DIRECT ---------- */
  // Horaires : [ [ [debut, fin], ... ] ] en heures décimales, index 0 = dimanche
  var WEEK_HOURS = [
    [[9, 12]],                 // Dimanche
    [],                        // Lundi (fermé)
    [[9, 12], [16, 19]],       // Mardi
    [[9, 12], [16, 19]],       // Mercredi
    [[9, 12], [16, 18]],       // Jeudi
    [[9, 12], [16, 19]],       // Vendredi
    [[9, 12], [16, 19]],       // Samedi
  ];
  var DAY_NAMES = [
    "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi",
  ];

  function formatHour(h) {
    var hh = Math.floor(h);
    var mm = Math.round((h - hh) * 60);
    return hh + "h" + (mm ? (mm < 10 ? "0" + mm : mm) : "");
  }

  function getOpenStatus() {
    var now = new Date();
    var day = now.getDay();
    var t = now.getHours() + now.getMinutes() / 60;
    var slots = WEEK_HOURS[day];

    // Ouvert en ce moment ?
    for (var i = 0; i < slots.length; i++) {
      if (t >= slots[i][0] && t < slots[i][1]) {
        return {
          open: true,
          text: "Ouvert · ferme à " + formatHour(slots[i][1]),
        };
      }
    }
    // Prochaine ouverture aujourd'hui ?
    for (var j = 0; j < slots.length; j++) {
      if (t < slots[j][0]) {
        return {
          open: false,
          text: "Fermé · ouvre à " + formatHour(slots[j][0]),
        };
      }
    }
    // Sinon, chercher le prochain jour ouvert
    for (var d = 1; d <= 7; d++) {
      var nextDay = (day + d) % 7;
      if (WEEK_HOURS[nextDay].length) {
        var label =
          d === 1 ? "demain" : DAY_NAMES[nextDay];
        return {
          open: false,
          text:
            "Fermé · ouvre " +
            label +
            " à " +
            formatHour(WEEK_HOURS[nextDay][0][0]),
        };
      }
    }
    return { open: false, text: "Fermé" };
  }

  function updateOpenBadges() {
    var status = getOpenStatus();
    ["open-badge-hero", "open-badge-card"].forEach(function (id) {
      var badge = document.getElementById(id);
      if (!badge) return;
      badge.hidden = false;
      badge.classList.toggle("closed", !status.open);
      badge.querySelector(".open-badge-text").textContent = status.text;
    });
  }
  updateOpenBadges();
  setInterval(updateOpenBadges, 60 * 1000); // mise à jour chaque minute

  /* ---------- 9. FORMULAIRE DE COMMANDE (mailto) ---------- */
  var orderForm = document.getElementById("order-form");
  var feedback = document.getElementById("form-feedback");

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validation simple
      var valid = true;
      orderForm.querySelectorAll("[required]").forEach(function (field) {
        field.classList.remove("invalid");
        if (!field.value.trim()) {
          field.classList.add("invalid");
          valid = false;
        }
      });
      if (!valid) {
        feedback.textContent = "Merci de remplir les champs marqués d'une *";
        feedback.classList.add("error");
        return;
      }

      var f = orderForm.elements;
      var dateStr = f.date.value
        ? new Date(f.date.value + "T00:00:00").toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Non précisée";

      var subject = "Demande de bouquet — " + f.occasion.value + " (" + f.nom.value + ")";
      var body =
        "Bonjour Muriel,\n\n" +
        "Je souhaite commander un bouquet :\n\n" +
        "• Nom : " + f.nom.value + "\n" +
        "• Téléphone : " + (f.tel.value || "Non précisé") + "\n" +
        "• Occasion : " + f.occasion.value + "\n" +
        "• Budget : " + (f.budget.value || "Non précisé") + "\n" +
        "• Date souhaitée : " + dateStr + "\n" +
        "• Style / couleurs : " + (f.style.value || "Non précisé") + "\n\n" +
        "Message :\n" + f.message.value + "\n\n" +
        "Merci !";

      window.location.href =
        "https://mail.google.com/mail/?view=cm&fs=1" +
        "&to=fleursdesiagne%40orange.fr" +
        "&su=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      feedback.classList.remove("error");
      feedback.textContent = "Gmail s'ouvre… il ne reste qu'à cliquer sur Envoyer.";
    });
  }

  /* ---------- 10. LIGHTBOX 3D ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCaption = document.getElementById("lb-caption");
  var lbCounter = document.getElementById("lb-counter");
  var galleryImages = [];
  var lbIndex = 0;

  // Récupère toutes les photos (cartes + à propos)
  document
    .querySelectorAll(".card-img img, .about-card .tilt-inner > img")
    .forEach(function (img) {
      var card = img.closest(".card");
      var title = card
        ? card.querySelector("h3").textContent
        : (document.querySelector(".about-card-caption") || {}).textContent || "";
      galleryImages.push({ src: img.src, alt: img.alt, caption: title });
      var idx = galleryImages.length - 1;
      img.addEventListener("click", function () {
        openLightbox(idx);
      });
    });

  function renderLightbox() {
    var item = galleryImages[lbIndex];
    // petit effet 3D à chaque changement d'image
    lbImg.style.transition = "none";
    lbImg.style.transform = "rotateY(-24deg) scale(0.82)";
    lbImg.style.opacity = "0";
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.caption;
    lbCounter.textContent = lbIndex + 1 + " / " + galleryImages.length;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lbImg.style.transition = "";
        lbImg.style.transform = "";
        lbImg.style.opacity = "";
      });
    });
  }

  function openLightbox(i) {
    lbIndex = i;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function lbNav(dir) {
    lbIndex = (lbIndex + dir + galleryImages.length) % galleryImages.length;
    renderLightbox();
  }

  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("lb-prev").addEventListener("click", function () { lbNav(-1); });
  document.getElementById("lb-next").addEventListener("click", function () { lbNav(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lbNav(-1);
    if (e.key === "ArrowRight") lbNav(1);
  });

  // Navigation tactile (swipe)
  var touchStartX = null;
  lightbox.addEventListener("touchstart", function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) lbNav(dx > 0 ? -1 : 1);
    touchStartX = null;
  }, { passive: true });

  /* ---------- 11. BOUTON CONTACT FLOTTANT ---------- */
  var fab = document.getElementById("fab");
  var fabMain = document.getElementById("fab-main");
  fabMain.addEventListener("click", function () {
    var isOpen = fab.classList.toggle("open");
    fabMain.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.addEventListener("click", function (e) {
    if (!fab.contains(e.target)) {
      fab.classList.remove("open");
      fabMain.setAttribute("aria-expanded", "false");
    }
  });
})();
