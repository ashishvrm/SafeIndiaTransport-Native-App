import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHIDbO6Jj5an5JxK8m9mffmokaApuOVCI",
  authDomain: "safe-india-transport-app.firebaseapp.com",
  projectId: "safe-india-transport-app",
  storageBucket: "safe-india-transport-app.firebasestorage.app",
  messagingSenderId: "91023859902",
  appId: "1:91023859902:web:5b94aec67f28a6ed89feef"
};

// Initialize Firebase only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);