import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCkvSDmY4btkFfglPxGiuc_UEbEi4JFAwE",
    authDomain: "luminoblog.firebaseapp.com",
    projectId: "luminoblog",
    storageBucket: "luminoblog.appspot.com",
    messagingSenderId: "185074765785",
    appId: "1:185074765785:web:d45f44e641a0ff3cbbd3c8",
    measurementId: "G-Y7L47NGFZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
