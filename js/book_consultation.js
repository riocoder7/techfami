import { db } from "../config/firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


window.addEventListener("load", () => {
    const popup = document.getElementById("consultPopup");
    popup.classList.add("opacity-0", "translate-x-16");
  
    setTimeout(() => {
      popup.classList.remove("opacity-0", "translate-x-16");
    }, 8000);
  });


//   dom handel 
const popup = document.getElementById("consultPopup");
const actionButtons = document.getElementById("actionButtons");
const callbackForm = document.getElementById("callbackForm");
const meetSection = document.getElementById("meetSection");
const successMsg = document.getElementById("successMsg");

const meetBtn = document.getElementById("meetBtn");
const callbackBtn = document.getElementById("callbackBtn");
const closeBtn = document.getElementById("closePopupBtn");
const countrySelect = document.getElementById("countryCodeSelect");
const manualCountry = document.getElementById("manualCountryCode");
const submitBtn = document.getElementById("submitCallback");
const  TextData = document.getElementById('textdata');




//ui handel 
meetBtn.addEventListener("click", () => {
    actionButtons.classList.add("hidden");
    meetSection.classList.remove("hidden");
    popup.classList.add("w-[360px]");
  });
  
  callbackBtn.addEventListener("click", () => {
    actionButtons.classList.add("hidden");
    callbackForm.classList.remove("hidden");
    popup.classList.add("w-[360px]");
  });
  
  closeBtn.addEventListener("click", closePopup);


// country code 
countrySelect.addEventListener("change", () => {
    if (countrySelect.value === "other") {
      countrySelect.classList.add("hidden");
      manualCountry.classList.remove("hidden");
      manualCountry.focus();
    }
  });



//  form data 

callbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const countryCode =
      manualCountry.value || countrySelect.value;
  
    const phone =
      callbackForm.querySelector('input[placeholder="Phone Number"]').value.trim();
  
    const whatsapp =
      callbackForm.querySelector('input[placeholder="WhatsApp Number"]').value.trim();
  
    const email =
      callbackForm.querySelector('input[placeholder="Email Address"]').value.trim();
  
    if (!countryCode || !phone || !email) {
      alert("Please fill all required fields");
      return;
    }
  
    submitBtn.textContent = "Sending Req...";
    submitBtn.disabled = true;
  
    try {
      await addDoc(collection(db, "CallBackReq"), {
        countryCode,
        phone,
        whatsapp,
        email,
        createdAt: serverTimestamp()
      });
  
      callbackForm.classList.add("hidden");
      meetSection.classList.add("hidden");
      actionButtons.classList.add("hidden");
      TextData.classList.add("hidden");
      closeBtn.classList.add('hiddden');
      successMsg.classList.remove("hidden");
  
      setTimeout(closePopup, 4000);
  
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      submitBtn.textContent = "Submit Request";
      submitBtn.disabled = false;
    }
  });


//   close pop 


function closePopup() {
    popup.classList.add("opacity-0", "translate-x-16");
  
    setTimeout(() => {
      popup.classList.remove("w-[360px]");
      actionButtons.classList.remove("hidden");
      TextData.classList.remove("hidden");
      closeBtn.classList.remove('hiddden');
      callbackForm.classList.add("hidden");
      meetSection.classList.add("hidden");
      successMsg.classList.add("hidden");
    }, 400);
  }