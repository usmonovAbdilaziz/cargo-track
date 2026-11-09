export interface cargo {
  name: string;
  weight_t: number;
}
export interface route {
  from: string;
  to: string;
  from_country: string;
  to_country: string;
}
export interface driver {
  id: string;
  name: string;
  phone: string;
}
export interface vehicle {
  plate: string;
  model: string;
  trailer_plate: string;
}

export interface Trip {
  id: string;
  cargo: cargo;
  route: route;
  driver: driver;
  vehicle: vehicle;
  status: string;
  agreed_price: number;
  agreed_currency: string;
  created_at: string;
  tags: string[];
}

export interface TripResponse {
  items:Trip[];
}