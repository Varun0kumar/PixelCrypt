// 1. Check if the browser is currently on "localhost"
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// 2. Automatically select the correct backend
export const API_URL = isLocalhost
  ? "http://localhost:5000"                          // If you are on Localhost -> Use Local Backend
  : "https://varunkumar.pythonanywhere.com";         // If you are on Vercel -> Use Online Backend
export const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());
export const validatePassword = (p) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(p);
