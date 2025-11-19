
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAZDpY3UxOBJsYGJ0DtVnoKuImQy5p9l2A",
  authDomain: "edbox-47437413-20b64.firebaseapp.com",
  projectId: "edbox-47437413-20b64",
  storageBucket: "edbox-47437413-20b64.firebasestorage.app",
  messagingSenderId: "561726004930",
  appId: "1:561726004930:web:8f9a8a0ef884fcf9daa55b"};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];