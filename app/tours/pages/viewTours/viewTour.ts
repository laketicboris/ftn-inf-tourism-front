import { TourService } from "../../services/tour.service.js";

const tourService = new TourService();

function renderTours(): void {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  tourService.getByGuideId(userId)
    .then(tours => {
      const tableBody = document.querySelector("#tours-table tbody");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      tours.forEach(tour => {
        const row = document.createElement("tr");

        const publishButton = tour.status !== "objavljena" 
          ? `<td><button class="publish-btn" data-id="${tour.id}">Publish</button></td>`
          : `<td>-</td>`;

        row.innerHTML = `
          <td>${tour.id}</td>
          <td>${tour.name}</td>
          <td>${tour.description}</td>
          <td>${new Date(tour.dateTime).toLocaleString('sr-RS')}</td>
          <td>${tour.maxGuests}</td>
          <td>${tour.status}</td>
          <td><button class="edit-btn" data-id="${tour.id}">Edit</button></td>
          <td><button class="delete-btn" data-id="${tour.id}">Delete</button></td>
          ${publishButton}
        `;

        tableBody.appendChild(row);
      });

      setupTableListeners();
    })
    .catch(error => {
      console.error("Error while displaying tours:", error.message);
    });
}

function setupTableListeners(): void {
  const tableBody = document.querySelector("#tours-table tbody");
  if (!tableBody) return;

  const editButtons = tableBody.querySelectorAll(".edit-btn");
  const deleteButtons = tableBody.querySelectorAll(".delete-btn");
  const publishButtons = tableBody.querySelectorAll(".publish-btn");

  editButtons.forEach(editBtn => {
    editBtn.addEventListener("click", () => {
      const id = editBtn.getAttribute("data-id");
      if (id) {
        window.location.href = `../addTours/addTour.html?id=${id}`;
      }
    });
  });

  deleteButtons.forEach(deleteBtn => {
    deleteBtn.addEventListener("click", () => {
      const idAttr = deleteBtn.getAttribute("data-id");
      if (idAttr) {
        if (!confirm("Are you sure you want to delete this tour?")) return;
        
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
  });

  publishButtons.forEach(publishBtn => {
    publishBtn.addEventListener("click", () => {
      const idAttr = publishBtn.getAttribute("data-id");
      if (idAttr) {
        const id = Number(idAttr);
        
        tourService.getById(id)
          .then(tour => {
            const canPublish = tour.keyPoints.length >= 2 && 
                               tour.keyPoints.every(kp => kp.description.length >= 250);
            
            if (!canPublish) {
              alert("Cannot publish tour. At least 2 keypoints with 250+ characters in description are required.");
              return;
            }
            
            const tourData = {
              name: tour.name,
              description: tour.description,
              dateTime: tour.dateTime,
              maxGuests: tour.maxGuests,
              guideId: tour.guideId,
              status: "objavljena"
            };

            tourService.update(id, tourData)
              .then(() => {
                alert("Tour published successfully!");
                renderTours();
              })
              .catch(error => {
                alert("Error publishing tour: " + error.message);
              });
          })
          .catch(error => {
            alert("Error loading tour: " + error.message);
          });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTours();

  const addBtn = document.getElementById("add-tour-btn") as HTMLButtonElement;
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addBtn.disabled = true;
      window.location.href = "../addTours/addTour.html";
    });
  }
});