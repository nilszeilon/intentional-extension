(function() {
  const IGNORE_KEY = 'ignoredDomains';
  const PAUSE_KEY = 'pausedUntil';

  function getSettings(callback) {
    chrome.storage.local.get([IGNORE_KEY, PAUSE_KEY], (result) => {
      const ignored = result[IGNORE_KEY] || [];
      const pausedUntil = result[PAUSE_KEY] || 0;
      callback({ ignored, pausedUntil });
    });
  }

  function shouldIgnoreDomain(ignored) {
    const hostname = window.location.hostname;
    return ignored.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  function showPrompt() {
    if (window.__intentionalPromptActive) return;
    window.__intentionalPromptActive = true;

    const overlay = document.createElement('div');
    overlay.id = '__intentionalOverlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2147483647
    });

    const message = document.createElement('div');
    message.textContent = 'What is your intention for visiting this site?';
    message.style.fontSize = '24px';
    message.style.marginBottom = '20px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your intention...';
    Object.assign(input.style, {
      padding: '10px',
      fontSize: '18px',
      width: '50%',
      maxWidth: '400px',
      border: 'none',
      borderRadius: '4px'
    });

    const button = document.createElement('button');
    button.textContent = 'Confirm';
    Object.assign(button.style, {
      marginTop: '20px',
      padding: '10px 20px',
      fontSize: '18px',
      cursor: 'pointer'
    });

    button.onclick = () => {
      const val = input.value.trim();
      if (!val) {
        alert('Please enter your intention.');
        return;
      }
      document.body.removeChild(overlay);
      window.__intentionalPromptActive = false;
      window.sessionStorage.setItem('intentional_lastPrompt', Date.now());
      setTimeout(showPrompt, 15 * 60 * 1000);
    };

    overlay.appendChild(message);
    overlay.appendChild(input);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
    input.focus();
  }

  function init() {
    getSettings(settings => {
      const now = Date.now();
      if (settings.pausedUntil && now < settings.pausedUntil) return;
      if (shouldIgnoreDomain(settings.ignored)) return;
      showPrompt();
    });
  }

  init();
})();