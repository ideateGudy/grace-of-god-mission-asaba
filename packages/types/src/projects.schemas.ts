import { z } from 'zod';

export const projectStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']);
export type ProjectStatusType = z.infer<typeof projectStatusEnum>;

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(160, 'Title cannot exceed 160 characters'),
  slug: z.string().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-kebab-case').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Image must be a valid URL').optional().nullable(),
  goalKobo: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform((val) => BigInt(val)),
  status: projectStatusEnum.default('DRAFT'),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  slug: z.string().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(10).optional(),
  imageUrl: z.string().url().optional().nullable(),
  goalKobo: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform((val) => BigInt(val)).optional(),
  status: projectStatusEnum.optional(),
  deadline: z.string().datetime().optional().nullable(),
});

export type CreateProjectDto = z.input<typeof createProjectSchema>;
export type UpdateProjectDto = z.input<typeof updateProjectSchema>;

export interface ProjectPublicSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  goalKobo: string;
  raisedKobo: string;
  percent: number;
  status: ProjectStatusType;
  deadline: string | null;
  contributionsCount: number;
  createdAt: string;
}
