export interface Trafquiz {
  appname: string;
  version: string;
  description: string;
  distribitor: string;
}

/**
 * Interface representing a single quiz question.
 */
export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  hasImage?: boolean;
  image?: string;
  flagged?: boolean;
}

/**
 * Interface representing the raw question data from the API.
 */
export interface ApiResponse {
  id: number,
  answer: string,
  option_a: string,
  option_b: string,
  option_c: string,
  photo: string,
  question: string
}

/**
 * Interface representing the raw student data from the API.
 */
export interface studentApiResponse {
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  status: string,
  enrollmentDate: Date
}

/**
 * Interface representing a student user.
 */
export interface Student {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  password: string;
  package: number;
}

/**
 * Interface representing an instructor user.
 */
export interface Instructor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license: string;
  specialization: string;
  certification: string;
  experience: number;
  availability: boolean;
  password: string;
}

/**
 * Interface representing the raw instructor data from the API.
 */
export interface instructorApiResponse {
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  license: string,
  specialization: string,
  certification: string,
  experience: number,
  availability: boolean,
  employmentDate: Date
}

export interface StudentProgress {
  studentId: string;
  totalTests: number;
  averageScore: number;
  completionRate: number;
  recentActivity: {
    quizTitle: string;
    score: number;
    date: Date;
    status: 'pass' | 'fail';
  }[];
  monthlyPerformance: {
    month: string;
    score: number;
  }[];
}

export interface Conversation {
  id: number;
  name: string;
  role?: string;
  partnerId?: number;
  unread?: number;
  lastMessage?: string;
  lastTime?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  from: string;
  text: string;
  timestamp: string; // ISO
  outgoing?: boolean;
  type?: 'text' | 'image' | 'file' | 'voice' | 'call';
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  duration?: number;
  call_status?: 'missed' | 'completed' | 'declined';
  is_read?: boolean;
}