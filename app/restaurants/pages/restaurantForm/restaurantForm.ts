import { RestaurantFormData } from "../../model/restaurantFormData.model.js";
import { RestaurantService } from "../../service/restaurantService.js";


const restaurantService = new RestaurantService();

function submit(): void {
    const name = (document.querySelector('#name') as HTMLInputElement).value;
    const description = (document.querySelector('#description') as HTMLInputElement).value;
    const capacityStr = (document.querySelector('#capacity') as HTMLInputElement).value;
    const capacity = parseInt(capacityStr, 10);
    const imageURL = (document.querySelector('#image') as HTMLInputElement).value;
    const latitudeStr = (document.querySelector('#latitude') as HTMLInputElement).value;
    const latitude = Number(latitudeStr);
    const longitudeStr = (document.querySelector('#longitude') as HTMLInputElement).value;
    const longitude = Number(longitudeStr);
    const ownerId = localStorage.getItem("userId");

    if (!ownerId) {
        console.error("User ID not found in localStorage.");
        return;
    }


    if (!name || !description || !capacity || !imageURL || !latitude || !longitude) {
        alert("All fields are required!");
        return;
    }



    const formData: RestaurantFormData = {
        name,
        description,
        capacity,
        imageURL,
        latitude,
        longitude,
        status: "u pripremi",
        ownerId
    };

    restaurantService.add(formData)
        .then(() => {
            window.location.href = '../viewRestaurants/viewRestaurants.html';
        })
        .catch(error => {
            console.error(error.status, error.text);
        });
}

const button = document.querySelector("#submitBtn");
if (button) {
    button.addEventListener("click", submit);
}