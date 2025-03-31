export const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://backend-uploads-git-main-gopmts-projects.vercel.app/api";

export const API_FILES_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://backend-uploads-yuf7.onrender.com/api";
export const TOKE_API =
  "KZeIfdYeUDLfeMEs8dpIlgJxo8hg0uA5FDk4Lr9qT8M4zd5Q1tiUV34433EXqiDuX7ysErr4Zo88y5orLGAZOZyctu12AIlAuKO0ZT";
