
    const header = document.querySelector('header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');
    const navItems = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    function toggleNav() {
      navLinks.classList.toggle('nav-active');
      hamburger.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('nav-active') ? 'hidden' : 'auto';
    }

    hamburger.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        navItems.forEach((link) => link.classList.remove('active'));
        e.target.classList.add('active');
        toggleNav();
      });
    });
    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        navItems.forEach((link) => link.classList.remove('active')); // Remove active from all
        e.target.classList.add('active'); // Add active to the clicked item
        navLinks.classList.remove('nav-active'); // Close nav on click
        hamburger.classList.remove('active'); // Change hamburger icon back
        overlay.classList.remove('active'); // Remove overlay
      });
    });

    const facts = [
      "The first computer mouse was made of wood in 1964 by Doug Engelbart.",
      "The term 'bug' in computing came from an actual moth found in the Harvard Mark II computer in 1947.",
      "The first computer programmer was Ada Lovelace, who wrote the first algorithm for a machine in the 1840s.",
      "The QWERTY keyboard layout was designed in 1873 to slow down typists and prevent jamming on mechanical typewriters.",
      "The first computer virus was created in 1983 by Fred Cohen as an experiment in computer security.",
      "The @ symbol used in email addresses was chosen by Ray Tomlinson in 1971 when he invented email.",
      "The first webcam was created at the University of Cambridge to monitor a coffee pot.",
      "The world's first computer, ENIAC, weighed more than 27 tons and took up 1800 square feet.",
      "The first hard drive was created by IBM in 1956 and could store only 5 MB of data.",
      "The popular programming language Python is named after the British comedy group Monty Python.",
      "The first tweet was sent by Jack Dorsey, Twitter's creator, on March 21, 2006. It said 'just setting up my twttr'.",
      "The first computer game, 'Spacewar!', was created in 1962 by Steve Russell, Martin Graetz, and Wayne Wiitanen.",
      "The first smartphone, IBM Simon, was introduced in 1994 and had a touchscreen and email capability.",
      "The most expensive domain name ever sold was Cars.com for $872 million in 2015.",
      "The first computer password was created in 1961 at MIT for the Compatible Time-Sharing System.",
    ];

    const factDisplay = document.getElementById('fact-display');
    let currentCharIndex = 0;
    let isTyping = false;
    let currentFact = '';

    function getRandomFact() {
      return facts[Math.floor(Math.random() * facts.length)];
    }

    function typeWriter() {
      if (currentCharIndex < currentFact.length) {
        factDisplay.innerHTML += currentFact.charAt(currentCharIndex);
        currentCharIndex++;
        setTimeout(typeWriter, 50);
      } else {
        isTyping = false;
        setTimeout(eraseText, 5000);
      }
    }

    function eraseText() {
      if (factDisplay.innerHTML.length > 0) {
        factDisplay.innerHTML = factDisplay.innerHTML.slice(0, -1);
        setTimeout(eraseText, 20);
      } else {
        currentFact = getRandomFact();
        currentCharIndex = 0;
        setTimeout(startTyping, 1000);
      }
    }

    function startTyping() {
      if (!isTyping) {
        isTyping = true;
        typeWriter();
      }
    }

    currentFact = getRandomFact();
    startTyping();
    // New JavaScript for card animations
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      }
  
      function animateCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
          if (isElementInViewport(card)) {
            card.style.animationPlayState = 'running';
          }
        });
      }
  
      window.addEventListener('load', animateCards);
      window.addEventListener('scroll', animateCards);
  // Updated JavaScript for card animations including NIELIT card
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function animateCards() {
    const cards = document.querySelectorAll('.card, .nielit-card');
    cards.forEach(card => {
      if (isElementInViewport(card)) {
        card.style.animationPlayState = 'running';
      }
    });
  }

  window.addEventListener('load', animateCards);
  window.addEventListener('scroll', animateCards);
//   loder
window.onload = function() {
  document.querySelector('.container').style.display = 'none';
  // Show your main content after loader disappears
};


  