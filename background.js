// Background service worker to handle tab closing and opening for "Take me away"
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'takeAway') {
    // Close the originating tab
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }
});