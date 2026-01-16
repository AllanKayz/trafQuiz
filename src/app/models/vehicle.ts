export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  registration: string;
  type?: string;
  status?: string;
  notes?: string;
  assignedInstructorId?: number;
  mileage?: number;
  fuelLevel?: number;
  createdAt?: string;
}
