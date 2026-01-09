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
  createdAt?: string;
}
