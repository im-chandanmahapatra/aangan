import { createMiddleware } from "@tanstack/react-start";

/**
 * Placeholder Supabase auth middleware.
 * Replace with real Supabase auth attachment once credentials are configured.
 */
export const attachSupabaseAuth = createMiddleware().server(async ({ next }) => {
  return next();
});
