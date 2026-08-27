// Self-hosted Umami: the tracker script lives on your own instance's domain, so its full
// URL (e.g. https://umami.example.com/script.js) is project-specific config, not a fixed
// constant — see NEXT_PUBLIC_UMAMI_SCRIPT_URL in .env.example.
export const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
