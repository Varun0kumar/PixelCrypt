// src/utils/validation.js

export const API_URL = "http://127.0.0.1:5000/api";

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 number, 1 special char
  const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return re.test(password);
};