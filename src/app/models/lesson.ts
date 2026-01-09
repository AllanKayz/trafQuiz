export interface Lesson {
  id: number;
  title: string;
  subject?: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationMinutes?: number;
  instructor: { id: number; name: string; avatarUrl?: string };
  location?: string;
  onlineLink?: string;
  status: 'upcoming' | 'cancelled' | 'completed' | 'rescheduled' | 'pending' | 'confirmed' | 'declined';
  type?: 'group' | 'private';
  studentId?: number;
  studentName?: string;
  studentCount: number;
  capacity?: number;
  assignedVehicleId?: number;
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  notes?: string;
  resources?: Array<{ title: string; url: string }>;
  createdAt?: string;
  updatedAt?: string;
}
