import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZU_uRbGyqQoj9fgr8T1s5RqYy-cqL4iw",
  authDomain: "adf1-fdf5b.firebaseapp.com",
  projectId: "adf1-fdf5b",
  storageBucket: "adf1-fdf5b.firebasestorage.app",
  messagingSenderId: "83885719989",
  appId: "1:83885719989:web:a5ff6bb99179f9063819fc",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
