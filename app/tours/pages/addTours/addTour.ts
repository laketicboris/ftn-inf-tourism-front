import { TourService } from "../../services/tour.service.js";
import { TourFormData } from "../../models/tourFormData.model.js";
import { KeypointFormData } from "../../models/keypointFormData.model.js";
import { Keypoint } from "../../models/keypoint.model.js";

const tourService = new TourService();
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
  if (tourId) {
    loadTourForEdit(parseInt(tourId));
  }

  initAddTourForm();
  setupKeypointForm();
  setupPublishButton();
});

function initAddTourForm(): void {
  const form = document.querySelector("#add-tour-form") as HTMLFormElement;
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const tourData = collectTourFormData();
    if (!tourData) return;

    if (tourId) {
      tourService.update(Number(tourId), tourData)
        .then(() => {
          window.location.href = "../viewTours/viewTour.html";
        })
        .catch(err => showError(err.message));
    } else {
      tourService.create(tourData)
        .then(() => {
          window.location.href = "../viewTours/viewTour.html";
        })
        .catch(err => showError(err.message));
    }
  });
}

function collectTourFormData(): TourFormData | null {
  const name = (document.getElementById("name") as HTMLInputElement).value;
  const description = (document.getElementById("description") as HTMLTextAreaElement).value;
  const dateTime = (document.getElementById("startDateTime") as HTMLInputElement).value;
  const maxGuests = parseInt((document.getElementById("maxParticipants") as HTMLInputElement).value);
  const status = (document.getElementById("status") as HTMLSelectElement).value;

  const userIdString = localStorage.getItem("userId");
  if (!userIdString || isNaN(Number(userIdString))) {
    showError("User not logged in or ID is invalid.");
    return null;
  }

  return {
    name,
    description,
    dateTime,
    maxGuests,
    guideId: Number(userIdString),
    status
  };
}

function setupKeypointForm(): void {
  const form = document.getElementById("keypoint-form") as HTMLFormElement;
  const inputs = form.querySelectorAll("input");
  const addBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;

  form.addEventListener("input", () => {
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) valid = false;
    });
    addBtn.disabled = !valid;
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!tourId) return;

    addBtn.disabled = true;
    addBtn.textContent = "Adding...";

    tourService.getById(Number(tourId)).then(tour => {
      const kp: KeypointFormData = {
        name: (document.getElementById("kp-name") as HTMLInputElement).value,
        description: (document.getElementById("kp-desc") as HTMLInputElement).value,
        imageUrl: (document.getElementById("kp-img") as HTMLInputElement).value,
        latitude: parseFloat((document.getElementById("kp-lat") as HTMLInputElement).value),
        longitude: parseFloat((document.getElementById("kp-lon") as HTMLInputElement).value),
        order: tour.keyPoints.length + 1,
        tourId: Number(tourId)
      };

      tourService.addKeyPoint(Number(tourId), kp)
        .then(() => {
          clearKeypointForm();
          loadTourForEdit(Number(tourId));
          addBtn.disabled = false;
          addBtn.textContent = "Add Keypoint";
        })
        .catch(err => {
          showError(err.message);
          addBtn.disabled = false;
          addBtn.textContent = "Add Keypoint";
        });
    }).catch(err => {
      showError("Error loading tour: " + err.message);
      addBtn.disabled = false;
      addBtn.textContent = "Add Keypoint";
    });
  });
}

function clearKeypointForm(): void {
  (document.getElementById("kp-name") as HTMLInputElement).value = "";
  (document.getElementById("kp-desc") as HTMLInputElement).value = "";
  (document.getElementById("kp-img") as HTMLInputElement).value = "";
  (document.getElementById("kp-lat") as HTMLInputElement).value = "";
  (document.getElementById("kp-lon") as HTMLInputElement).value = "";
}

function setupPublishButton(): void {
  const publishBtn = document.getElementById("publishBtn") as HTMLButtonElement;
  publishBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!tourId) return;

    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing...";

    tourService.getById(Number(tourId)).then(tour => {
      const canPublish = tour.keyPoints.length >= 2 &&
        tour.keyPoints.every(kp => kp.description.length >= 250);

      if (!canPublish) {
        showError("At least 2 keypoints and 250 characters in description are required.");
        publishBtn.disabled = false;
        publishBtn.textContent = "Publish Tour";
        return;
      }

      const tourData: TourFormData = {
        name: tour.name,
        description: tour.description,
        dateTime: tour.dateTime,
        maxGuests: tour.maxGuests,
        guideId: tour.guideId,
        status: "objavljena"
      };

      tourService.update(tour.id, tourData)
        .then(() => {
          window.location.href = "../viewTours/viewTour.html";
        })
        .catch(err => {
          showError(err.message);
          publishBtn.disabled = false;
          publishBtn.textContent = "Publish Tour";
        });
    });
  });
}

