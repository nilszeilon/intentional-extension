(function() {
  const INCLUDE_KEY = 'includedDomains';
  const PAUSE_KEY = 'pausedUntil';

  function getSettings(callback) {
    chrome.storage.local.get([INCLUDE_KEY, PAUSE_KEY], (result) => {
      const included = result[INCLUDE_KEY] || [];
      const pausedUntil = result[PAUSE_KEY] || 0;
      callback({ included, pausedUntil });
    });
  }

  function shouldIncludeDomain(included) {
    const hostname = window.location.hostname;
    if (!included || included.length === 0) return true;
    return included.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  // Prompt logic: initial and follow-up with "Take me away"
  function showPrompt() {
    if (window.__intentionalPromptActive) return;
    window.__intentionalPromptActive = true;

    const interval = 15 * 60 * 1000;
    const now = Date.now();
    const last = parseInt(window.sessionStorage.getItem('intentional_lastPrompt'), 10) || 0;
    const lastIntention = window.sessionStorage.getItem('intentional_lastIntention') || '';
    // Zen messages cycling
    const zenMessages = [
      'Time is precious. Leave now and reclaim your day.',
      'Your real life awaits. Close this tab and find peace.',
      'Every moment online is a moment lost. Save time by leaving.',
      'Less scrolling, more living. Leave now.',
      'Don’t let the internet steal your time. Close this tab.'
    ];
    let zenIndex = parseInt(window.sessionStorage.getItem('intentional_zenIndex'), 10) || 0;
    const zenMessage = zenMessages[zenIndex % zenMessages.length];
    window.sessionStorage.setItem('intentional_zenIndex', zenIndex + 1);

    const overlay = document.createElement('div');
    overlay.id = '__intentionalOverlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0', left: '0', right: '0', bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2147483647
    });
    // Allow Escape key to immediately close tab
    function handleEscape(e) {
      if (e.key === 'Escape') {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        window.__intentionalPromptActive = false;
        chrome.runtime.sendMessage({ action: 'takeAway' });
        document.removeEventListener('keydown', handleEscape);
      }
    }
    document.addEventListener('keydown', handleEscape);

    const message = document.createElement('div');
    message.style.fontSize = '24px';
    message.style.marginBottom = '20px';
    message.style.color = '#fff';

    if (!last || now - last < interval) {
      // Initial intention prompt
      message.textContent = 'What is your intention for visiting this site?';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter your intention...';
      Object.assign(input.style, {
        padding: '10px',
        fontSize: '18px',
        width: '50%',
        maxWidth: '400px',
        backgroundColor: '#fff',
        color: '#000',
        border: '1px solid #000',
        borderRadius: '4px'
      });

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Confirm';
      Object.assign(confirmBtn.style, {
        marginTop: '20px',
        padding: '10px 20px',
        fontSize: '18px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '4px'
      });
      confirmBtn.onclick = () => {
        document.removeEventListener('keydown', handleEscape);
        const val = input.value.trim();
        if (!val) {
          alert('Please enter your intention.');
          return;
        }
        document.body.removeChild(overlay);
        window.__intentionalPromptActive = false;
        window.sessionStorage.setItem('intentional_lastPrompt', Date.now());
        window.sessionStorage.setItem('intentional_lastIntention', val);
        setTimeout(showPrompt, interval);
      };

      // Allow Enter key to submit intention
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        }
      });
      overlay.appendChild(message);
      overlay.appendChild(input);

      // Display a zen message encouraging to leave
      const zenDiv = document.createElement('div');
      zenDiv.textContent = zenMessage;
      Object.assign(zenDiv.style, {
        color: '#ccc',
        margin: '10px',
        fontSize: '16px',
        fontStyle: 'italic'
      });
      overlay.appendChild(zenDiv);

      overlay.appendChild(confirmBtn);

      // Add option to close tab immediately
      const leaveBtn = document.createElement('button');
      leaveBtn.textContent = 'Take me away';
      Object.assign(leaveBtn.style, {
        marginTop: '20px',
        padding: '10px 20px',
        fontSize: '18px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '4px'
      });
      leaveBtn.onclick = () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.removeChild(overlay);
        window.__intentionalPromptActive = false;
        chrome.runtime.sendMessage({ action: 'takeAway' });
      };
      overlay.appendChild(leaveBtn);

      document.body.appendChild(overlay);
      input.focus();
    } else {
      // Follow-up prompt
      message.textContent = `You intended: "${lastIntention}". Do you want to continue?`;

      const continueBtn = document.createElement('button');
      continueBtn.textContent = 'Continue';
      Object.assign(continueBtn.style, {
        margin: '10px',
        padding: '10px 20px',
        fontSize: '18px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '4px'
      });
      continueBtn.onclick = () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.removeChild(overlay);
        window.__intentionalPromptActive = false;
        window.sessionStorage.setItem('intentional_lastPrompt', Date.now());
        setTimeout(showPrompt, interval);
      };

      const takeAwayBtn = document.createElement('button');
      takeAwayBtn.textContent = 'Take me away';
      Object.assign(takeAwayBtn.style, {
        margin: '10px',
        padding: '10px 20px',
        fontSize: '18px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '4px'
      });
      takeAwayBtn.onclick = () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.removeChild(overlay);
        window.__intentionalPromptActive = false;
        // Close this tab via background
        chrome.runtime.sendMessage({ action: 'takeAway' });
      };

      overlay.appendChild(message);

      // Display a zen message encouraging to leave
      const zenDiv = document.createElement('div');
      zenDiv.textContent = zenMessage;
      Object.assign(zenDiv.style, {
        color: '#ccc',
        margin: '10px',
        fontSize: '16px',
        fontStyle: 'italic'
      });
      overlay.appendChild(zenDiv);

      overlay.appendChild(continueBtn);
      overlay.appendChild(takeAwayBtn);
      document.body.appendChild(overlay);
    }
  }

  function init() {
    getSettings(settings => {
      const now = Date.now();
      if (settings.pausedUntil && now < settings.pausedUntil) return;
      if (!shouldIncludeDomain(settings.included)) return;
      // Throttle prompts: do not re-prompt on page reload within interval
      const interval = 15 * 60 * 1000;
      const last = parseInt(window.sessionStorage.getItem('intentional_lastPrompt'), 10) || 0;
      if (last && now - last < interval) {
        // schedule next prompt after remaining time
        const remaining = interval - (now - last);
        setTimeout(showPrompt, remaining);
      } else {
        showPrompt();
      }
    });
  }

  init();
})();