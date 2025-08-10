import { db} from "../config/firebaseConfig.js";
import { collection, addDoc, serverTimestamp }  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById("contactForm");
const popupMessage = document.getElementById("popupMessage");

form?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-70", "cursor-not-allowed");

  // Get form values
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const location = form.location.value.trim();
  const companyname = form.companyname.value.trim();
  const service = form.service.value;
  const message = form.message.value.trim();

  // Validation
  if (!name || !email || !phone || !location || !service || !message || !companyname) {
    showPopup("⚠️ Please fill in all fields.", "bg-red-600");
    return resetButton();
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showPopup("⚠️ Please enter a valid email address.", "bg-red-600");
    return resetButton();
  }

  if (!/^\+?\d{10,15}$/.test(phone)) {
    showPopup("⚠️ Please enter a valid phone number.", "bg-red-600");
    return resetButton();
  }

  try {
    // ✅ Firestore add
    await addDoc(collection(db, "contactMessages"), {
      name,
      email,
      phone,
      location,
      companyname,
      service,
      message,
      createdAt: serverTimestamp()
    });

    showPopup("✅ Your message has been sent! We'll be in touch shortly.", "bg-green-600");
    form.reset();
  } catch (error) {
    console.error("Error saving message: ", error);
    showPopup("❌ Failed to send. Please try again.", "bg-red-600");
  }

  resetButton();
});

function resetButton() {
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.textContent = "Send Message";
  submitBtn.disabled = false;
  submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
}

function showPopup(message, colorClass) {
  popupMessage.textContent = message;
  popupMessage.className =
    `fixed top-20 right-0 transform translate-x-full ${colorClass} text-white text-lg px-6 py-3 rounded-lg shadow-lg font-medium transition-all duration-500 ease-in-out z-50`;

  popupMessage.classList.remove("hidden");

  setTimeout(() => popupMessage.classList.replace("translate-x-full", "translate-x-0"), 10);
  setTimeout(() => popupMessage.classList.replace("translate-x-0", "translate-x-full"), 3000);
  setTimeout(() => popupMessage.classList.add("hidden"), 3500);
}
