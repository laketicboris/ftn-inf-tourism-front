import type { Tour } from '../models/tour.model.js';
import type { User } from '../../users/model/user.model.js';

export interface Reservation {
  id: number;
  tourId: number;
  userId: number;
  numberOfGuests: number;
  reservationDate: string;
  status: string;
  
  tour?: Tour;
  user?: User;
}

export interface ReservationFormData {
  numberOfGuests: number;
}