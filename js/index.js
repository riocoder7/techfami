
 const splace_screen =()=>{
  window.addEventListener("DOMContentLoaded", () => {
    const loadingBar = document.querySelector(".loadingbar");
    const loadingBox = document.querySelector(".loadingBox");
    const splashScreen = document.querySelector(".splashScreen");
    const loadingCircle = document.querySelector(".loadingCircle");
    const body = document.body;
  
    // Animate loading bar (left: 0)
    setTimeout(() => {
      loadingBar.style.transition = "left 3s ease";
      loadingBar.style.left = "0";
    }, 1500);
  
    // Fade in loadingBox (opacity: 1)
    setTimeout(() => {
      loadingBox.style.transition = "opacity 1s ease";
      loadingBox.style.opacity = "1";
    }, 500);
  
    // Move splash screen up (top: -100%)
    setTimeout(() => {
      splashScreen.style.transition = "top 1.5s ease";
      splashScreen.style.top = "-100%";
    }, 4500);
  
    // Fade out loadingCircle (opacity: 0)
    setTimeout(() => {
      loadingCircle.style.transition = "opacity 0.5s ease";
      loadingCircle.style.opacity = "0";
    }, 4500);
  
    // Enable scroll & reveal main content
    setTimeout(() => {
      document.body.classList.add("visibleSplash");
       const main = document.querySelector("main");
      main.style.display = "block";
      main.style.opacity = "1";
    }, 5000);
  });
  

 }
 splace_screen();
 
 const troglemanu = () => {
  // Select elements
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('backdrop');
  const mobileLinks = document.querySelectorAll('.mobilLink');

  // Function to open menu
  function openMenu() {
      mobileMenu.classList.remove('translate-x-full');
      backdrop.classList.remove('hidden');
  }

  // Function to close menu
  function closeMenu() {
      mobileMenu.classList.add('translate-x-full');
      backdrop.classList.add('hidden');
  }

  // Event listeners
  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);
  
  // Fix: Loop through each mobile link and add event listener
  mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
  });
}
  
    troglemanu();
  
   
  const headerColorChange = () => {
    const header = document.getElementById('header');
  
    window.addEventListener('scroll', () => {
      if (window.scrollY >= 50) {
        console.log('scrolled');
        
      } else {
        header.classList.remove('scrolled');
      }
    });
  };
  headerColorChange();
  
  
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const bgUrl = this.getAttribute('data-bg');
      const phoneScreen = document.getElementById('phoneScreen');
      
      // Animate with fade for smooth transition
      phoneScreen.style.transition = 'background-image 0.5s ease-in-out';
      phoneScreen.style.backgroundImage = `url('${bgUrl}')`;
    });
  });

 const dotButton = ()=>{
    const cursor = document.getElementById("cursor-shape");

    document.addEventListener("mousemove", (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power3.out"
      });
    });
  
    // Change shape on hover (example for links)
    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.className = "fixed top-0 left-0 w-15 h-15 bg-indigo-500 square pointer-events-none z-50 mix-blend-difference");
      el.addEventListener("mouseleave", () => cursor.className = "fixed top-0 left-0 w-8 h-8 bg-indigo-500 circle pointer-events-none z-50 mix-blend-difference");
    });
  
    // Example: Switch to diamond when hovering over h1
    document.querySelectorAll("h1, p,h2,h3").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.className = "fixed top-0 left-0 w-30 h-30 rounded-sm bg-indigo-500 circle pointer-events-none z-50 mix-blend-difference");
      el.addEventListener("mouseleave", () => cursor.className = "fixed top-0 left-0 w-8 h-8 bg-indigo-500 circle pointer-events-none z-50 mix-blend-difference");
    });
 }
    dotButton();

const reviewSlider = () => {

  const topSwiper = new Swiper('.topSwiper', {
    slidesPerView: 'auto',
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    speed: 4000,
    grabCursor: true,
  });

  const bottomSwiper = new Swiper('.bottomSwiper', {
    slidesPerView: 'auto',
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      reverseDirection: true,
    },
    speed: 4000,
    grabCursor: true,
  });


}
reviewSlider();

const pricing = async () => {
  await fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const countryCode = data.country;
      const showINR = countryCode === "IN";
      console.log(showINR)

      // Get all elements with class "inr" and "usd"
      const inrPrices = document.querySelectorAll('.inr');
      const usdPrices = document.querySelectorAll('.usd');

      // Show INR, hide USD
      inrPrices.forEach(el => {
        el.classList.toggle('hidden', !showINR);
      });
      usdPrices.forEach(el => {
        el.classList.toggle('hidden', showINR);
      });
    });
};

// Wait for DOM to load before running
document.addEventListener("DOMContentLoaded", pricing);

