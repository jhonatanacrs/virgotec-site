/* ==========================================================================
   Virgo Tecnologia — Interações do protótipo (front-end apenas)
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Número de WhatsApp da Virgo Tecnologia (com DDI 55 + DDD, somente dígitos) */
  var WHATSAPP_NUMBER = "5521972404437";

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

  /* ---------- Envio do formulário por e-mail (Formspree) ---------- */
  // Não há servidor próprio: usamos o Formspree (serviço gratuito) para
  // receber o POST do formulário e encaminhar por e-mail automaticamente
  // para contato@virgotech / jhonatan.assis@live.com — sem precisar de
  // nenhum clique extra da pessoa que preencheu.
  //
  // IMPORTANTE — ativação obrigatória antes de publicar:
  // 1. Crie uma conta gratuita em https://formspree.io usando o e-mail
  //    jhonatan.assis@live.com.
  // 2. Crie um novo formulário ("+ New Form") e copie o endpoint gerado,
  //    algo como: https://formspree.io/f/abcdwxyz
  // 3. Substitua o valor de FORMSPREE_ENDPOINT abaixo por esse endpoint.
  // 4. No primeiro envio real do formulário, o Formspree manda um e-mail
  //    de confirmação para jhonatan.assis@live.com — é preciso clicar no
  //    link de confirmação uma única vez para ativar o recebimento.
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/mqervwdd";

  var submitBtn = contactForm.querySelector(".modal-submit");
  var submitBtnLabel = submitBtn ? submitBtn.innerHTML : "";
  var formErrorEl = document.getElementById("form-error");

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Enviando..." : submitBtnLabel;
    if (!isSubmitting) submitBtn.innerHTML = submitBtnLabel;
  }

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (formErrorEl) formErrorEl.style.display = "none";

    if (FORMSPREE_ENDPOINT.indexOf("SEU_FORM_ID") !== -1) {
      if (formErrorEl) {
        formErrorEl.textContent = "Envio por e-mail ainda não configurado: defina FORMSPREE_ENDPOINT em app.js com o endpoint real do Formspree.";
        formErrorEl.style.display = "block";
      }
      return;
    }

    setSubmitting(true);

    var formData = new FormData(contactForm);
    formData.append("_subject", "Novo contato pelo site Virgo Tecnologia");

    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          formView.style.display = "none";
          successView.style.display = "block";
          var successHeading = successView.querySelector("h3");
          if (successHeading) successHeading.focus();
        } else {
          return response.json().then(function (data) {
            throw new Error((data && data.error) || "Falha ao enviar. Tente novamente.");
          });
        }
      })
      .catch(function (err) {
        if (formErrorEl) {
          formErrorEl.textContent = "Não foi possível enviar agora (" + err.message + "). Tente novamente em instantes.";
          formErrorEl.style.display = "block";
        }
      })
      .finally(function () {
        setSubmitting(false);
      });
  });

})();
