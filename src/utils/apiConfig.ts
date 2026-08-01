/**
 * Centralized API configuration.
 * In development, Vite reads from .env files automatically.
 * Set VITE_API_BASE_URL in .env for local dev, or in Vercel/Netlify
 * environment settings for production.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
