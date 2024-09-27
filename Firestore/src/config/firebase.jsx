
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyDjXeLUqYuXvI6uWhll8MbmPn7kR4WTHjQ",
    authDomain: "fir-learn-79ba3.firebaseapp.com",
    projectId: "fir-learn-79ba3",
    storageBucket: "fir-learn-79ba3.appspot.com",
    messagingSenderId: "1049929911194",
    appId: "1:1049929911194:web:31b01ca223e431c4ef0823",
    measurementId: "G-P5Z1PMMFEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)
export const storage = getStorage(app);
export const db = getFirestore(app)
export const google = new GoogleAuthProvider();
