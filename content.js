(function () {
  let keywords = [];

  console.log("Keyword Filter Extension: Script loaded");

  function hideElements() {
    const items = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-grid-media"
    );

    items.forEach((item) => {
      if (item.style.display === "none") return; // Skip already hidden

      // Try different possible title selectors
      const titleElement = item.querySelector(
        '#video-title, a#video-title-link, h3 a, yt-formatted-string#video-title'
      );

      if (!titleElement) return;

      const title = (titleElement.textContent || "").toLowerCase().trim();

      if (title && keywords.some((kw) => title.includes(kw.toLowerCase()))) {
        console.log("Keyword Filter Extension: Hiding ->", title);
        item.style.display = "none";
      }
    });
  }

  // Load stored keywords
  chrome.storage.local.get("keywords", (data) => {
    keywords = data.keywords || [];
    console.log("Keyword Filter Extension: Loaded keywords:", keywords);

    if (keywords.length > 0) {
      // Initial hides (allow time for YT to load)
      setTimeout(hideElements, 500);
      setTimeout(hideElements, 2000);
      setTimeout(hideElements, 5000);

      // Watch for new recommendations/videos
      const targetNode =
        document.querySelector("ytd-page-manager") || document.body;
      const observer = new MutationObserver(hideElements);
      observer.observe(targetNode, { childList: true, subtree: true });
      console.log("Keyword Filter Extension: MutationObserver started");
    }
  });

  // Listen for keyword updates from popup.js
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.keywords) {
      keywords = changes.keywords.newValue || [];
      console.log("Keyword Filter Extension: Keywords updated:", keywords);
      hideElements();
    }
  });
})();
