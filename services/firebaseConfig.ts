import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your actual Firebase project configuration
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyCcuQU8SSKUAp3_RIT3K0gX1_H6JOLxisY",
    authDomain: "otp-8051c.firebaseapp.com",
    projectId: "otp-8051c",
    storageBucket: "otp-8051c.firebasestorage.app",
    messagingSenderId: "106512513134",
    appId: "1:106512513134:web:b907e58eb784579c064e7f",
    measurementId: "G-C6WYTCXDPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
