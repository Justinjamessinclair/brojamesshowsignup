// script.js
(() => {
  const signupForm   = document.getElementById('signup-form');
  const postSignup   = document.getElementById('post-signup');
  const heroHeader   = document.querySelector('.hero h1');
  const heroImage    = document.querySelector('.artist-pic');
  const feedbackForm = document.getElementById('feedback-form');
  
  // Replace with your web app URL from Step 3
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx16Pt75U2fPpbgCFyPorb6ndBEJ6cXu-FEIW3aNcbV3ZeVrq2fVN9fjkBl6zXMVVk03A/exec';

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
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing up...';

    try {
      // Send data to Google Sheet
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, zip })
      });
      
      // Check if submission was successful
      const result = await response.json();
      
      if (result.result === 'success') {
        // Show success state
        toggle(signupForm, false);
        toggle(postSignup, true);

        // Change header and hide image
        heroHeader.innerHTML = '<span class="emoji-inline">✅</span>You\'re in!';
        heroImage.classList.add('hidden');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Sorry, there was a problem adding you to the list. Please try again!');
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
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
