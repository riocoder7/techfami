// Firebase is loaded only when the form is submitted, so the popup itself always works.


window.addEventListener("load", () => {
    const popup = document.getElementById("consultPopup");
    if (!popup) return;
    popup.classList.add("opacity-0", "translate-x-16");
  
    setTimeout(() => {
      popup.classList.remove("opacity-0", "translate-x-16");
    }, 8000);
  });


//   dom handel 
const popup = document.getElementById("consultPopup");
const actionButtons = document.getElementById("actionButtons");
const callbackForm = document.getElementById("callbackForm");
const successMsg = document.getElementById("successMsg");

const callbackBtn = document.getElementById("callbackBtn");
const closeBtn = document.getElementById("closePopupBtn");
const countrySelect = document.getElementById("countryCodeSelect");
const manualCountry = document.getElementById("manualCountryCode");
const submitBtn = document.getElementById("submitCallback");
const  TextData = document.getElementById('textdata');




//ui handel 
  callbackBtn?.addEventListener("click", () => {
    actionButtons.classList.add("hidden");
    callbackForm.classList.remove("hidden");
    popup.classList.add("w-[360px]");
  });
  
  closeBtn?.addEventListener("click", closePopup);


// country code 
countrySelect?.addEventListener("change", () => {
    if (countrySelect.value === "other") {
      countrySelect.classList.add("hidden");
      manualCountry.classList.remove("hidden");
      manualCountry.focus();
    }
  });



//  form data 

callbackForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const countryCode =
      manualCountry.value || countrySelect.value;
  
    // fields are read by name, so changing placeholder text can never break the form again
    const field = n => (callbackForm.elements[n]?.value || "").trim();
    const phone = field("phone");
    const whatsapp = field("whatsapp");
    const email = field("email");

    if (!countryCode || !phone || !email) {
      alert("Please add your country code, phone number and email so we can call you back.");
      return;
    }
  
    submitBtn.textContent = "Sending Req...";
    submitBtn.disabled = true;
  
    try {
      const { db } = await import("../config/firebaseConfig.js");
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
      await addDoc(collection(db, "CallBackReq"), {
        countryCode,
        phone,
        whatsapp,
        email,
        createdAt: serverTimestamp()
      });
  
      callbackForm.classList.add("hidden");
      actionButtons.classList.add("hidden");
      TextData.classList.add("hidden");
      closeBtn.classList.add('hiddden');
      successMsg.classList.remove("hidden");
  
      setTimeout(closePopup, 4000);
  
    } catch (err) {
      console.error(err);
      alert("Sorry, we could not send your request. Please check your internet connection and try again, or message us on WhatsApp.");
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
      successMsg.classList.add("hidden");
    }, 400);
  }