const searchForm = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");
const resultsCount = document.getElementById("results-count");
const resultsIndex = document.querySelector(".results-index");
const emptyState = document.querySelector(".empty-state");
const emptyStateTitle = document.querySelector(".empty-state-title");
const emptyStateCopy = document.querySelector(".empty-state-copy");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image search failed: ${response.status}`);
  }

  const data = await response.json();
  const items = Object.values(data.query?.pages ?? {});

  results.innerHTML = "";

  items.forEach((item) => {
    const imageInfo = item.imageinfo?.[0];
    const card = document.createElement("article");
    const image = document.createElement("img");
    const caption = document.createElement("p");
    const title = item.title.replace(/^File:/, "").replaceAll("_", " ");

    card.className = "result-card";
    image.src = imageInfo.thumburl;
    image.alt = title;
    image.loading = "lazy";
    caption.className = "result-caption";
    caption.textContent = title;

    card.appendChild(image);
    card.appendChild(caption);
    results.appendChild(card);
  });

  resultsCount.textContent = `Showing ${items.length} result${items.length === 1 ? "" : "s"} for “${query}”`;
  resultsIndex.textContent = `01 — ${String(items.length).padStart(2, "0")}`;
  emptyState.hidden = items.length > 0;

  if (items.length === 0) {
    emptyStateTitle.textContent = "Nothing gathered yet";
    emptyStateCopy.textContent = `No images found for “${query}”. Try another search.`;
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.textContent.trim();
    searchForm.requestSubmit(searchButton);
  });
});
