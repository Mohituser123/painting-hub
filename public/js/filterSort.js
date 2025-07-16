// public/js/filterSort.js

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");
  const mediumFilter = document.getElementById("mediumFilter");
  const sortBy = document.getElementById("sortBy");
  const paintingGrid = document.getElementById("paintingGrid");

  function filterPaintings() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    const selectedMedium = mediumFilter.value;

    const paintings = Array.from(paintingGrid.children);

    paintings.forEach((item) => {
      const title = item.dataset.title;
      const artist = item.dataset.artist;
      const genre = item.dataset.genre;
      const medium = item.dataset.medium;

      const matchesSearch = title.includes(searchQuery) || artist.includes(searchQuery);
      const matchesGenre = !selectedGenre || genre === selectedGenre;
      const matchesMedium = !selectedMedium || medium === selectedMedium;

      item.style.display = (matchesSearch && matchesGenre && matchesMedium) ? "block" : "none";
    });
  }

  function sortPaintings() {
    const sortValue = sortBy.value;
    const visiblePaintings = Array.from(paintingGrid.children).filter(
      (item) => item.style.display !== "none"
    );

    visiblePaintings.sort((a, b) => {
      const priceA = parseInt(a.querySelector(".card-text").textContent.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.querySelector(".card-text").textContent.replace(/[^0-9]/g, ""));

      return sortValue === "asc" ? priceA - priceB : priceB - priceA;
    });

    visiblePaintings.forEach((item) => paintingGrid.appendChild(item));
  }

  searchInput?.addEventListener("input", () => {
    filterPaintings();
    sortPaintings();
  });
  genreFilter?.addEventListener("change", () => {
    filterPaintings();
    sortPaintings();
  });
  mediumFilter?.addEventListener("change", () => {
    filterPaintings();
    sortPaintings();
  });
  sortBy?.addEventListener("change", sortPaintings);
});
