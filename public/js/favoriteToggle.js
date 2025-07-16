// public/js/favoriteToggle.js

document.addEventListener("DOMContentLoaded", () => {
  const favoriteBtns = document.querySelectorAll(".favorite-toggle");

  favoriteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const paintingId = btn.dataset.painting;
      const userId = btn.dataset.user;

      try {
        const res = await fetch(`/users/${userId}/favorites/${paintingId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (data.success) {
          btn.classList.toggle("favorited");
          btn.innerHTML = btn.classList.contains("favorited") ? "<i class='fa-solid fa-heart'></i>" : "<i class='fa-regular fa-heart'></i>";
          showToast(data.message || "Favorite updated!");
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
        showToast("Something went wrong. Try again.");
      }
    });
  });
});

function showToast(message) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}