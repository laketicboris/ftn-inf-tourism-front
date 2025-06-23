import { Restaurant } from "../model/restaurant.model.js";


export class RestaurantService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:5105/api/restaurants';
    }



    getByOwnerId(ownerId: string): Promise<Restaurant[]> {
        return fetch(`${this.apiUrl}?ownerId=${ownerId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage }
                    })
                }
                return response.json()
            })
            .then((restorani: Restaurant[]) => {
                return restorani;
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            });
    }
}