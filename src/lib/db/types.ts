export type Role = "student" | "admin";
export type CourseStatus = "draft" | "published" | "archived";
export type PurchaseStatus = "pending" | "approved" | "reverted" | "duplicate" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price_ars: number;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  keywords: string[];
  bunny_video_id: string;
  position: number;
  archived_at: string | null;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  amount: number;
  status: PurchaseStatus;
  created_at: string;
  approved_at: string | null;
  reverted_at: string | null;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  purchase_id: string;
  active: boolean;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  watched: boolean;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
}
