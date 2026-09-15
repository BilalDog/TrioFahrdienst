export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA-Installierbarkeit ist ein optionales Extra, kein kritischer Pfad.
    });
  });
}
