export const API_URL = "https://varunkumar.pythonanywhere.com/api";
export const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());
export const validatePassword = (p) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(p);