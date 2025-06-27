// Modal functionality
const modal = document.getElementById("imageModal");
const modalIframe = document.getElementById("modalIframe");
const closeBtn = document.getElementsByClassName("close")[0];

function openModal(iframeSrc, eventName) {
  modal.style.display = "block";
  modalIframe.src = iframeSrc;
  modalIframe.title = eventName;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.style.display = "none";
  modalIframe.src = "";
  document.body.style.overflow = "auto";
}

closeBtn.onclick = closeModal;

window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};

// Keyboard support
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Slideshow functionality
let slideshows = {};

function createSlideshow(eventId, images) {
  slideshows[eventId] = {
    images: images,
    currentSlide: 0,
    totalSlides: images.length,
  };
}

function showSlide(eventId, slideIndex) {
  const slideshow = slideshows[eventId];
  if (!slideshow) return;

  const slides = document.querySelectorAll(`[data-event="${eventId}"] .slide`);
  const dots = document.querySelectorAll(`[data-event="${eventId}"] .dot`);
  const counter = document.querySelector(
    `[data-event="${eventId}"] .slide-counter`
  );

  // Hide all slides
  slides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  // Wrap around if necessary
  if (slideIndex >= slideshow.totalSlides) slideIndex = 0;
  if (slideIndex < 0) slideIndex = slideshow.totalSlides - 1;

  slideshow.currentSlide = slideIndex;

  // Show current slide
  if (slides[slideIndex]) {
    slides[slideIndex].classList.add("active");
  }
  if (dots[slideIndex]) {
    dots[slideIndex].classList.add("active");
  }

  // Update counter
  if (counter) {
    counter.textContent = `${slideIndex + 1}/${slideshow.totalSlides}`;
  }
}

function nextSlide(eventId) {
  const slideshow = slideshows[eventId];
  if (!slideshow) return;
  showSlide(eventId, slideshow.currentSlide + 1);
}

function prevSlide(eventId) {
  const slideshow = slideshows[eventId];
  if (!slideshow) return;
  showSlide(eventId, slideshow.currentSlide - 1);
}

function currentSlide(eventId, slideIndex) {
  showSlide(eventId, slideIndex);
}
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// Add these functions to your existing script.js file

// Like functionality
// Add these functions to your script.js

// Function to check if user has liked an event
function hasUserLiked(eventId) {
  const likedEvents = JSON.parse(localStorage.getItem("likedEvents") || "[]");
  return likedEvents.includes(eventId);
}

// Function to toggle user's like status
function toggleUserLike(eventId) {
  let likedEvents = JSON.parse(localStorage.getItem("likedEvents") || "[]");

  if (likedEvents.includes(eventId)) {
    // Remove from liked events
    likedEvents = likedEvents.filter((id) => id !== eventId);
  } else {
    // Add to liked events
    likedEvents.push(eventId);
  }

  localStorage.setItem("likedEvents", JSON.stringify(likedEvents));
  return !hasUserLiked(eventId); // Return new state (opposite of what it was)
}

// Updated toggleLike function
async function toggleLike(eventId, likeBtn, likesCountElement) {
  const wasLiked = hasUserLiked(eventId);

  try {
    const response = await fetch(`/events/${eventId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ increment: !wasLiked }),
    });

    const result = await response.json();

    if (response.ok) {
      // Toggle user's like status
      toggleUserLike(eventId);
      const isNowLiked = hasUserLiked(eventId);

      // Update UI
      if (isNowLiked) {
        likeBtn.classList.add("liked");
        likeBtn.querySelector("i").classList.remove("far");
        likeBtn.querySelector("i").classList.add("fas");

        // Add animation
        likeBtn.classList.add("animate");
        setTimeout(() => {
          likeBtn.classList.remove("animate");
        }, 600);

        // Create floating heart
        createFloatingHeart(likeBtn);
      } else {
        likeBtn.classList.remove("liked");
        likeBtn.querySelector("i").classList.remove("fas");
        likeBtn.querySelector("i").classList.add("far");
      }

      // Update likes count
      likesCountElement.textContent = result.likes;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

// Updated loadGallery function to show correct like state
async function loadGallery() {
  try {
    const res = await fetch("/events");
    let events = await res.json();

    // Sort events by date (newest first)
    events = events.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    events.forEach((event, eventIndex) => {
      const eventId = `event-${eventIndex}`;
      const mongoEventId = event._id;
      const isLiked = hasUserLiked(mongoEventId);

      // Create slideshow for this event
      createSlideshow(eventId, event.images);

      // Generate slides HTML
      let slidesHTML = "";
      let dotsHTML = "";

      event.images.forEach((img, imgIndex) => {
        slidesHTML += `
                    <div class="slide ${
                      imgIndex === 0 ? "active" : ""
                    }" onclick="openModal('${img}', '${event.event}')">
                        <iframe
                            src="${img}"
                            allow="autoplay"
                            loading="lazy"
                            title="${event.event}">
                        </iframe>
                        <div class="media-overlay">
                            <i class="fas fa-expand-arrows-alt expand-icon"></i>
                        </div>
                    </div>
                `;

        dotsHTML += `<span class="dot ${
          imgIndex === 0 ? "active" : ""
        }" onclick="currentSlide('${eventId}', ${imgIndex})"></span>`;
      });

      // Show navigation only if there are multiple images
      const navigationHTML =
        event.images.length > 1
          ? `
                <button class="slideshow-nav prev" onclick="prevSlide('${eventId}')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="slideshow-nav next" onclick="nextSlide('${eventId}')">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="slide-counter">${1}/${event.images.length}</div>
                <div class="slide-dots">${dotsHTML}</div>
            `
          : "";

      const cardHTML = `
                <div class="card" data-event="${eventId}">
                    <div class="slideshow-container">
                        ${slidesHTML}
                        ${navigationHTML}
                    </div>
                    <div class="card-content">
                        <h3>${event.event}</h3>
                        <div class="likes-container">
                            <button class="like-btn ${
                              isLiked ? "liked" : ""
                            }" onclick="toggleLike('${mongoEventId}', this, this.nextElementSibling)">
                                <i class="${
                                  isLiked ? "fas" : "far"
                                } fa-heart"></i>
                            </button>
                            <span class="likes-count">${event.likes || 0}</span>
                        </div>
                        <div class="card-info">
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${event.location}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${formatDate(event.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      gallery.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
    document.getElementById("gallery").innerHTML =
      '<p style="text-align: center; color: #ff6b6b; font-size: 1.2rem;">Error loading gallery. Please try again later.</p>';
  }
}
function createFloatingHeart(element) {
  const heart = document.createElement("div");
  heart.innerHTML = '<i class="fas fa-heart"></i>';
  heart.className = "floating-heart";

  const rect = element.getBoundingClientRect();
  heart.style.position = "fixed";
  heart.style.left = rect.left + rect.width / 2 + "px";
  heart.style.top = rect.top + "px";

  document.body.appendChild(heart);

  setTimeout(() => {
    document.body.removeChild(heart);
  }, 1000);
}

// Load gallery when page loads
window.onload = loadGallery;
