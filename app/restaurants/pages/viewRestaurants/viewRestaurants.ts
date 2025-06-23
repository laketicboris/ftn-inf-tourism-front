import { RestaurantService } from "../../service/restaurantService.js";

const restaurantService = new RestaurantService();

function renderData(): void {

    const ownerId = localStorage.getItem("userId");

    if (!ownerId) {
        console.error("User ID not found in localStorage.");
        return;
    }

    restaurantService.getByOwnerId(ownerId)
        .then(restorani => {
            const table = document.querySelector("tbody");

            if (!table) {
                console.error('Table body not found');
                return;
            }

            restorani.forEach((restoran) => {
                const newRow = document.createElement("tr");

                const cell1 = document.createElement("td");
                cell1.textContent = restoran.name;

                const cell2 = document.createElement("td");
                cell2.textContent = restoran.description;

                const cell3 = document.createElement("td");
                cell3.textContent = restoran.capacity.toString();

                const cell4 = document.createElement("td");
                if (restoran.imageUrl) {
                    const img = document.createElement("img");
                    img.src = restoran.imageUrl;
                    img.alt = "Restaurant image";
                    img.style.width = "100px";
                    img.style.height = "auto";
                    cell4.appendChild(img);
                } else {
                    cell4.textContent = "No image";
                }

                const cell5 = document.createElement("td");
                cell5.textContent = restoran.latitude.toString();

                const cell6 = document.createElement("td");
                cell6.textContent = restoran.longitude.toString();

                const cell7 = document.createElement("td");
                cell7.textContent = restoran.status.toString();

                const cell8 = document.createElement("td");
                cell8.textContent = restoran.ownerId.toString();

                const cell9 = document.createElement("td");

                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", function () {
                    // window.location.href = "./usersForm/usersForm.html?id=" + korisnik.id;
                });
                cell9.appendChild(editBtn);

                const cell10 = document.createElement("td");
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";

                deleteBtn.onclick = function () {
                    // userService.deleteUser(korisnik.id.toString())
                    //     .then(() => {
                    //         window.location.reload();
                    //     })
                    //     .catch(error => {
                    //         console.error(error.status, error.text);
                    //     });
                };


                cell10.appendChild(deleteBtn);

                newRow.appendChild(cell1);
                newRow.appendChild(cell2);
                newRow.appendChild(cell3);
                newRow.appendChild(cell4);
                newRow.appendChild(cell5);
                newRow.appendChild(cell6);
                newRow.appendChild(cell7);
                newRow.appendChild(cell8);
                newRow.appendChild(cell9);
                newRow.appendChild(cell10);
                table.appendChild(newRow);
            });
        })
        .catch(error => {
            console.error(error.status, error.message);
        });
}

renderData();