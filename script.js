const searchForm = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");
const resultsCount = document.getElementById("results-count");
const resultsIndex = document.querySelector(".results-index");
const emptyState = document.querySelector(".empty-state");
const emptyStateTitle = document.querySelector(".empty-state-title");
const emptyStateCopy = document.querySelector(".empty-state-copy");
let activeSearch = 0;

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  const searchId = ++activeSearch;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;

  results.innerHTML = "";
  results.setAttribute("aria-busy", "true");
  emptyState.hidden = false;
  emptyState.classList.add("is-loading");
  emptyStateTitle.textContent = "Searching…";
  emptyStateCopy.textContent = `Gathering images for “${query}”.`;
  resultsCount.textContent = "Searching the collection…";
  resultsIndex.textContent = "… — …";
  searchButton.disabled = true;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Image search failed: ${response.status}`);
    }

    const data = await response.json();
    const items = Object.values(data.query?.pages ?? {});

    if (searchId !== activeSearch) {
      return;
    }

    items.forEach((item) => {
      const imageInfo = item.imageinfo?.[0];
      if (!imageInfo?.thumburl) {
        return;
      }

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

    const resultCount = results.childElementCount;
    resultsCount.textContent = resultCount
      ? `Showing ${resultCount} result${resultCount === 1 ? "" : "s"} for “${query}”`
      : `No results for “${query}”`;
    resultsIndex.textContent = `01 — ${String(resultCount).padStart(2, "0")}`;
    emptyState.hidden = resultCount > 0;

    if (resultCount === 0) {
      emptyStateTitle.textContent = "Nothing gathered yet";
      emptyStateCopy.textContent = `No results for “${query}”. Try another search.`;
    }
  } catch (error) {
    if (searchId !== activeSearch) {
      return;
    }

    console.error("Image search failed:", error);
    resultsCount.textContent = "Search couldn't be completed";
    resultsIndex.textContent = "— —";
    emptyState.hidden = false;
    emptyStateTitle.textContent = "Something went wrong";
    emptyStateCopy.textContent = "Please try again.";
  } finally {
    if (searchId === activeSearch) {
      results.removeAttribute("aria-busy");
      emptyState.classList.remove("is-loading");
      searchButton.disabled = false;
    }
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.textContent.trim();
    searchForm.requestSubmit(searchButton);
  });
});
