import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3Nzr4X_AJiiGavsrMpV3YX-KLmSj1xto",
  authDomain: "mock-interviewer-webapp.firebaseapp.com",
  projectId: "mock-interviewer-webapp",
  // Firebase Storage bucket should end with appspot.com
  storageBucket: "mock-interviewer-webapp.appspot.com",
  messagingSenderId: "429184537879",
  appId: "1:429184537879:web:a96de67e53ce41e1fe5352",
  measurementId: "G-R4V40Z8RKD"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// export default app;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);