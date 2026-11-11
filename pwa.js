/* Installation enhances the existing page; it never blocks recitation. */
(() => {
  const status = document.getElementById('pwaStatus');
  const setStatus = message => { status.textContent = message; };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    setStatus('Offline installation requires HTTPS (or localhost for testing).');
    return;
  }
  let ready = false;
  let updateWaiting = false;
  const workerURL = new URL('./sw.js', location.href).href;
  const renderStatus = () => {
    if (updateWaiting) {
      setStatus('Update ready — close all app windows and reopen to apply.');
    } else if (ready) {
      setStatus(navigator.onLine ? 'Ready offline · Add to your Home Screen to install.' : 'Ready offline · You are offline.');
    }
  };
  const markReady = () => {
    if (navigator.serviceWorker.controller?.scriptURL === workerURL) {
      ready = true;
      renderStatus();
    }
  };
  navigator.serviceWorker.addEventListener('controllerchange', markReady);
  window.addEventListener('online', renderStatus);
  window.addEventListener('offline', renderStatus);
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
    .then(registration => {
      const checkWaiting = () => {
        updateWaiting = Boolean(registration.waiting && navigator.serviceWorker.controller);
        renderStatus();
      };
      checkWaiting();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (worker) worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') checkWaiting();
          if (worker.state === 'redundant' && !ready) setStatus('Offline setup failed. Reopen online to retry.');
        });
      });
      return navigator.serviceWorker.ready;
    })
    .then(markReady)
    .catch(error => {
      console.warn('Offline setup failed:', error);
      setStatus('Offline setup failed. Reopen online to retry.');
    });
})();
