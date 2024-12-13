import { z } from "zod";

export const postSchema = z.object({
  author: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  createdAt: z.string(),
});
