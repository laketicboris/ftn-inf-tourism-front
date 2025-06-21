import { TourService } from "../../services/tour.service.js";
import { TourFormData } from "../../models/tourFormData.model.js";

const tourService = new TourService();
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#add-tour-form") as HTMLFormElement;
  const title = document.querySelector("h1");

  if (tourId) {
    if (title) title.textContent = "Edit Tour";
    loadTourForEdit(parseInt(tourId));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.querySelector("#name") as HTMLInputElement).value;
    const description = (document.querySelector("#description") as HTMLTextAreaElement).value;
    const dateTime = (document.querySelector("#startDateTime") as HTMLInputElement).value;
    const maxGuests = parseInt((document.querySelector("#maxParticipants") as HTMLInputElement).value);
    const status = (document.querySelector("#status") as HTMLSelectElement).value;

    const userIdString = localStorage.getItem("userId");
    if (!userIdString || isNaN(Number(userIdString))) {
      alert("User not logged in or ID is invalid.");
      return;
    }
    const guideId = Number(userIdString);

    const tourData: TourFormData = {
      name,
      description,
      dateTime,
      maxGuests,
      guideId: guideId,
      status
    };

    if (tourId) {
      tourService
        .update(parseInt(tourId), tourData)
        .then(() => {
          alert("Tour updated!");
          window.location.href = "../viewTours/viewTour.html";
        })
        .catch((error) => {
          alert("Error updating tour: " + error.message);
        });
    } else {
      tourService
        .create(tourData)
        .then(() => {
          alert("Tour created!");
          window.location.href = "../viewTours/viewTour.html";
        })
        .catch((error) => {
          alert("Error creating tour: " + error.message);
        });
    }
  });
});

function loadTourForEdit(id: number): void {
  tourService.getAll().then(tours => {
    const tour = tours.find(t => t.id === id);
    if (!tour) {
      alert("Tour not found!");
      return;
    }

    (document.querySelector("#name") as HTMLInputElement).value = tour.name;
    (document.querySelector("#description") as HTMLTextAreaElement).value = tour.description;
    (document.querySelector("#startDateTime") as HTMLInputElement).value = tour.dateTime.slice(0, 16);
    (document.querySelector("#maxParticipants") as HTMLInputElement).value = tour.maxGuests.toString();
    (document.querySelector("#status") as HTMLSelectElement).value = tour.status;
  });
}
