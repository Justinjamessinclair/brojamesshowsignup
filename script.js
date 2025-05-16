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
    const name    = signupForm.name.value.trim();
    const email   = signupForm.email.value.trim();
    const zip     = signupForm.zip.value.trim();
    const consent = signupForm.consent.checked; // Will add this checkbox below
    
    if (!name || !email || !zip || !consent) {
      return alert('Please fill out all fields and agree to join the mailing list.');
    }

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

    // First backup: Save to localStorage in case submission fails
    try {
      const timestamp = new Date().toISOString();
      const backupData = { name, email, zip, consent, timestamp, submitted: false };
      localStorage.setItem(`signup_${email}`, JSON.stringify(backupData));
      
      // Main submission logic
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, email, zip, consent, 
          token: "your-secret-here" // Same token as server
        })
      });
      
      // Mark as submitted in localStorage
      backupData.submitted = true;
      localStorage.setItem(`signup_${email}`, JSON.stringify(backupData));
      
      // Show success state
      toggle(signupForm, false);
      toggle(postSignup, true);
      
      // Scroll up so the new section is at the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Update header + icon as before
      heroHeader.innerHTML =
        '<img src="icons/unlock.png" alt="Unlocked" class="unlock-inline">You\'re in!';
      heroImage.classList.add('hidden');
      
      // 3) Add a class so we can bump the header down
      heroHeader.parentElement.classList.add('extra-space');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Second backup: Send via email if available
      const mailtoLink = `mailto:backup@yourdomain.com?subject=Signup%20Backup&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0AZip:%20${encodeURIComponent(zip)}%0AConsent:%20${consent}`;
      
      const backupConfirm = confirm('There was a problem connecting to our server. Would you like to send your info via email instead?');
      
      if (backupConfirm) {
        window.location.href = mailtoLink;
      } else {
        alert('Your information has been saved locally. Try submitting again later.');
      }
      
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
  
  // Add recovery function to check for pending submissions on page load
  function checkPendingSubmissions() {
    // Look for any pending submissions in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('signup_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!data.submitted) {
            // Found unsubmitted data - could offer to retry
            console.log('Found pending submission:', data);
            // You could show a notification to the user
          }
        } catch (e) {
          console.error('Error parsing stored submission', e);
        }
      }
    }
  }

  // Call this when page loads
  window.addEventListener('load', checkPendingSubmissions);
})();
