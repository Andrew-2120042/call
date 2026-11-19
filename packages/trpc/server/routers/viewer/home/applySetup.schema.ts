import { z } from "zod";

export const SETUP_WORK = ["coach", "therapist", "tutor", "fitness", "consultant", "creative", "other"] as const;

export const ZApplySetupInputSchema = z.object({
  work: z.enum(SETUP_WORK),
  length: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60), z.literal(90)]),
  introCall: z.boolean(),
  approval: z.boolean(),
  series: z.union([z.literal(0), z.literal(4), z.literal(8), z.literal(12)]),
  reminderHours: z.union([z.literal(0), z.literal(1), z.literal(24)]),
  waitlist: z.boolean(),
  confirm: z.boolean(),
  location: z.enum(["meet", "zoom", "phone", "in_person", "later"]),
  address: z.string().max(300).optional(),
});

export type TApplySetupInputSchema = z.infer<typeof ZApplySetupInputSchema>;
