

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAysd7t0iw7suNEK5_loT-kIbMrLAg9s3c",
    authDomain: "fir-realtime-c08f3.firebaseapp.com",
    projectId: "fir-realtime-c08f3",
    storageBucket: "fir-realtime-c08f3.appspot.com",
    messagingSenderId: "281870623406",
    appId: "1:281870623406:web:b25e3d03e88b1eee99433f",
    measurementId: "G-0BFTVS4GB1",
    databaseURL: "https://fir-realtime-c08f3-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const storage = getStorage(app);
export const db = getFirestore(app)
export const google = new GoogleAuthProvider();