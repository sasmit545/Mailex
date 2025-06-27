import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppRouter from './app_router';
import { initializeApp } from "firebase/app";
import { FirebaseProvider } from './firebase_context';


const firebaseConfig = {
  apiKey: "AIzaSyCjepY15gTpfNOcw4phBbtuYWFq31wiK_4",
  authDomain: "react-bea4e.firebaseapp.com",
  projectId: "react-bea4e",
  storageBucket: "react-bea4e.firebasestorage.app",
  messagingSenderId: "942228996414",
  appId: "1:942228996414:web:b99617aab0d68b894b6c6f",
  measurementId: "G-EKJEHH09SN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FirebaseProvider app={app} >
      <AppRouter />
    </FirebaseProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
