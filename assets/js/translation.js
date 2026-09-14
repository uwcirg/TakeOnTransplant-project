let translations = {};

async function loadTranslations() {
  try {
    const response = await fetch("assets/js/translations.json");

    if (!response.ok) {
      throw new Error(
        `Failed to load translations: ${response.status}`
      );
    }

    translations = await response.json();

    console.log("Translations loaded successfully");
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

function getTranslation(lang, key) {
  const langKey = String(lang).toLowerCase();
  if (!lang || !translations || !translations[langKey]) {
    console.warn(`Language "${lang}" not found`);
    return null;
  }
  return translations[langKey][key];
}

function applyTextTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = getTranslation(lang, key);
    if (typeof value === "string") {
      el.textContent = value;
    }
  });
}

function applyHtmlTranslations(lang) {
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const value = getTranslation(lang, key);
    if (typeof value === "string") {
      el.innerHTML = value;
    }
  });
}

function applyAttributeTranslations(lang) {
  document
    .querySelectorAll("[data-i18n-attr]")
    .forEach((el) => {
      const attrConfig = el.getAttribute("data-i18n-attr");

      if (!attrConfig) return;

      const pairs = attrConfig.split(",");

      pairs.forEach((pair) => {
        const [attrName, translationKey] = pair
          .split(":")
          .map((s) => s.trim());

        if (!attrName || !translationKey) return;

        const value = getTranslation(lang, translationKey);

        if (typeof value === "string") {
          el.setAttribute(attrName, value);
        }
      });
    });
}

function setDocumentLanguage(lang) {
  document.documentElement.lang = lang;
}

function setLanguage(lang) {
  const langKey = String(lang).toLowerCase();
  if (!translations || !translations[langKey]) {
    console.warn(`Language "${lang}" not found`);
    return;
  }

  localStorage.setItem("siteLanguage", lang);

  setDocumentLanguage(lang);

  applyTextTranslations(lang);
  applyHtmlTranslations(lang);
  applyAttributeTranslations(lang);

  console.log(`Language switched to: ${lang}`);
}

function getSavedLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get("userLang");
  return paramLang || localStorage.getItem("siteLanguage") || "en_US";
}

function handleVideoVisibility(lang, isInitialLoad = true) {
  if (String(lang).toLowerCase() !== "en_us") {
    hideVideo();
    return;
  }
  showVideo(null, isInitialLoad);

}

function clearUserLangParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("userLang");
  window.history.replaceState({}, document.title, url.toString());
}

function initializeLanguageSwitcher() {
  const switcher =
    document.getElementById("languageSwitcher");
  if (!switcher) return;
  const savedLanguage = getSavedLanguage();
  console.log("Saved language:", savedLanguage);
  switcher.value = savedLanguage;
  switcher.addEventListener("change", (e) => {
    setLanguage(e.target.value);
    console.log("Selected language:", e.target.value);
    handleVideoVisibility(e.target.value, true);
    clearUserLangParam();
    handleAppButtonURL();
  });
}

function handleAppButtonURL() {
  const btnGoToApp = document.getElementById("btnGoToApp");
  if (!btnGoToApp) return;
  const savedLanguage = getSavedLanguage();
  const url = new URL(btnGoToApp.href);
  url.searchParams.set("userLang", savedLanguage);
  btnGoToApp.href = url.toString();
}

domReady(async () => {
  await loadTranslations();
  initializeLanguageSwitcher();
  handleAppButtonURL();
  const savedLanguage = getSavedLanguage();
  setLanguage(savedLanguage);
  handleVideoVisibility(savedLanguage);
});