function loadTourForEdit(id: number): void {
  tourService.getById(id).then(tour => {
    if (!tour) {
      showError("Tour not found.");
      return;
    }

    (document.getElementById("name") as HTMLInputElement).value = tour.name;
    (document.getElementById("description") as HTMLTextAreaElement).value = tour.description;
    (document.getElementById("startDateTime") as HTMLInputElement).value = tour.dateTime.slice(0, 16);
    (document.getElementById("maxParticipants") as HTMLInputElement).value = tour.maxGuests.toString();
    (document.getElementById("status") as HTMLSelectElement).value = tour.status;

    const h1 = document.querySelector("h1");
    if (h1) h1.textContent = "Edit Tour";

    const submitBtn = document.getElementById("saveBtn");
    if (submitBtn) submitBtn.textContent = "Update Tour";

    renderKeypoints(tour.keyPoints);
    validatePublishButton();
  });
}

function renderKeypoints(keypoints: Keypoint[]): void {
  const container = document.querySelector("#keypoints-container");
  if (!container) return;

  if (keypoints.length === 0) {
    const noKeypointsTemplate = document.getElementById("no-keypoints-template") as HTMLTemplateElement;
    const clone = noKeypointsTemplate.content.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(clone);
    return;
  }

  container.innerHTML = "";

  keypoints.forEach(kp => {
    const template = document.getElementById("keypoint-card-template") as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as DocumentFragment;

    // Popuni podatke
    const img = clone.querySelector(".card-image img") as HTMLImageElement;
    const title = clone.querySelector(".card-title") as HTMLElement;
    const description = clone.querySelector(".card-description") as HTMLElement;
    const coordinates = clone.querySelector(".card-coordinates") as HTMLElement;
    const fullDescription = clone.querySelector(".full-description") as HTMLElement;
    const detailsBtn = clone.querySelector(".details-btn") as HTMLButtonElement;
    const removeBtn = clone.querySelector(".remove-btn") as HTMLButtonElement;
    const detailsDiv = clone.querySelector(".card-details") as HTMLElement;

    img.src = kp.imageUrl;
    img.alt = kp.name;
    title.textContent = kp.name;

    const shortDescription = kp.description.length > 100
      ? kp.description.substring(0, 100) + "..."
      : kp.description;
    description.textContent = shortDescription;

    coordinates.textContent = `📍 ${kp.latitude}, ${kp.longitude}`;
    fullDescription.textContent = kp.description;

    detailsDiv.id = `details-${kp.id}`;
    detailsBtn.setAttribute("data-id", kp.id.toString());
    removeBtn.setAttribute("data-id", kp.id.toString());

    container.appendChild(clone);
  });

  setupCardListeners();
}

function setupCardListeners(): void {
  const detailButtons = document.querySelectorAll(".details-btn");
  detailButtons.forEach(button => {
    button.addEventListener("click", () => {
      const id = (button as HTMLElement).getAttribute("data-id");
      const detailsDiv = document.getElementById(`details-${id}`);

      if (detailsDiv) {
        if (detailsDiv.style.display === "none") {
          detailsDiv.style.display = "block";
          (button as HTMLButtonElement).textContent = "Hide";
        } else {
          detailsDiv.style.display = "none";
          (button as HTMLButtonElement).textContent = "Details";
        }
      }
    });
  });

  const deleteButtons = document.querySelectorAll(".remove-btn");
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this keypoint?")) return;

      const id = Number((button as HTMLElement).getAttribute("data-id"));
      if (!tourId) return;

      (button as HTMLButtonElement).disabled = true;
      (button as HTMLButtonElement).textContent = "Deleting...";

      tourService.deleteKeyPoint(Number(tourId), id)
        .then(() => {
          loadTourForEdit(Number(tourId));
        })
        .catch(err => {
          showError(err.message);
          (button as HTMLButtonElement).disabled = false;
          (button as HTMLButtonElement).textContent = "Delete";
        });
    });
  });
}

function validatePublishButton(): void {
  const publishBtn = document.getElementById("publishBtn") as HTMLButtonElement;

  if (publishBtn && tourId) {
    tourService.getById(Number(tourId)).then(tour => {
      const valid = tour.keyPoints.length >= 2 &&
        tour.keyPoints.every(kp => kp.description.length >= 250);
      publishBtn.disabled = !valid;
    });
  }
}

function showError(message: string): void {
  const errorMsg = document.getElementById("error-message");
  if (errorMsg) {
    errorMsg.textContent = message;
  }
}