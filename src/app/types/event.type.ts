export interface Event {
  id: number;
  name: string;
  description: string;
  date: Date;
  location: string;
  isBooked?: boolean;
}
