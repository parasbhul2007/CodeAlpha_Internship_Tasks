const cards = [...document.querySelectorAll(".gallery-card")];
const filters = [...document.querySelectorAll(".filter-btn")];
const count = document.getElementById("visible-count");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCounter = document.getElementById("lightbox-counter");
let visibleCards = cards;
let currentIndex = 0;
let lastFocused = null;

function applyFilter(filter) {
  cards.forEach(card => {
    const show = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !show);
    card.setAttribute("aria-hidden", String(!show));
  });
  visibleCards = cards.filter(card => !card.classList.contains("is-hidden"));
  count.textContent = String(visibleCards.length).padStart(2, "0");
  filters.forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

filters.forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));

function showImage(index) {
  currentIndex = (index + visibleCards.length) % visibleCards.length;
  const card = visibleCards[currentIndex];
  const img = card.querySelector("img");
  const title = card.querySelector(".card-title").textContent;
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2,"0")} / ${String(visibleCards.length).padStart(2,"0")}`;
}

function openLightbox(card) {
  lastFocused = document.activeElement;
  const index = visibleCards.indexOf(card);
  if (index < 0) return;
  showImage(index);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("close-lightbox").focus();
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}
cards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
document.getElementById("close-lightbox").addEventListener("click", closeLightbox);
document.getElementById("prev-image").addEventListener("click", () => showImage(currentIndex - 1));
document.getElementById("next-image").addEventListener("click", () => showImage(currentIndex + 1));

document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showImage(currentIndex - 1);
  if (event.key === "ArrowRight") showImage(currentIndex + 1);
});
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
applyFilter("all");
