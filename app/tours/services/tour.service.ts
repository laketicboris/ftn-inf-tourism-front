import { Tour } from "../models/tour.model.js";
import { TourFormData } from "../models/tourFormData.model.js";

export class TourService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://localhost:5105/api/users';
  }

  getAll(): Promise<Tour[]> {
    const url = `${this.apiUrl}?page=1&pageSize=100&orderBy=Id&orderDirection=ASC`;
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
}
