import { RestaurantFormData } from "../../model/restaurantFormData.model.js";
import { RestaurantService } from "../../service/restaurantService.js";


const restaurantService = new RestaurantService();

function initializeForm(): void {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const id = urlparams.get('id');

    if (id) {
        restaurantService.getById(id)
            .then(restaurant => {
                (document.querySelector('#name') as HTMLInputElement).value = restaurant.name;
                (document.querySelector('#description') as HTMLInputElement).value = restaurant.description;
                (document.querySelector('#capacity') as HTMLInputElement).value = restaurant.capacity.toString();
                (document.querySelector('#imageUrl') as HTMLInputElement).value = restaurant.imageUrl;
                (document.querySelector('#latitude') as HTMLInputElement).value = restaurant.latitude.toString();
                (document.querySelector('#longitude') as HTMLInputElement).value = restaurant.longitude.toString();
                (document.querySelector('#status') as HTMLInputElement).value = restaurant.status;



            }).catch(error => {
                console.error(error.status, error.text);
            })
    }
}

function submit(): void {
    const name = (document.querySelector('#name') as HTMLInputElement).value;
    const description = (document.querySelector('#description') as HTMLInputElement).value;
    const capacityStr = (document.querySelector('#capacity') as HTMLInputElement).value;
    const capacity = parseInt(capacityStr, 10);
    const imageURL = (document.querySelector('#imageUrl') as HTMLInputElement).value;
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

    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const id = urlparams.get('id');

    if (id) {
        restaurantService.update(id, formData)
            .then(() => {
                window.location.href = '../viewRestaurants/viewRestaurants.html';
            }).catch(error => {
                console.error(error.status, error.text);
            })
    } else {

        restaurantService.add(formData)
            .then(() => {
                window.location.href = '../viewRestaurants/viewRestaurants.html';
            })
            .catch(error => {
                console.error(error.status, error.text);
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeForm();
    const button = document.querySelector("#submitBtn");
    if (button) {
        button.addEventListener("click", submit);
    }
})