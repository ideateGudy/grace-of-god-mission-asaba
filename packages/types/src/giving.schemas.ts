import { z } from 'zod';

export const contributionSourceEnum = z.enum(['ONLINE', 'OFFLINE']);
export type ContributionSourceType = z.infer<typeof contributionSourceEnum>;

export const contributionStatusEnum = z.enum(['PENDING', 'SUCCESS', 'FAILED']);
export type ContributionStatusType = z.infer<typeof contributionStatusEnum>;

export const initializeGivingSchema = z.object({
  projectId: z.string().optional().nullable(),
  amountKobo: z.number().int().min(10000, 'Minimum online contribution is ₦100 (10,000 kobo)'),
  donorEmail: z.string().email('Valid email is required for payment confirmation'),
  donorName: z.string().max(120).optional().nullable(),
  donorPhone: z.string().max(30).optional().nullable(),
  displayName: z.string().max(80).optional().nullable(),
  isAnonymous: z.boolean().default(true),
  message: z.string().max(500, 'Prayer note/message cannot exceed 500 characters').optional().nullable(),
});

export type InitializeGivingDto = z.infer<typeof initializeGivingSchema>;

export const recordOfflineContributionSchema = z.object({
  projectId: z.string().optional().nullable(),
  amountKobo: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform((v) => BigInt(v)),
  donorName: z.string().max(120).optional().nullable(),
  donorPhone: z.string().max(30).optional().nullable(),
  displayName: z.string().max(80).optional().nullable(),
  isAnonymous: z.boolean().default(true),
  message: z.string().max(500).optional().nullable(),
});

export type RecordOfflineContributionDto = z.input<typeof recordOfflineContributionSchema>;

export interface PublicContributionItem {
  id: string;
  projectId: string | null;
  projectTitle?: string | null;
  amountKobo: string;
  displayName: string;
  isAnonymous: boolean;
  message: string | null;
  createdAt: string;
}

export interface ContributionAdminItem {
  id: string;
  projectId: string | null;
  projectTitle: string | null;
  amountKobo: string;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  message: string | null;
  source: ContributionSourceType;
  status: ContributionStatusType;
  paystackRef: string | null;
  recordedById: string | null;
  createdAt: string;
}
