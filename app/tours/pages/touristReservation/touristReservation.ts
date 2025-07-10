import { Reservation } from "../../models/reservation.model.js";

let reservationsGrid: HTMLElement;
let loadingOverlay: HTMLElement;
let errorMessage: HTMLElement;
let noReservationsDiv: HTMLElement;

document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  loadUserReservations();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../../../users/pages/login/login.html";
    });
  }
});

function initializeElements(): void {
  reservationsGrid = document.getElementById("reservations-grid")!;
  loadingOverlay = document.getElementById("loading")!;
  errorMessage = document.getElementById("error-message")!;
  noReservationsDiv = document.getElementById("no-reservations")!;
}

function loadUserReservations(): void {
  const userId = parseInt(localStorage.getItem("userId") || "0");

  if (userId === 0) {
    showError("User not logged in. Please log in first.");
    return;
  }

  showLoading(true);
  hideError();
  hideNoReservations();

  fetch(`http://localhost:5105/api/tours/reservations?touristId=${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((reservations: Reservation[]) => {
      const now = new Date();
      const futureReservations = reservations.filter(r =>
        r.tour && new Date(r.tour.dateTime) > now
      );

      renderReservations(futureReservations);
    })
    .catch(error => {
      console.error("Error loading reservations:", error);
      showError("Failed to load reservations. Please try again.");
    })
    .finally(() => {
      showLoading(false);
    });
}

function renderReservations(reservations: Reservation[]): void {
  reservationsGrid.innerHTML = "";

  if (reservations.length === 0) {
    showNoReservations();
    return;
  }

  const template = document.getElementById("reservation-card-template") as HTMLTemplateElement;

  reservations.forEach(reservation => {
    if (!reservation.tour) {
      console.error("Tour data missing for reservation:", reservation.id);
      return;
    }

    const clone = template.content.cloneNode(true) as DocumentFragment;

    const tourImage = clone.querySelector(".tour-image") as HTMLImageElement;
    const statusBadge = clone.querySelector(".status-badge") as HTMLElement;
    const tourName = clone.querySelector(".tour-name") as HTMLElement;
    const tourDate = clone.querySelector(".tour-date") as HTMLElement;
    const tourDescription = clone.querySelector(".tour-description") as HTMLElement;
    const guestsCount = clone.querySelector(".guests-count") as HTMLElement;
    const reservationDate = clone.querySelector(".reservation-date") as HTMLElement;
    const cancelNotice = clone.querySelector(".cancel-notice") as HTMLElement;
    const cancelBtn = clone.querySelector(".cancel-btn") as HTMLButtonElement;

    tourImage.src = `https://picsum.photos/seed/${encodeURIComponent(reservation.tour.name)}/400/200`;
    tourImage.alt = reservation.tour.name;

    tourName.textContent = reservation.tour.name;
    tourDate.textContent = formatDate(reservation.tour.dateTime);
    tourDescription.textContent = truncateDescription(reservation.tour.description || "No description", 120);
    guestsCount.textContent = reservation.numberOfGuests.toString();
    reservationDate.textContent = formatDate(reservation.reservationDate);

    //status na kartici 
    statusBadge.textContent = reservation.status;
    statusBadge.className = `status-badge ${reservation.status.toLowerCase()}`;

    //24h pravilo
    const tourDateTime = new Date(reservation.tour.dateTime);
    const now = new Date();
    const hoursUntilTour = (tourDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const canCancel = hoursUntilTour > 24 && reservation.status === "Active";

    //cancel dugme
    if (canCancel) {
      cancelNotice.textContent = `⏰ Cancellation is possible until 24 hours before the tour. You have ${Math.round(hoursUntilTour)} hours remaining.`;
      cancelBtn.textContent = "Cancel Reservation";
      cancelBtn.disabled = false;
      cancelBtn.className = "cancel-btn";

      cancelBtn.addEventListener("click", () => {
        cancelReservation(reservation.id, reservation.tour!.name, cancelBtn);
      });
    } else {
      if (reservation.status === "Cancelled") {
        cancelNotice.textContent = "❌ This reservation has been cancelled.";
        cancelBtn.textContent = "Cancelled";
      } else {
        cancelNotice.textContent = "⏰ Cannot cancel - less than 24 hours until tour starts.";
        cancelBtn.textContent = "Cannot Cancel";
      }

      cancelBtn.disabled = true;
      cancelBtn.className = "cancel-btn cannot-cancel";
    }

    reservationsGrid.appendChild(clone);
  });
}

function cancelReservation(reservationId: number, tourName: string, cancelBtn: HTMLButtonElement): void {
  const userId = parseInt(localStorage.getItem("userId") || "0");

  if (!confirm(`Are you sure you want to cancel your reservation for "${tourName}"?`)) {
    return;
  }

  cancelBtn.disabled = true;
  cancelBtn.textContent = "Cancelling...";

  fetch(`http://localhost:5105/api/tours/reservations/${reservationId}?userId=${userId}`, {
    method: "DELETE"
  })
    .then(response => {
      if (response.ok) {
        alert("Reservation cancelled successfully!");
        loadUserReservations();
      } else {
        return response.text().then(errorText => {
          throw new Error(errorText || "Failed to cancel reservation");
        });
      }
    })
    .catch(error => {
      console.error("Error cancelling reservation:", error);
      alert(`Failed to cancel reservation: ${error.message}`);

      cancelBtn.disabled = false;
      cancelBtn.textContent = " Cancel Reservation";
    });
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
  if (!description) {
    return "No description available.";
  }
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

function showNoReservations(): void {
  noReservationsDiv.style.display = "block";
}

function hideNoReservations(): void {
  noReservationsDiv.style.display = "none";
}