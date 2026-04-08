let translations = {};

async function loadTranslations() {
  const response = await fetch("assets/js/translations.json");

  if (!response.ok) {
    throw new Error(`Failed to load translations: ${response.status}`);
  }

  translations = await response.json();
}

function getTranslation(lang, key) {
  return translations?.[lang]?.[key];
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

function setLanguage(lang) {
  localStorage.setItem("siteLanguage", lang);
  document.documentElement.lang = lang;
  const videoContainer = document.querySelector(".video-container");
  const videoSection = document.querySelector("#video");
  if (videoSection) {
    if (lang === "en") {
      videoSection.classList.remove("is-hidden");
    } else {
      videoSection.classList.add("is-hidden");
    }
  }
  if (videoContainer) {
    const videoIframe = videoContainer.querySelector("iframe");
    if (videoIframe) {
      if (lang !== "en") {
        videoIframe.remove();
      }
    }
  }
  applyTextTranslations(lang);
  applyHtmlTranslations(lang);
}

function domReady(fn) {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

domReady(async () => {
  try {
    await loadTranslations();

    const switcher = document.getElementById("languageSwitcher");
    const savedLanguage = localStorage.getItem("siteLanguage") || "en";

    setLanguage(savedLanguage);

    if (switcher) {
      switcher.value = savedLanguage;
      switcher.addEventListener("change", (e) => {
        setLanguage(e.target.value);
      });
    }
  } catch (error) {
    console.error("Error initializing translations:", error);
  }
});
