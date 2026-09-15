let translations = {};

const DEFAULT_LANGUAGE = "en_US";
const SUPPORTED_LANGUAGES = ["en_US", "es_MX"];

/**
 * Load translation strings from JSON.
 */
async function loadTranslations() {
  try {
    const response = await fetch("assets/js/translations.json");

    if (!response.ok) {
      throw new Error(`Failed to load translations: ${response.status}`);
    }

    translations = await response.json();

    console.log("Translations loaded successfully");
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

/**
 * Convert the application language code to the lowercase
 * key used in translations.json.
 *
 * en_US -> en_us
 * es_MX -> es_mx
 */
function normalizeLanguage(lang) {
  return lang ? String(lang).toLowerCase() : null;
}

/**
 * Check whether a language is supported by the site.
 */
function isSupportedLanguage(lang) {
  return SUPPORTED_LANGUAGES.includes(lang);
}

/**
 * Retrieve a translation.
 */
function getTranslation(lang, key) {
  const langKey = normalizeLanguage(lang);

  if (!langKey || !translations?.[langKey]) {
    console.warn(`Language "${lang}" not found`);
    return null;
  }

  return translations[langKey][key];
}

/**
 * Translate elements containing plain text.
 */
function applyTextTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = getTranslation(lang, key);

    if (typeof value === "string") {
      el.textContent = value;
    }
  });
}

/**
 * Translate elements whose translations contain HTML.
 */
function applyHtmlTranslations(lang) {
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const value = getTranslation(lang, key);

    if (typeof value === "string") {
      el.innerHTML = value;
    }
  });
}

/**
 * Translate HTML attributes.
 *
 * Example:
 * data-i18n-attr="aria-label:languageSwitcherLabel"
 *
 * Multiple attributes can be separated by commas.
 */
function applyAttributeTranslations(lang) {
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const attrConfig = el.getAttribute("data-i18n-attr");

    if (!attrConfig) return;

    const pairs = attrConfig.split(",");

    pairs.forEach((pair) => {
      const [attrName, translationKey] = pair
        .split(":")
        .map((value) => value.trim());

      if (!attrName || !translationKey) return;

      const value = getTranslation(lang, translationKey);

      if (typeof value === "string") {
        el.setAttribute(attrName, value);
      }
    });
  });
}

/**
 * Update the HTML document language.
 *
 * Convert:
 * en_US -> en-US
 * es_MX -> es-MX
 */
function setDocumentLanguage(lang) {
  document.documentElement.lang = lang.replace("_", "-");
}

/**
 * Apply a language and save it as the user's preference.
 */
function setLanguage(lang) {
  if (!isSupportedLanguage(lang)) {
    console.warn(`Unsupported language "${lang}"`);
    return;
  }

  const langKey = normalizeLanguage(lang);

  if (!translations?.[langKey]) {
    console.warn(`Translations for language "${lang}" not found`);
    return;
  }

  localStorage.setItem("siteLanguage", lang);

  setDocumentLanguage(lang);

  applyTextTranslations(lang);
  applyHtmlTranslations(lang);
  applyAttributeTranslations(lang);

  console.log(`Language switched to: ${lang}`);
}

/**
 * Determine the initial language.
 *
 * Priority:
 *
 * 1. userLang URL parameter
 * 2. saved localStorage preference
 * 3. English
 *
 * Also indicates whether the language came from the URL,
 * so the parameter can be removed after it has been consumed.
 */
function getInitialLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get("userLang");

  if (isSupportedLanguage(paramLang)) {
    return {
      language: paramLang,
      fromUrl: true,
    };
  }

  const savedLanguage = localStorage.getItem("siteLanguage");

  if (isSupportedLanguage(savedLanguage)) {
    return {
      language: savedLanguage,
      fromUrl: false,
    };
  }

  return {
    language: DEFAULT_LANGUAGE,
    fromUrl: false,
  };
}

/**
 * Remove userLang from the current URL without reloading the page.
 */
function clearUserLangParam() {
  const url = new URL(window.location.href);

  if (!url.searchParams.has("userLang")) {
    return;
  }

  url.searchParams.delete("userLang");

  window.history.replaceState({}, document.title, url.toString());
}

/**
 * Initialize the language selector.
 */
function initializeLanguageSwitcher(lang) {
  const switcher = document.getElementById("languageSwitcher");

  if (!switcher) return;

  switcher.value = lang;

  switcher.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;

    if (!isSupportedLanguage(selectedLanguage)) {
      console.warn(`Unsupported language "${selectedLanguage}"`);
      return;
    }

    setLanguage(selectedLanguage);

    handleVideoVisibility(selectedLanguage, true);

    handleAppButtonURL(selectedLanguage);
  });
}

/**
 * Show the English demo/video section only for English.
 */
function handleVideoVisibility(lang, isInitialLoad = true) {
  if (normalizeLanguage(lang) !== "en_us") {
    hideVideo();
    return;
  }

  showVideo(null, isInitialLoad);
}

/**
 * Add the current language to the Start Here application URL.
 */
function handleAppButtonURL(lang) {
  const btnGoToApp = document.getElementById("btnGoToApp");

  if (!btnGoToApp || !isSupportedLanguage(lang)) {
    return;
  }

  const url = new URL(btnGoToApp.href);

  url.searchParams.set("userLang", lang);

  btnGoToApp.href = url.toString();
}

/**
 * Initialize translations once the DOM is ready.
 */
domReady(async () => {
  await loadTranslations();

  const { language, fromUrl } = getInitialLanguage();

  // Apply and persist the initial language.
  setLanguage(language);

  // Set the language switcher to the same language.
  initializeLanguageSwitcher(language);

  // Configure language-dependent content.
  handleVideoVisibility(language);
  handleAppButtonURL(language);

  // userLang is only an initial language instruction.
  // Once consumed, remove it from the current URL.
  if (fromUrl) {
    clearUserLangParam();
  }
});
