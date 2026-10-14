import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  price_ars: z.number().min(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const lessonSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  bunny_video_id: z.string().min(1),
});
