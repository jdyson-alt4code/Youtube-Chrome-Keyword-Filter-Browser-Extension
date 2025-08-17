document.addEventListener("DOMContentLoaded", () => {
  const keywordInput = document.getElementById("keyword");
  const addButton = document.getElementById("add");
  const list = document.getElementById("list");
  const exportButton = document.getElementById("export");
  const importInput = document.getElementById("import");
  const importButton = document.getElementById("importBtn");

  // Initialize keywords: load from storage or from keywords.json if empty
  chrome.storage.local.get("keywords", (data) => {
    if (!data.keywords || data.keywords.length === 0) {
      // Load defaults from keywords.json
      fetch(chrome.runtime.getURL("keywords.json"))
        .then((resp) => resp.json())
        .then((defaults) => {
          chrome.storage.local.set({ keywords: defaults }, () => {
            defaults.forEach(addKeywordToList);
          });
        })
        .catch((err) => console.error("Failed to load defaults:", err));
    } else {
      data.keywords.forEach(addKeywordToList);
    }
  });

  // Add keyword
  addButton.addEventListener("click", () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) return;

    chrome.storage.local.get("keywords", (data) => {
      const keywords = data.keywords || [];
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
        chrome.storage.local.set({ keywords }, () => {
          addKeywordToList(keyword);
          keywordInput.value = "";
        });
      }
    });
  });

  // Add keyword to UI list
  function addKeywordToList(keyword) {
    const li = document.createElement("li");
    li.textContent = keyword;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";
    removeBtn.addEventListener("click", () => {
      li.remove();
      chrome.storage.local.get("keywords", (data) => {
        const keywords = (data.keywords || []).filter((k) => k !== keyword);
        chrome.storage.local.set({ keywords });
      });
    });

    li.appendChild(removeBtn);
    list.appendChild(li);
  }

  // Export keywords
  exportButton.addEventListener("click", () => {
    chrome.storage.local.get("keywords", (data) => {
      const keywords = data.keywords || [];
      const blob = new Blob([JSON.stringify(keywords, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "keywords.json";
      a.click();

      URL.revokeObjectURL(url);
    });
  });

  // Import keywords
  importButton.addEventListener("click", () => {
    importInput.click();
  });

  importInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedKeywords = JSON.parse(e.target.result);
        if (Array.isArray(importedKeywords)) {
          chrome.storage.local.set({ keywords: importedKeywords }, () => {
            list.innerHTML = "";
            importedKeywords.forEach(addKeywordToList);
          });
        } else {
          alert("Invalid file format. Must be an array.");
        }
      } catch (err) {
        alert("Failed to import keywords: " + err.message);
      }
    };
    reader.readAsText(file);
  });
});
