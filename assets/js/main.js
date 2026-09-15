/*
 * Take on Transplant
 * Page-specific JavaScript.
 */

"use strict";

// Remove preload class once the page has loaded.
window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.remove("is-preload");
  }, 100);
});

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

/**
 * Hide the demo section and stop the video.
 */
function hideVideo() {
  const demoSection = document.querySelector("#videoDemoSection");

  if (demoSection) {
    demoSection.classList.add("is-hidden");
  }

  killVideo();
}

/**
 * Close the video and remove the iframe.
 */
function killVideo() {
  const section = document.querySelector("#videoSection");
  const container = document.querySelector(".video-container");

  if (section) {
    section.classList.add("is-hidden");
  }

  if (container) {
    container.innerHTML = "";
  }
}

/**
 * Display the demo video.
 */
function showVideo(event, isInitialLoad = false) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const demoSection = document.querySelector("#videoDemoSection");

  if (isInitialLoad) {
    if (demoSection) {
      demoSection.classList.remove("is-hidden");
    }
    return;
  }

  const section = document.querySelector("#videoSection");
  const container = document.querySelector(".video-container");

  if (!section || !container) {
    return;
  }

  section.classList.remove("is-hidden");

  // Only create the iframe once.
  if (!container.querySelector("iframe")) {
    container.innerHTML = `
      <iframe
        class="sproutvideo-player"
        src="https://videos.sproutvideo.com/embed/ea9ddbb9151fe4c163/4fb76d5c32d9cf9f?playerTheme=light&type=hd&autoplay=true"
        title="Take on Transplant Demo Video"
        allow="autoplay; fullscreen"
        allowfullscreen>
      </iframe>
    `;
  }

  // Jump directly to the video section (no smooth scrolling).
  section.scrollIntoView({
    block: "start",
  });
}
