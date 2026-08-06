import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRjyzOVJiIg0vig0zvgNerH2Dk2QLVVsk",
  authDomain: "zamatv-site.firebaseapp.com",
  databaseURL: "https://zamatv-site-default-rtdb.firebaseio.com",
  projectId: "zamatv-site",
  storageBucket: "zamatv-site.firebasestorage.app",
  messagingSenderId: "714644035816",
  appId: "1:714644035816:web:63202953ef250e9190d15d",
  measurementId: "G-LB1KTGP84C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Initialize Analytics safely in browser environments
export const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};
