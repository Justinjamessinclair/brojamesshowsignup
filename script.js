// script.js
(() => {
  const signupForm   = document.getElementById('signup-form');
  const postSignup   = document.getElementById('post-signup');
  const heroHeader   = document.querySelector('.hero h1');
  const heroImage    = document.querySelector('.artist-pic');
  const feedbackForm = document.getElementById('feedback-form');
  
  // Replace with your NEW web app URL from Step 2
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwGdU2Hr3NT9MfCS20UzSJdLdg5YQEymAWs-Erm5Gtkim7dP8SWC-L41dz15TcnMRAo/exec';

  function toggle(el, show) {
    el.classList[show ? 'remove' : 'add']('hidden');
  }

  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const zip   = signupForm.zip.value.trim();
    if (!name || !email || !zip) return alert('Please fill out all fields.');

    // Basic validation
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const zipRx   = /^\d{5}$/;
    if (!emailRx.test(email)) return alert('Invalid email.');
    if (!zipRx.test(zip))     return alert('Invalid zip code.');

    // Show loading state
    const submitBtn = signupForm.querySelector('button');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing up...';

    try {
      // Create form data for application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('zip', zip);
      
      // Modified fetch to work around CORS
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // Important: This allows the request to succeed without CORS headers
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, zip })
      });

      // Since we're using no-cors, we can't access the response
      // Instead, assume success and proceed
      
      // Show success state
      toggle(signupForm, false);
      toggle(postSignup, true);

      // Change header and hide image
      heroHeader.innerHTML =
        '<img src="icons/unlock.png" alt="Unlocked" class="unlock-inline">You\'re in!';
      heroImage.classList.add('hidden');
      
      // 3) Add a class so we can bump the header down
      heroHeader.parentElement.classList.add('extra-space');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Sorry, there was a problem adding you to the list. Please try again!');
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  feedbackForm.addEventListener('submit', e => {
    e.preventDefault();
    const suggestion = feedbackForm.feedback.value.trim();
    if (!suggestion) return;
    
    window.location.href =
      `mailto:justinsinclairsongs@gmail.com?subject=Venue Suggestion&body=${encodeURIComponent(suggestion)}`;
  });
})();
