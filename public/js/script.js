// Bootstrap Form Validation
(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// DARK MODE TOGGLE
const desktopToggleBtn = document.getElementById("themeToggle");
const mobileToggleBtn = document.getElementById("themeToggleMobile");
const body = document.body;

function toggleDarkMode() {
  body.classList.toggle("dark-mode");
  localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
}

desktopToggleBtn?.addEventListener("click", toggleDarkMode);
mobileToggleBtn?.addEventListener("click", toggleDarkMode);

window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
  }
};

// Filter Paintings
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const mediumFilter = document.getElementById("mediumFilter");
const paintings = document.querySelectorAll(".painting-item");

function filterPaintings() {
  const searchText = searchInput.value.toLowerCase();
  const selectedGenre = genreFilter.value;
  const selectedMedium = mediumFilter.value;

  paintings.forEach(p => {
    const matchesTitle = p.dataset.title.includes(searchText);
    const matchesArtist = p.dataset.artist.includes(searchText);
    const matchesGenre = selectedGenre === "" || p.dataset.genre === selectedGenre;
    const matchesMedium = selectedMedium === "" || p.dataset.medium === selectedMedium;

    p.style.display = (matchesTitle || matchesArtist) && matchesGenre && matchesMedium ? "block" : "none";
  });
}

searchInput?.addEventListener("input", filterPaintings);
genreFilter?.addEventListener("change", filterPaintings);
mediumFilter?.addEventListener("change", filterPaintings);

// ⭐ FAVORITE TOGGLE FUNCTIONALITY
document.querySelectorAll(".favorite-toggle").forEach(btn => {
  btn.addEventListener("click", async function () {
    const paintingId = this.dataset.painting;
    const userId = this.dataset.user;

    try {
      const res = await fetch(`/profile/${userId}/favorites/${paintingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const icon = this.querySelector("i");
        const isFavorited = this.classList.toggle("favorited");

        icon.classList.toggle("fa-solid", isFavorited);
        icon.classList.toggle("fa-regular", !isFavorited);
      } else {
        alert("Failed to update favorite. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong.");
    }
  });
});

// 💬 Chat UI toggle
const chatBtn = document.getElementById("openChat");
const chatBox = document.getElementById("chat-assistant");
const closeChatBtn = document.getElementById("closeChat");

chatBtn?.addEventListener("click", () => {
  chatBox.style.display = "flex";
});

closeChatBtn?.addEventListener("click", () => {
  chatBox.style.display = "none";
});

// 💬 Chat message handling
document.getElementById("chatForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  const chatBody = document.getElementById("chatBody");

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatBody.appendChild(userMsg);
  input.value = "";

  // Loading message
  const botMsg = document.createElement("div");
  botMsg.className = "bot-message";
  botMsg.textContent = "Thinking...";
  chatBody.appendChild(botMsg);

  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const paintingId = document.getElementById("openChat").dataset.painting;

    const res = await fetch("/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message, paintingId })
    });

    const data = await res.json();

    if (data.response) {
      botMsg.textContent = data.response;
    } else {
      botMsg.textContent = "Sorry, I couldn't understand that.";
    }
  } catch (err) {
    console.error("AI Error:", err);
    botMsg.textContent = "Something went wrong. Please try again later.";
  }

  chatBody.scrollTop = chatBody.scrollHeight;
});
