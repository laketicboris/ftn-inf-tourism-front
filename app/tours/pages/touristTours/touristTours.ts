import { TourService } from "../../services/tour.service.js";
import { Tour } from "../../models/tour.model.js";
import { Keypoint } from "../../models/keypoint.model.js";

const tourService = new TourService();

let currentPage = 1;
let pageSize = 10;
let sortBy = 'Name';
let sortDirection = 'ASC';
let totalCount = 0;
let currentTours: Tour[] = [];

let toursGrid: HTMLElement;
let paginationInfo: HTMLElement;
let currentPageSpan: HTMLElement;
let prevBtn: HTMLButtonElement;
let nextBtn: HTMLButtonElement;
let loadingOverlay: HTMLElement;
let errorMessage: HTMLElement;
let sortBySelect: HTMLSelectElement;
let sortDirectionSelect: HTMLSelectElement;
let pageSizeSelect: HTMLSelectElement;

document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();
  loadTours();
});

function initializeElements(): void {
  toursGrid = document.getElementById("tours-grid")!;
  paginationInfo = document.getElementById("pagination-info")!;
  currentPageSpan = document.getElementById("currentPage")!;
  prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
  nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
  loadingOverlay = document.getElementById("loading")!;
  errorMessage = document.getElementById("error-message")!;
  sortBySelect = document.getElementById("sortBy") as HTMLSelectElement;
  sortDirectionSelect = document.getElementById("sortDirection") as HTMLSelectElement;
  pageSizeSelect = document.getElementById("pageSize") as HTMLSelectElement;
}

function setupEventListeners(): void {
  sortBySelect.addEventListener("change", () => {
    sortBy = sortBySelect.value;
    currentPage = 1;
    loadTours();
  });

  sortDirectionSelect.addEventListener("change", () => {
    sortDirection = sortDirectionSelect.value;
    currentPage = 1;
    loadTours();
  });

  pageSizeSelect.addEventListener("change", () => {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    loadTours();
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadTours();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      loadTours();
    }
  });

  setupModalControls();
}

function setupModalControls(): void {
  const modal = document.getElementById("tourModal")!;
  const closeBtn = modal.querySelector(".close")!;

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

function loadTours(): void {
  showLoading(true);
  hideError();

  tourService.getPublishedTours(currentPage, pageSize, sortBy, sortDirection)
    .then(result => {
      currentTours = result.data;
      totalCount = result.totalCount;
      renderTours();
      updatePaginationInfo();
      updatePaginationControls();
    })
    .catch(error => {
      console.error("Error loading tours:", error);
      showError("Failed to load tours. Please try again.");
    })
    .finally(() => {
      showLoading(false);
    });
}

function renderTours(): void {
  toursGrid.innerHTML = "";

  if (currentTours.length === 0) {
    toursGrid.innerHTML = "<div class='no-tours'>No published tours available.</div>";
    return;
  }

  const template = document.getElementById("tour-card-template") as HTMLTemplateElement;

  currentTours.forEach(tour => {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    
    const nameElement = clone.querySelector(".tour-name")!;
    const dateElement = clone.querySelector(".tour-date")!;
    const descriptionElement = clone.querySelector(".tour-description")!;
    const guestsCountElement = clone.querySelector(".guests-count")!;
    const viewDetailsBtn = clone.querySelector(".view-details-btn") as HTMLButtonElement;

    nameElement.textContent = tour.name;
    dateElement.textContent = formatDate(tour.dateTime);
    descriptionElement.textContent = truncateDescription(tour.description, 100);
    guestsCountElement.textContent = tour.maxGuests.toString();

    viewDetailsBtn.addEventListener("click", () => {
      showTourDetails(tour);
    });

    toursGrid.appendChild(clone);
  });
}

function showTourDetails(tour: Tour): void {
  const modal = document.getElementById("tourModal")!;
  const modalTourName = document.getElementById("modalTourName")!;
  const modalDescription = document.getElementById("modalDescription")!;
  const modalDateTime = document.getElementById("modalDateTime")!;
  const modalMaxGuests = document.getElementById("modalMaxGuests")!;
  const modalKeypoints = document.getElementById("modalKeypoints")!;
  
  modalTourName.textContent = tour.name;
  modalDescription.textContent = tour.description;
  modalDateTime.textContent = formatDate(tour.dateTime);
  modalMaxGuests.textContent = tour.maxGuests.toString();
  modal.style.display = "flex";

  tourService.getById(tour.id)
    .then(fullTour => {
      renderKeypoints(fullTour.keyPoints || [], modalKeypoints);
    })
    .catch(error => {
      console.error("Error loading tour details:", error);
      modalKeypoints.innerHTML = "<p style='text-align: center; color: #ff6b6b;'>Failed to load key points.</p>";
    });
}

function renderKeypoints(keypoints: Keypoint[], container: HTMLElement): void {
  container.innerHTML = "";

  if (keypoints.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: #666;'>No key points available for this tour.</p>";
    return;
  }
  
  keypoints.forEach(keypoint => {
    const keypointDiv = document.createElement("div");
    keypointDiv.className = "keypoint-item";
    keypointDiv.innerHTML = `
  <div class="keypoint-image">
    <img src="${keypoint.imageUrl || 'https://via.placeholder.com/80x80?text=📍'}" alt="${keypoint.name}" />
  </div>
  <div class="keypoint-content">
    <h4 class="keypoint-name">${keypoint.name}</h4>
    <p class="keypoint-description">${keypoint.description}</p>
    <p class="keypoint-coordinates">📍 ${keypoint.latitude}°, ${keypoint.longitude}°</p>
  </div>
`;
    container.appendChild(keypointDiv);
  });
}

function updatePaginationInfo(): void {
  const startItem = totalCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalCount} tours`;
}

function updatePaginationControls(): void {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  currentPageSpan.textContent = `Page ${currentPage}`;
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('sr-RS', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength) + "...";
}

function showLoading(show: boolean): void {
  loadingOverlay.style.display = show ? "flex" : "none";
}

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

function hideError(): void {
  errorMessage.style.display = "none";
}