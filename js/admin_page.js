

import { auth } from "../config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🔐 ADMIN PAGE PROTECTION
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ❌ Not logged in → redirect to HOME
    window.location.replace("../techfami_login.html");
  } else {
    // ✅ Logged in → show admin page
    const body = document.getElementById("adminBody");
    if (body) body.classList.remove("hidden");
  }
});





 

