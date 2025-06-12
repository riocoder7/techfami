
const Splash_Screen = () => {
    document.body.classList.add("no-scroll");
 // GSAP Splash Screen Animation
 window.addEventListener("load", () => {
    gsap.to("#splash-logo", { y: -20, opacity: 1, duration: 1 });
    gsap.to("#splash-loading", { y: 10, opacity: 1, delay: 0.5, duration: 1 });

    let counter = { val: 0 };
    gsap.to(counter, {
      val: 100,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        document.getElementById("countup").innerText = `${Math.floor(counter.val)}%`;
      },
      onComplete: () => {
        gsap.to("#splash", {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            document.getElementById("splash").style.display = "none";
            document.body.classList.remove("no-scroll"); // Re-enable scrolling
            document.getElementById("header").classList.remove("hidden");
            document.getElementById("whatapps").classList.remove("hidden");
          }
        });
      }
    });
  });
  
}
Splash_Screen();



  const troglemanu = () => {
      // Select elements
      const menuToggle = document.getElementById('menu-toggle');
      const menuClose = document.getElementById('menu-close');
      const mobileMenu = document.getElementById('mobile-menu');
      const backdrop = document.getElementById('backdrop');
  
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



