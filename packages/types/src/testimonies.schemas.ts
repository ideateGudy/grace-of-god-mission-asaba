import { z } from 'zod';

export const testimonyStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type TestimonyStatus = z.infer<typeof testimonyStatusSchema>;

export const createTestimonySchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(160, 'Title is too long'),
  content: z.string().trim().min(10, 'Testimony details are too short').max(5000, 'Testimony is too long'),
  authorName: z.string().trim().min(2, 'Name is required').max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  isAnonymous: z.boolean().optional().default(false),
  honeypot: z.string().max(500).optional(),
}).strict();

export type CreateTestimonyDto = z.infer<typeof createTestimonySchema>;

export const updateTestimonySchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  content: z.string().trim().min(10).max(5000).optional(),
  status: testimonyStatusSchema.optional(),
  featured: z.boolean().optional(),
}).strict();

export type UpdateTestimonyDto = z.infer<typeof updateTestimonySchema>;

export type PublicTestimonyDto = {
  id: string;
  title: string;
  content: string;
  displayName: string;
  featured: boolean;
  createdAt: string;
};

export type AdminTestimonyDto = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  phone: string | null;
  email: string | null;
  isAnonymous: boolean;
  status: TestimonyStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};
