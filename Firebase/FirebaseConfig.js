// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbiyqw7HLM0lCHgkBRQxRAKPhqOc9ZsQo",
  authDomain: "smart-ordering-system-e7755.firebaseapp.com",
  projectId: "smart-ordering-system-e7755",
  storageBucket: "smart-ordering-system-e7755.appspot.com",
  messagingSenderId: "434133738120",
  appId: "1:434133738120:web:4b4a1875a95201497eb53d",
  measurementId: "G-LHX4MPWP8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services you'll use
export { auth, db };