import { Tour } from "../models/tour.model.js";
import { TourFormData } from "../models/tourFormData.model.js";
import { KeypointFormData } from "../models/keypointFormData.model.js";

export class TourService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://localhost:5105/api/tours';
  }

  getByGuideId(guideId: string | number): Promise<Tour[]> {
    return fetch(`${this.apiUrl}?guideId=${guideId}`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage };
          });
        }
        return response.json();
      })
      .then((tours: Tour[]) => tours)
      .catch(error => {
        console.error("Error fetching tours:", error.status || error.message);
        throw error;
      });
  }

  getAll(): Promise<Tour[]> {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    let url = `${this.apiUrl}?page=1&pageSize=100&orderBy=Id&orderDirection=ASC`;

    if (role === "vodic" && userId) {
      url += `&guideId=${userId}`;
    }

    return fetch(url)
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage };
          });
        }
        return response.json();
      })
      .then(result => {
        return result.data;
      });
  }


  create(tourData: TourFormData): Promise<Tour> {
    return fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tourData),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage };
          });
        }
        return response.json();
      });
  }

  update(id: number, tourData: TourFormData): Promise<void> {
    return fetch(`${this.apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tourData),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage };
          });
        }
      });
  }

  delete(id: number): Promise<void> {
    return fetch(`${this.apiUrl}/${id}`, {
      method: "DELETE",
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage };
          });
        }
      });
  }

  addKeyPoint(tourId: number, keyPointData: KeypointFormData): Promise<void> {
    return fetch(`${this.apiUrl}/${tourId}/key-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keyPointData),
    }).then(response => {
      if (!response.ok) {
        return response.text().then(msg => { throw new Error(msg); });
      }
    });
  }

  deleteKeyPoint(tourId: number, keyPointId: number): Promise<void> {
    return fetch(`${this.apiUrl}/${tourId}/key-points/${keyPointId}`, {
      method: "DELETE"
    }).then(response => {
      if (!response.ok) {
        return response.text().then(msg => { throw new Error(msg); });
      }
    });
  }

  getById(id: number): Promise<Tour> {
    return fetch(`${this.apiUrl}/${id}`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(msg => { throw new Error(msg); });
        }
        return response.json();
      });
  }
}
