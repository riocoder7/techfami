

import { db } from "../config/firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const modal = document.getElementById("serviceModal");
const modalTitle = document.getElementById("modalTitle");
const closeModal = document.getElementById("closeModal");
const submitBtn = document.querySelector("#inquiryForm button[type='submit']");
const inquiryForm = document.getElementById("inquiryForm");

// Open modal with selected service name
document.querySelectorAll(".get-started-btn").forEach(button => {
  button.addEventListener("click", () => {
    const serviceName = button.getAttribute("data-service");
    modalTitle.textContent = `Inquiry: ${serviceName}`;
    modal.dataset.service = serviceName; // store service in dataset
    modal.classList.remove("hidden");
  });
});

// Close modal
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Optional: Close on outside click
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// Form submit handler
inquiryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Grab values
  const fullName = inquiryForm.querySelector('input[placeholder="Full Name"]').value.trim();
  const email = inquiryForm.querySelector('input[placeholder="Email Address"]').value.trim();
  const phone = inquiryForm.querySelector('input[placeholder="Phone Number"]').value.trim();
  const message = inquiryForm.querySelector('textarea').value.trim();

  if (!fullName || !email || !phone || !message) {
    alert("Please fill all required fields.");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Enter a valid email.");
    return;
  }
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
    alert("Enter a valid 10-digit phone number.");
    return;
  }

  // Show loading state
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    await addDoc(collection(db, "inquiryForm"), {
      fullName,
      email,
      phone,
      message,
      services: modal.dataset.service, // fixed service name
      createdAt: serverTimestamp()
    });
    alert("✅ Your message has been sent! We'll be in touch shortly");
    modal.classList.add("hidden");
    inquiryForm.reset();
  } catch (error) {
    alert(error);
  } finally {
    // Reset button
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }
});
