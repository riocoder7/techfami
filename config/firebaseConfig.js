import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  const firebaseConfig = {
    apiKey: "AIzaSyCBGIq3zwxbPWd-Xp5YxlksOroVLITlwuU",
    authDomain: "techfami-1d931.firebaseapp.com",
    projectId: "techfami-1d931",
    storageBucket: "techfami-1d931.firebasestorage.app",
    messagingSenderId: "517900608019",
    appId: "1:517900608019:web:cf32043193d541134d55e6"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  export {db, auth};

