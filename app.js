/* ==========================================================================
   Virgo Tecnologia — Interações do protótipo (front-end apenas)
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Ano dinâmico no rodapé ---------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sólido/blur ao rolar ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navMobile = document.getElementById("nav-mobile");
  var iconMenu = navToggle.querySelector(".icon-menu");
  var iconClose = navToggle.querySelector(".icon-close");

  function openMobileNav() {
    navMobile.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    iconMenu.style.display = "none";
    iconClose.style.display = "block";
    document.body.classList.add("modal-open");
  }
  function closeMobileNav() {
    navMobile.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    iconMenu.style.display = "block";
    iconClose.style.display = "none";
    document.body.classList.remove("modal-open");
  }
  navToggle.addEventListener("click", function () {
    if (navMobile.classList.contains("is-open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });
  navMobile.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileNav);
  });

  /* ---------- Scroll suave para âncoras (fallback / offset do header fixo) ---------- */
  var headerOffset = 84;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.pushState(null, "", id);
    });
  });

  /* ---------- Fade-in ao entrar na área visível ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Modal de contato ---------- */
  var modal = document.getElementById("contact-modal");
  var openTriggers = document.querySelectorAll(".js-open-modal");
  var closeTriggers = document.querySelectorAll(".js-close-modal");
  var formView = document.getElementById("modal-form-view");
  var successView = document.getElementById("modal-success-view");
  var contactForm = document.getElementById("contact-form");
  var lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    closeMobileNav();
    var firstField = modal.querySelector("input, textarea, button");
    if (firstField) firstField.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
    // Reseta para a view de formulário após a transição, para a próxima abertura
    setTimeout(function () {
      formView.style.display = "block";
      successView.style.display = "none";
      contactForm.reset();
    }, 300);
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  openTriggers.forEach(function (btn) { btn.addEventListener("click", openModal); });
  closeTriggers.forEach(function (btn) { btn.addEventListener("click", closeModal); });
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  /* ---------- Envio simulado do formulário ---------- */
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Simulação visual apenas — nenhum dado é enviado ou armazenado.
    formView.style.display = "none";
    successView.style.display = "block";
    var successHeading = successView.querySelector("h3");
    if (successHeading) successHeading.focus();
  });

})();
