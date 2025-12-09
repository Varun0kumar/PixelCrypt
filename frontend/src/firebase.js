import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9bEVAjPd2Jyjr50l01ZvrONHB4oq1Cqs",
  authDomain: "pixelcrypt-b84fe.firebaseapp.com",
  projectId: "pixelcrypt-b84fe",
  appId: "1:607789442226:web:dda6f9a2d14594abc995ab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
