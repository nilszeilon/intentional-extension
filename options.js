const INCLUDE_KEY = 'includedDomains';
const PAUSE_KEY = 'pausedUntil';

function loadOptions() {
  chrome.storage.local.get([INCLUDE_KEY, PAUSE_KEY], result => {
    const domains = result[INCLUDE_KEY] || [];
    const pausedUntil = result[PAUSE_KEY] || 0;

    const domainsList = document.getElementById('domains');
    domainsList.innerHTML = '';
    domains.forEach(domain => {
      const li = document.createElement('li');
      li.textContent = domain + ' ';
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.onclick = () => removeDomain(domain);
      li.appendChild(btn);
      domainsList.appendChild(li);
    });

    const status = document.getElementById('pause-status');
    const now = Date.now();
    if (pausedUntil && now < pausedUntil) {
      const mins = Math.ceil((pausedUntil - now) / 60000);
      status.textContent = 'Paused for ' + mins + ' more minute(s).';
    } else {
      status.textContent = 'Extension is active.';
    }

  });
}


function addDomain() {
  const input = document.getElementById('new-domain');
  const domain = input.value.trim();
  if (!domain) return;
  chrome.storage.local.get(INCLUDE_KEY, result => {
    const domains = result[INCLUDE_KEY] || [];
    if (!domains.includes(domain)) {
      domains.push(domain);
      chrome.storage.local.set({ [INCLUDE_KEY]: domains }, loadOptions);
    }
  });
  input.value = '';
}

function removeDomain(domain) {
  chrome.storage.local.get(INCLUDE_KEY, result => {
    let domains = result[INCLUDE_KEY] || [];
    domains = domains.filter(d => d !== domain);
    chrome.storage.local.set({ [INCLUDE_KEY]: domains }, loadOptions);
  });
}

function pauseExtension() {
  const mins = parseInt(document.getElementById('pause-minutes').value, 10);
  if (isNaN(mins) || mins <= 0) return;
  const until = Date.now() + mins * 60000;
  chrome.storage.local.set({ [PAUSE_KEY]: until }, loadOptions);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-domain').addEventListener('click', addDomain);
  document.getElementById('pause-button').addEventListener('click', pauseExtension);
  loadOptions();
});