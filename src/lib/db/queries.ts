import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, Enrollment, Lesson, Purchase } from "./types";

export async function getPublishedCourses(db: SupabaseClient): Promise<Course[]> {
  const { data, error } = await db.from("courses").select("*").eq("status", "published");
  if (error) throw error;
  return data as Course[];
}

export async function getCourse(db: SupabaseClient, id: string): Promise<Course | null> {
  const { data, error } = await db.from("courses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Course | null;
}

/** Clases no archivadas del curso, ordenadas por posición (FR-008, FR-025). */
export async function getActiveLessons(db: SupabaseClient, courseId: string): Promise<Lesson[]> {
  const { data, error } = await db
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .is("archived_at", null)
    .order("position");
  if (error) throw error;
  return data as Lesson[];
}

export async function getActiveEnrollment(
  db: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<Enrollment | null> {
  const { data, error } = await db
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Enrollment | null;
}

export async function getUserPurchases(db: SupabaseClient, userId: string): Promise<Purchase[]> {
  const { data, error } = await db
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Purchase[];
}
