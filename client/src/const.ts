export { UNAUTHED_ERR_MSG } from "@shared/const";

// Clerk publishable key — injected at build time via Vite env
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
