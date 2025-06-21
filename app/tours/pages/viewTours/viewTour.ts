import { TourService } from "../../services/tour.service.js";

const tourService = new TourService();

function renderTours(): void {
  tourService.getAll()
    .then(tours => {
      const tableBody = document.querySelector("#tours-table tbody");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      tours.forEach(tour => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${tour.id}</td>
          <td>${tour.name}</td>
          <td>${tour.description}</td>
          <td>${new Date(tour.dateTime).toLocaleString('sr-RS')}</td>
          <td>${tour.maxGuests}</td>
          <td>${tour.status}</td>
          <td><button class="edit-btn" data-id="${tour.id}">Edit</button></td>
          <td><button class="delete-btn" data-id="${tour.id}">Delete</button></td>
        `;

        tableBody.appendChild(row);
      });

      const rows = tableBody.querySelectorAll("tr");
      rows.forEach(row => {
        const editBtn = row.querySelector(".edit-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        if (editBtn) {
          editBtn.addEventListener("click", () => {
            const id = editBtn.getAttribute("data-id");
            if (id) {
              window.location.href = `../addTours/addTour.html?id=${id}`;
            }
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            const idAttr = deleteBtn.getAttribute("data-id");
            if (idAttr) {
              const id = Number(idAttr);
              tourService.delete(id)
                .then(() => {
                  alert("Tour deleted.");
                  renderTours();
                })
                .catch(error => {
                  alert("Error deleting tour: " + error.message);
                });
            }
          });
        }
      });
    })
    .catch(error => {
      console.error("Error while displaying tours:", error.message);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTours();

  const addBtn = document.getElementById("add-tour-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.location.href = "../addTours/addTour.html";
    });
  }
});
