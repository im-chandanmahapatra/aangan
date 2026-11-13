import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const consultationSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  email: z.string().trim().email("A valid email please").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("").transform(() => undefined)),
  interest: z.enum(["villa", "interior", "architecture", "other"]),
  message: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

export const submitConsultation = createServerFn({ method: "POST" })
  .validator(consultationSchema)
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Backend not configured");

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("consultations").insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      interest: data.interest,
      message: data.message ?? null,
    });

    if (error) {
      console.error("[consultations.insert]", error);
      throw new Error("We couldn't save your request. Please try again.");
    }

    return { ok: true as const };
  });
