const themeToggle = document.querySelector(".theme-toggle");
const themeKey = "ene-theme";

function setTheme(theme) {
  document.body.dataset.theme = theme;
  const dark = theme === "dark";
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.firstElementChild.textContent = dark ? "☾" : "☼";
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#191a18" : "#f7f4ee");
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem(themeKey) || "light";
} catch {
  savedTheme = "light";
}
setTheme(savedTheme === "dark" ? "dark" : "light");

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    localStorage.setItem(themeKey, nextTheme);
  } catch {
    // Theme switching still works when storage is unavailable.
  }
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  primaryNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  primaryNav?.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
});

primaryNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const filterButtons = document.querySelectorAll(".filter-button");
const galleryItems = [...document.querySelectorAll(".gallery-item")];

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    galleryItems.forEach((item) => {
      item.hidden = filter !== "all" && item.dataset.category !== filter;
    });
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("figure img");
const lightboxTitle = lightbox?.querySelector("#lightboxTitle");
const lightboxDescription = lightbox?.querySelector("figcaption p");
const lightboxCategory = lightbox?.querySelector(".lightbox-category");
let activeGalleryIndex = 0;
let previousFocus = null;

function showGalleryItem(index) {
  const visibleItems = galleryItems.filter((item) => !item.hidden);
  if (!visibleItems.length || !lightbox) return;
  activeGalleryIndex = (index + visibleItems.length) % visibleItems.length;
  const item = visibleItems[activeGalleryIndex];
  const image = item.querySelector("img");
  lightboxImage.src = item.dataset.image;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = item.dataset.title;
  lightboxDescription.textContent = item.dataset.description;
  lightboxCategory.textContent = item.dataset.category.replaceAll("-", " ");
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    previousFocus = item;
    showGalleryItem(galleryItems.filter((entry) => !entry.hidden).indexOf(item));
    lightbox.showModal();
    lightbox.querySelector(".lightbox-close").focus();
  });
});

lightbox?.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
lightbox?.querySelector(".lightbox-prev")?.addEventListener("click", () => showGalleryItem(activeGalleryIndex - 1));
lightbox?.querySelector(".lightbox-next")?.addEventListener("click", () => showGalleryItem(activeGalleryIndex + 1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener("cancel", (event) => {
  event.preventDefault();
  lightbox.close();
});
lightbox?.addEventListener("close", () => previousFocus?.focus());
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    lightbox.close();
    return;
  }
  if (event.key === "ArrowLeft") showGalleryItem(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryItem(activeGalleryIndex + 1);
});

const comparison = document.querySelector(".comparison");
const comparisonRange = document.querySelector(".comparison-range");
comparisonRange?.addEventListener("input", () => {
  comparison.style.setProperty("--split", `${comparisonRange.value}%`);
});

const slides = [...document.querySelectorAll(".testimonial-slide")];
const slideCurrent = document.querySelector("#slideCurrent");
let activeSlide = 0;

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeSlide));
  if (slideCurrent) slideCurrent.textContent = String(activeSlide + 1).padStart(2, "0");
}

document.querySelectorAll(".slide-arrow").forEach((button) => {
  button.addEventListener("click", () => showSlide(activeSlide + (button.dataset.slide === "next" ? 1 : -1)));
});

const testimonialSlider = document.querySelector(".testimonial-slider");
let slidePointerStart = null;
testimonialSlider?.addEventListener("pointerdown", (event) => {
  slidePointerStart = event.clientX;
});
testimonialSlider?.addEventListener("pointerup", (event) => {
  if (slidePointerStart === null) return;
  const distance = event.clientX - slidePointerStart;
  if (Math.abs(distance) > 45) showSlide(activeSlide + (distance < 0 ? 1 : -1));
  slidePointerStart = null;
});
testimonialSlider?.addEventListener("pointercancel", () => {
  slidePointerStart = null;
});

const serviceSelect = document.querySelector('select[name="service"]');
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    if (serviceSelect) serviceSelect.value = link.dataset.service;
  });
});

const bookingForm = document.querySelector("#bookingForm");
const bookingStatus = document.querySelector("#bookingStatus");
const dateInput = bookingForm?.querySelector('input[name="date"]');
if (dateInput) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localToday;
}

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const details = Object.fromEntries(new FormData(bookingForm).entries());
  const message = [
    "Hello ENE, I would like to check availability for a makeup booking.",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    `Service: ${details.service}`,
    `Event date: ${details.date}`,
    `Preferred time: ${details.time || "Flexible"}`,
    `Location: ${details.location}`,
    `Number of people: ${details.people}`,
    `Makeup style: ${details.style || "Not specified"}`,
    `Notes: ${details.notes || "None"}`
  ].join("\n");
  const whatsappUrl = `https://wa.me/2348165036707?text=${encodeURIComponent(message)}`;
  bookingStatus.textContent = "Your enquiry is ready in WhatsApp. Send the message there and ENE will confirm your date personally.";
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const details = Object.fromEntries(new FormData(contactForm).entries());
  const subject = encodeURIComponent(`Message from ${details.name}`);
  const body = encodeURIComponent(`Name: ${details.name}\nEmail: ${details.email}\n\n${details.message}`);
  contactStatus.textContent = "Your email app is opening with your message.";
  window.location.href = `mailto:fenesunday@gmail.com?subject=${subject}&body=${body}`;
});

document.querySelector("#year").textContent = String(new Date().getFullYear());