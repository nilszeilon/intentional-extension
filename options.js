const IGNORE_KEY = 'ignoredDomains';
const PAUSE_KEY = 'pausedUntil';
const AWAY_KEY = 'takeAwayLinks';

function loadOptions() {
  chrome.storage.local.get([IGNORE_KEY, PAUSE_KEY, AWAY_KEY], result => {
    const domains = result[IGNORE_KEY] || [];
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

    // Load Take Me Away links
    const awayLinks = result[AWAY_KEY] || [];
    const awayList = document.getElementById('away-links');
    awayList.innerHTML = '';
    awayLinks.forEach(link => {
      const li = document.createElement('li');
      li.textContent = link + ' ';
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.onclick = () => removeAwayLink(link);
      li.appendChild(btn);
      awayList.appendChild(li);
    });
  });
}

function addAwayLink() {
  const input = document.getElementById('new-away-link');
  const link = input.value.trim();
  if (!link) return;
  chrome.storage.local.get(AWAY_KEY, result => {
    const links = result[AWAY_KEY] || [];
    if (!links.includes(link)) {
      links.push(link);
      chrome.storage.local.set({ [AWAY_KEY]: links }, loadOptions);
    }
  });
  input.value = '';
}

function removeAwayLink(link) {
  chrome.storage.local.get(AWAY_KEY, result => {
    let links = result[AWAY_KEY] || [];
    links = links.filter(l => l !== link);
    chrome.storage.local.set({ [AWAY_KEY]: links }, loadOptions);
  });
}

function addDomain() {
  const input = document.getElementById('new-domain');
  const domain = input.value.trim();
  if (!domain) return;
  chrome.storage.local.get(IGNORE_KEY, result => {
    const domains = result[IGNORE_KEY] || [];
    if (!domains.includes(domain)) {
      domains.push(domain);
      chrome.storage.local.set({ [IGNORE_KEY]: domains }, loadOptions);
    }
  });
  input.value = '';
}

function removeDomain(domain) {
  chrome.storage.local.get(IGNORE_KEY, result => {
    let domains = result[IGNORE_KEY] || [];
    domains = domains.filter(d => d !== domain);
    chrome.storage.local.set({ [IGNORE_KEY]: domains }, loadOptions);
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
  document.getElementById('add-away-link').addEventListener('click', addAwayLink);
  loadOptions();
});